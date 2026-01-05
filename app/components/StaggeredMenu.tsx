"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight } from "lucide-react";
import Link from "next/link";

const menuItems = [
    { title: "Home", href: "/" },
    { title: "About", href: "#" },
    { title: "Institutes", href: "#" },
    { title: "YIP Discord", href: "https://discord.gg/ZnnpAyrtC", external: true },
    { title: "Contact", href: "#" },
];

const drawerVars = {
    initial: { x: "100%" },
    animate: {
        x: 0,
        transition: { type: "spring", stiffness: 300, damping: 30 } as any
    },
    exit: {
        x: "100%",
        transition: { type: "spring", stiffness: 300, damping: 30 } as any
    },
};

const overlayVars = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

export default function SideDrawer() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="z-[99] relative text-white hover:text-gray-300 transition-colors"
            >
                <Menu size={28} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            variants={overlayVars}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            onClick={() => setOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[98]"
                        />

                        {/* Side Drawer */}
                        <motion.div
                            variants={drawerVars}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="fixed right-0 top-0 h-screen w-80 bg-[#0a0a0a] border-l border-white/10 z-[99] flex flex-col p-8 shadow-2xl"
                        >
                            <div className="flex justify-end mb-12">
                                <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white">
                                    <X size={28} />
                                </button>
                            </div>

                            <div className="flex flex-col gap-6">
                                {menuItems.map((link, index) => (
                                    <Link
                                        key={index}
                                        href={link.href}
                                        onClick={() => setOpen(false)}
                                        target={link.external ? "_blank" : "_self"}
                                        className="text-2xl font-bold text-white hover:text-gray-300 transition-colors flex items-center justify-between group"
                                    >
                                        {link.title}
                                        {link.external && <ArrowRight size={20} className="-rotate-45 opacity-0 group-hover:opacity-100 transition-opacity" />}
                                    </Link>
                                ))}
                            </div>

                            <div className="mt-auto text-sm text-gray-600">
                                © 2026 Sparkhub AI
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
