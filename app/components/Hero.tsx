import Link from "next/link";

export default function Hero() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6">
                Sparkhub AI
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12">
                Unlock your potential. Discover your perfect career path with our intelligent aptitude counselor.
            </p>

            <Link
                href="/chat"
                className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full bg-white px-8 font-medium text-black transition-all duration-300 hover:bg-gray-200 hover:w-56 w-48"
            >
                <span className="mr-2">Start Chatting</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
            </Link>

            <div className="mt-16 flex gap-8 text-sm text-gray-600">
                <div>Based on VHSE SparkHub</div>
                <div>·</div>
                <div>Localized for Kerala</div>
                <div>·</div>
                <div>Free & Open</div>
            </div>
        </div>
    );
}
