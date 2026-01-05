export default function Footer() {
    return (
        <footer className="w-full border-t border-white/5 py-8 bg-black">
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center gap-4 text-center">
                <div className="text-sm text-gray-600">
                    © 2026 <span className="text-white font-medium">SparkHub</span>. All rights reserved.
                </div>
                <div className="flex gap-6 text-sm">
                    <a href="#" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="text-gray-500 hover:text-white transition-colors">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
}
