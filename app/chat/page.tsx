import ChatInterface from "../components/ChatInterface";

export default function ChatPage() {
    return (
        <div className="flex flex-col min-h-screen bg-black">
            <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto w-full">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold rotate-45 rounded-md">
                            S
                        </div>
                        <span className="font-bold text-lg tracking-tight text-white">Sparkhub</span>
                    </div>
                    {/*  Add UserButton here if we want headers on chat page too, for now keeping it simple as per design */}
                </div>
            </header>

            <main className="flex-1 flex flex-col justify-center w-full max-w-7xl mx-auto px-4 pt-20">
                <ChatInterface />
            </main>
        </div>
    );
}
