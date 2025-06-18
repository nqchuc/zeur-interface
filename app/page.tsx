"use client"

import { useState } from "react"
import { ArrowRight, Shield, Zap, TrendingUp, Users, DollarSign, Star, Globe, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export default function ZeurLanding() {
  const [activeFeature, setActiveFeature] = useState(0)

  const features = [
    {
      icon: <DollarSign className="h-8 w-8" />,
      title: "0% Interest Loans",
      description: "Borrow EUR with absolutely no interest fees. Revolutionary DeFi lending at its finest.",
      gradient: "from-purple-500 to-blue-500",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Auto Yield Generation",
      description: "Your collateral automatically earns yield through optimized DeFi strategies while you borrow.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Instant Liquidation",
      description: "Smart contracts ensure instant and fair liquidation processes with full transparency.",
      gradient: "from-cyan-500 to-purple-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Decentralized Security",
      description: "Built on battle-tested smart contracts with full decentralization and community governance.",
      gradient: "from-purple-500 to-pink-500",
    },
  ]

  const stats = [
    { label: "Total Value Locked", value: "$12.4M", icon: <TrendingUp className="h-5 w-5" /> },
    { label: "Active Borrowers", value: "2,847", icon: <Users className="h-5 w-5" /> },
    { label: "EUR Borrowed", value: "€8.2M", icon: <DollarSign className="h-5 w-5" /> },
    { label: "Average Yield", value: "12.5%", icon: <Star className="h-5 w-5" /> },
  ]

  const howItWorks = [
    {
      step: "01",
      title: "Deposit Collateral",
      description: "Deposit ETH, stETH, or other supported assets as collateral to secure your loan.",
      icon: <Lock className="h-6 w-6" />,
    },
    {
      step: "02",
      title: "Borrow EUR",
      description: "Borrow up to 80% of your collateral value in EUR stablecoins at 0% interest.",
      icon: <DollarSign className="h-6 w-6" />,
    },
    {
      step: "03",
      title: "Earn Yield",
      description: "Your collateral automatically generates yield through optimized DeFi strategies.",
      icon: <TrendingUp className="h-6 w-6" />,
    },
  ]

  return (
    <div className="min-h-screen dark-gradient-bg">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 navbar-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-gradient-purple">Zeur</span>
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

          <Link href="/lending">
            <Button className="btn-primary-purple rounded-lg px-6 py-2">Launch App</Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="hero-gradient-bg absolute inset-0"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-6 bg-purple-500/20 text-purple-300 border-purple-500/30 rounded-full px-4 py-2">
              <Globe className="h-4 w-4 mr-2" />
              Decentralized • Zero Interest • European Focus
            </Badge>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient-purple">Borrow EUR</span> at{" "}
              <span className="text-gradient-purple">0% APR.</span>
              <br />
              <span className="text-white">Full Control.</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Borrow EUR with no interest. Powered by decentralized smart contracts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Link href="/lending">
                <Button size="lg" className="btn-primary-purple rounded-lg px-8 py-4 text-lg font-semibold">
                  Launch App
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" className="btn-secondary-dark rounded-lg px-8 py-4 text-lg font-semibold">
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div id="stats" className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <Card key={index} className="stats-card rounded-xl">
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-2 text-purple-400">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-900/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              Revolutionary <span className="text-gradient-purple">DeFi Lending</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Experience the future of decentralized finance with our cutting-edge lending protocol
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`card-dark rounded-2xl hover:glow-purple transition-all cursor-pointer transform hover:-translate-y-2 ${
                  activeFeature === index ? "glow-purple" : ""
                }`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <CardHeader className="text-center pb-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}
                  >
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl font-bold text-white">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-300 text-center leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              How It <span className="text-gradient-purple">Works</span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Three simple steps to start borrowing EUR at 0% interest
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="relative mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto text-white text-2xl font-bold glow-purple">
                      {step.step}
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center border-2 border-purple-500">
                      {step.icon}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">{step.title}</h3>
                  <p className="text-slate-300 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-900/50 to-blue-900/50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Ready to Start <span className="text-gradient-purple">Borrowing?</span>
            </h2>
            <p className="text-xl md:text-2xl mb-8 text-slate-300">
              Join thousands of users already borrowing EUR at 0% interest
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/lending">
                <Button size="lg" className="btn-primary-purple rounded-lg px-8 py-4 text-lg font-semibold">
                  Launch Zeur App
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button size="lg" className="btn-secondary-dark rounded-lg px-8 py-4 text-lg font-semibold">
                Read Documentation
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-xl font-bold text-gradient-purple">Zeur</span>
              </div>
              <p className="text-slate-400">
                Zero-interest EUR lending protocol powered by decentralized smart contracts.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Lending
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Borrowing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Yield Vaults
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Governance
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Twitter
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-purple-400 transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 Zeur Protocol. Built with ❤️ for the decentralized future.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
