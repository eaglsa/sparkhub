import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { OpenAI } from "openai";
import { CosmosClient } from "@azure/cosmos";
import { SearchClient, AzureKeyCredential } from "@azure/search-documents";

// Helper to get clients lazily
function getClients() {
    // 1. Groq / OpenAI
    const apiKey = process.env.GROQ_API_KEY || "";
    // Check for xAI prefix to help user or auto-fallback
    const baseURL = apiKey.startsWith("xai-")
        ? "https://api.x.ai/v1"
        : "https://api.groq.com/openai/v1";

    const groq = new OpenAI({
        baseURL,
        apiKey,
    });

    // 2. Azure Search
    let searchClient = null;
    const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
    const searchKey = process.env.AZURE_SEARCH_ADMIN_KEY;
    if (searchEndpoint && searchKey) {
        try {
            searchClient = new SearchClient(
                searchEndpoint,
                "vhse-career-index",
                new AzureKeyCredential(searchKey)
            );
        } catch (e) {
            console.error("Failed to init Search Client:", e);
        }
    }

    // 3. Cosmos DB
    let cosmosClient = null;
    const connectionString = process.env.COSMOS_CONNECTION_STRING;

    // Debug logging (masked)
    console.log("Config Check:");
    console.log("- Groq Key:", apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : "MISSING");
    console.log("- Base URL:", baseURL);
    console.log("- Search EP:", searchEndpoint);

    // Combined logic: Prefer Connection String, fallback to legacy
    if (connectionString && connectionString.includes("AccountKey=")) {
        try {
            cosmosClient = new CosmosClient(connectionString);
        } catch (e) {
            console.error("Invalid Cosmos Connection String:", e);
        }
    } else {
        const endpoint = process.env.COSMOS_DB_ENDPOINT;
        const key = process.env.COSMOS_DB_KEY;
        if (endpoint && key) {
            try {
                cosmosClient = new CosmosClient({ endpoint, key });
            } catch (e) {
                console.error("Invalid Cosmos Endpoint/Key:", e);
            }
        }
    }

    return { groq, searchClient, cosmosClient };
}

export async function POST(req: Request) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { messages } = await req.json();
        const lastMessage = messages[messages.length - 1];
        const userQuery = lastMessage.content;

        // Init clients inside request to capture config errors safely
        const { groq, searchClient, cosmosClient } = getClients();

        // 1. Retrieve Context from Azure AI Search
        console.log(`Searching for: ${userQuery}`);
        let searchContext = "";

        interface CareerDoc {
            title: string;
            content: string;
            url?: string;
        }

        if (searchClient) {
            try {
                const searchResults = await searchClient.search(userQuery, {
                    top: 3,
                    select: ["content", "title", "url"]
                });

                for await (const result of searchResults.results) {
                    const doc = result.document as unknown as CareerDoc;
                    const title = doc.title || "No Title";
                    const content = doc.content || "";
                    searchContext += `Title: ${title}\nContent: ${content}\n\n`;
                }
            } catch (searchError) {
                console.error("Azure Search Error:", searchError);
                searchContext = "Context retrieval failed (Search Error).";
            }
        } else {
            console.warn("Search Client not initialized (Missing Config).");
            searchContext = "Context retrieval unavailable (Configuration Missing).";
        }

        // 2. Construct System Prompt with Context
        const systemPrompt = `You are Sparkbot, a helpful career guidance counselor for students in Kerala.
        
Context from Knowledge Base:
${searchContext}

Use the above context to answer the user's question. If the answer is not in the context, use your general knowledge but mention that it's outside the specific VHSE database. Keep answers relevant to Kerala/Indian education context when possible.`;

        // Clean messages for Groq/Llama
        // Remove 'id', 'revisionId' or other Clerk/DB artifacts that might be in the request object
        // Only keep 'role' and 'content' as strictly expected by OpenAI/Groq API
        const cleanMessages = messages.map((m: any) => ({
            role: m.role,
            content: m.content
        }));

        // 3. Generate Response
        const response = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...cleanMessages
            ],
            // Use user preferred model or safe default
            model: "llama-3.3-70b-versatile",
        });

        const aiMessageContent = response.choices[0].message.content;

        // 4. Persist to Cosmos DB
        if (cosmosClient) {
            try {
                const database = cosmosClient.database(process.env.COSMOS_DB_DATABASE || "SparkhubDB");
                const container = database.container(process.env.COSMOS_DB_CONTAINER || "Conversations");

                const record = {
                    id: `${userId}-${Date.now()}`,
                    userId: userId,
                    userMessage: userQuery,
                    aiResponse: aiMessageContent,
                    searchContext: searchContext,
                    timestamp: new Date().toISOString(),
                    model: "llama-3.3-70b-versatile"
                };

                await container.items.create(record);
            } catch (dbError) {
                console.error("Cosmos DB Write Error:", dbError);
            }
        } else {
            console.warn("Cosmos Client not initialized. Skipping persistence.");
        }

        return NextResponse.json({ message: aiMessageContent });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
