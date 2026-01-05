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
            } else if (lastUserMessage.includes("code") || lastUserMessage.includes("program") || lastUserMessage.includes("react")) {
                responseText = "That's a great skill! Here is a simple React component example:\n\n```jsx\nfunction Hello() {\n  return <h1>Hello World</h1>;\n}\n```\n\nProgramming suggests a strong logical aptitude. Would you consider Computer Science Engineering?";
            } else if (lastUserMessage.includes("science") || lastUserMessage.includes("bio") || lastUserMessage.includes("chem")) {
                responseText = "**Science is fascinating.** \n\nIf you enjoy biology, options like *MBBS, BDS, or Biotechnology* are excellent. If you prefer physics/math, *Engineering or Architecture* might be better. Which subject do you score highest in?";
            } else if (lastUserMessage.includes("art") || lastUserMessage.includes("draw") || lastUserMessage.includes("design")) {
                responseText = "Creativity is widely valued today! \n\n- **Graphic Design**\n- **Fine Arts**\n- **UI/UX Design**\n\nHave you considered the *Humanities* stream in Plus Two?";
            } else {
                responseText = "I see. I can answer **any** question you have. Try asking me about *specific colleges in Kerala* or *how to start learning Python*. \n\n(Note: Connect Azure keys to unlock my full brain!)";
            }

            return NextResponse.json({
                message: responseText
            });
        }

        const client = new AzureOpenAI({ endpoint, apiKey, deployment, apiVersion: "2024-05-01-preview" });

        // "Gemini-Class" System Prompt
        const systemPrompt = `You are Sparkbot, an advanced, friendly, and highly intelligent AI assistant by SparkHub. 
    
    Guidelines:
    1. **Identity**: You are helpful, kind, and smart. You are NOT Grok or ChatGPT. You are Sparkbot.
    2. **Capabilities**: You can answer ANY question (coding, math, history, general knowledge).
    3. **Aptitude Focus**: While you are a general assistant, you should gently steer the conversation towards career guidance if the user seems unsure about their future.
    4. **Tone**: Professional yet approachable. Use Emoji sparingly.
    5. **Formatting**: Use Markdown freely. Use **bold** for emphasis, *italics* for nuance, and \`code blocks\` for technical content.
    
    Current Goal: Assess the user's aptitude and interests to recommend a career path, but answer all their side questions fully first.`;

        const completion = await client.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: deployment,
        });

        return NextResponse.json({ message: completion.choices[0].message.content });

    } catch (error: any) {
        console.error("Azure OpenAI Error:", error);
        return NextResponse.json({ error: "Failed to generate response." }, { status: 500 });
    }
}
