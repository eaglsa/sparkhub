import { NextResponse } from 'next/server';
import { AzureOpenAI } from 'openai';

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const apiKey = process.env.AZURE_OPENAI_API_KEY;
        const deployment = "gpt-35-turbo";

        // Graceful fallback if keys aren't set (Simulation Mode)
        if (!endpoint || !apiKey) {
            console.warn("Missing Azure credentials. Returning simulated response.");
            await new Promise(resolve => setTimeout(resolve, 1500)); // Thinking time

            const lastUserMessage = messages[messages.length - 1].content.toLowerCase();
            let responseText = "";

            // Advanced "Simulation" Logic to mimic AI behavior without keys
            if (messages.length <= 2) {
                responseText = "I'm ready. I can help with **coding**, **math**, **career advice**, or just having a chat. \n\nTo start our aptitude check: *Do you find yourself more drawn to creative arts 🎨 or scientific experiments 🧪?*";
            } else if (lastUserMessage.includes("code") || lastUserMessage.includes("program") || lastUserMessage.includes("react") || lastUserMessage.includes("software")) {
                responseText = "That's a great skill! Here is a simple React component example:\n\n```jsx\nfunction Hello() {\n  return <h1>Hello World</h1>;\n}\n```\n\nProgramming suggests a strong logical aptitude. Would you consider Computer Science Engineering?";
            } else if (lastUserMessage.includes("science") || lastUserMessage.includes("bio") || lastUserMessage.includes("chem") || lastUserMessage.includes("physics")) {
                responseText = "**Science is fascinating.** \n\nIf you enjoy biology, options like *MBBS, BDS, or Biotechnology* are excellent. If you prefer physics/math, *Engineering or Architecture* might be better. Which subject do you score highest in?";
            } else if (lastUserMessage.includes("art") || lastUserMessage.includes("draw") || lastUserMessage.includes("design") || lastUserMessage.includes("write")) {
                responseText = "Creativity is widely valued today! \n\n- **Graphic Design**\n- **Fine Arts**\n- **UI/UX Design**\n\nHave you considered the *Humanities* stream in Plus Two?";
            } else if (lastUserMessage.includes("bye") || lastUserMessage.includes("goodbye") || lastUserMessage.includes("cya")) {
                responseText = "Goodbye! Feel free to come back whenever you need career guidance. Best of luck! 👋";
            } else if (lastUserMessage.includes("hi") || lastUserMessage.includes("hello") || lastUserMessage.includes("hey")) {
                responseText = "Hello again! How can I help you regarding your studies or career planning?";
            } else if (lastUserMessage.includes("thank")) {
                responseText = "You're welcome! Happy to help.";
            } else if (lastUserMessage.includes("azure") || lastUserMessage.includes("key")) {
                responseText = "To enable my full intelligence, please add `AZURE_OPENAI_API_KEY` and `AZURE_OPENAI_ENDPOINT` to your environment variables.";
            } else {
                // Dynamic fallback that repeats user input slightly to feel less static
                responseText = `That's interesting regarding "${lastUserMessage}". \n\nSince I'm currently in **Offline Demo Mode**, I can only answer specifically about *Science, Commerce, Arts, or specific career paths*. \n\n*Please add Azure Keys to unlock my full conversational brain!*`;
            }

            return NextResponse.json({
                message: responseText
            });
        }

        // Check for Search keys (Optional but recommended for RAG)
        const searchEndpoint = process.env.AZURE_SEARCH_ENDPOINT;
        const searchKey = process.env.AZURE_SEARCH_KEY;
        const searchIndex = "career-paths"; // Default index name

        const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion: "2024-05-01-preview" });

        // "Gemini-Class" System Prompt
        const systemPrompt = `You are Sparkbot, an advanced, friendly, and highly intelligent AI assistant by SparkHub. 
    
    Guidelines:
    1. **Identity**: You are helpful, kind, and smart. You are Sparkbot.
    2. **Capabilities**: You can answer ANY question (coding, math, history, general knowledge).
    3. **RAG/Data**: If you have access to retrieved documents (from Azure Search), USE them to answer specific questions about colleges, courses, or SparkHub data.
    4. **Aptitude Focus**: While you are a general assistant, you should gently steer the conversation towards career guidance if the user seems unsure about their future.
    5. **Tone**: Professional yet approachable. Use Emoji sparingly.
    6. **Formatting**: Use Markdown freely. Use **bold** for emphasis, *italics* for nuance, and \`code blocks\` for technical content.
    
    Current Goal: Assess the user's aptitude and interests to recommend a career path, but answer all their side questions fully first.`;

        // Configure Data Sources (RAG) if keys are present
        const extraBody: any = {};
        if (searchEndpoint && searchKey) {
            extraBody.data_sources = [
                {
                    type: "azure_search",
                    parameters: {
                        endpoint: searchEndpoint,
                        index_name: searchIndex,
                        authentication: {
                            type: "api_key",
                            key: searchKey,
                        },
                    },
                },
            ];
        }

        const completion = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: deployment,
            ...extraBody, // Inject RAG configuration
        });

        return NextResponse.json({ message: completion.choices[0].message.content });

    } catch (error: any) {
        console.error("Azure OpenAI Error:", error);
        return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
    }
}
