"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingNavbar() {
  return (
    <nav className="sticky top-0 z-50 navbar-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link href="/">
            <span className="text-2xl font-bold text-gradient-purple cursor-pointer">Zeur</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="text-slate-300 hover:text-white transition-colors">
            How It Works
          </a>
          <a href="#stats" className="text-slate-300 hover:text-white transition-colors">
            Stats
          </a>
        </div>

        <Link href="/dashboard">
          <Button className="btn-primary-purple rounded-lg px-6 py-2">Launch App</Button>
        </Link>
      </div>
    </nav>
  )
}