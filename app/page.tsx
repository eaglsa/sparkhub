"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Hero from "./components/Hero";
import ChatInterface from "./components/ChatInterface";
import StaggeredMenu from "./components/StaggeredMenu";
import Footer from "./components/Footer";
import { MoveRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {

  return (
    <div className="min-h-screen flex flex-col pt-16">
      <header className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center justify-between px-6 h-16 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-black flex items-center justify-center font-bold rotate-45 rounded-md">
              S
            </div>
            <span className="font-bold text-lg tracking-tight">Sparkhub</span>
          </div>

          {/* Replaced static nav with Staggered Menu */}
          <div className="flex items-center gap-4">
            <button className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors">
              EN / ML
            </button>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-white bg-white/10 px-4 py-2 rounded-full hover:bg-white/20 transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>

            <div className="w-px h-6 bg-gray-800 mx-2 hidden md:block"></div>
            <StaggeredMenu />
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col justify-center w-full max-w-7xl mx-auto px-4">
        <Hero />
      </main>

      <Footer />
    </div>
  );
}
