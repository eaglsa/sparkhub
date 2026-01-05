"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

interface Message {
    id: number;
    role: "user" | "assistant";
    content: string;
}

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([
        { id: 1, role: "assistant", content: "Hello! I'm **Sparkbot**. I'm here to help you with career guidance, aptitude testing, or any other questions you have.  \n\n*Ready to unlock your potential?*" },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMsg: Message = { id: Date.now(), role: "user", content: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMsg] }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to fetch response");
            }

            const data = await response.json();
            setMessages((prev) => [...prev, { id: Date.now() + 1, role: "assistant", content: data.message }]);
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages((prev) => [
                ...prev,
                { id: Date.now() + 1, role: "assistant", content: "I'm currently unable to connect to my neural network (Azure). Please check your internet connection or API keys." }
            ]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="flex flex-col w-full max-w-4xl mx-auto h-[75vh] relative bg-black">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-hide pb-24">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex w-full ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <div
                                className={`max-w-[85%] md:max-w-[70%] p-4 rounded-2xl text-lg leading-relaxed ${msg.role === "user"
                                    ? "bg-[#1a1a1a] text-white rounded-tr-sm"
                                    : "text-white rounded-tl-sm markdown-content"
                                    }`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles size={14} className="text-yellow-400" />
                                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sparkbot</span>
                                    </div>
                                )}
                                {msg.role === "assistant" ? (
                                    <div className="prose prose-invert prose-p:leading-relaxed prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/10">
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                    </div>
                                ) : (
                                    msg.content
                                )}
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex w-full justify-start"
                        >
                            <div className="text-gray-500 text-sm ml-2 flex items-center gap-2 font-mono">
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </AnimatePresence>
            </div>

            <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black to-transparent">
                <div className="relative flex items-center bg-[#111] rounded-full border border-[#333] focus-within:border-white/20 transition-colors shadow-lg">
                    <input
                        type="text"
                        className="w-full bg-transparent text-white p-4 pl-6 outline-none placeholder-gray-600"
                        placeholder="Ask Sparkbot anything..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    />
                    <button
                        onClick={handleSend}
                        disabled={isTyping}
                        className="p-3 mr-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50 hover:bg-white/10 rounded-full"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
