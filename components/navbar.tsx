"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  History,
  Wallet,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const pathname = usePathname()

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/borrow", label: "Borrow", icon: DollarSign },
    { href: "/supply", label: "Supply", icon: TrendingUp },
    { href: "/history", label: "History", icon: History },
  ]

  return (
    <nav className="sticky top-0 z-50 navbar-blur">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient-purple">Zeur</span>
          </Link>
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`text-slate-300 hover:text-white ${
                      isActive ? "text-purple-400" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
            Connected
          </Badge>
          <Button className="btn-secondary-dark rounded-lg">
            <Wallet className="h-4 w-4 mr-2" />
            0x1234...5678
          </Button>
        </div>
      </div>
    </nav>
  )
}