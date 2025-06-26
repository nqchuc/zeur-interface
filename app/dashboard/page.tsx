"use client"
import Link from "next/link"
import {
  TrendingUp,
  DollarSign,
  Star,
  ArrowLeftRight,
  Target,
  ChevronRight,
  PieChart,
  Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { vaultStrategies } from "@/lib/constants"

export default function DashboardPage() {
  const stats = [
    {
      label: "Total Value Locked",
      value: "$12.4M",
      icon: <TrendingUp className="h-4 w-4" />,
      color: "from-purple-500 to-blue-500",
    },
    {
      label: "Active Users",
      value: "2,847",
      icon: <Users className="h-4 w-4" />,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "EUR Borrowed",
      value: "€8.2M",
      icon: <DollarSign className="h-4 w-4" />,
      color: "from-cyan-500 to-purple-500",
    },
    {
      label: "Average Yield",
      value: "12.5%",
      icon: <Star className="h-4 w-4" />,
      color: "from-purple-500 to-pink-500",
    },
  ]

  const quickActions = [
    { icon: <DollarSign className="h-4 w-4" />, label: "New Loan", href: "/borrow", color: "from-purple-500 to-blue-500" },
    { icon: <TrendingUp className="h-4 w-4" />, label: "Deposit", href: "/lend", color: "from-blue-500 to-cyan-500" },
    { icon: <ArrowLeftRight className="h-4 w-4" />, label: "Swap", href: "#", color: "from-cyan-500 to-purple-500" },
    { icon: <Target className="h-4 w-4" />, label: "Auto-Repay", href: "/borrow", color: "from-purple-500 to-pink-500" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome to <span className="text-gradient-purple">Zeur</span>
        </h1>
        <p className="text-slate-300">Manage your positions and explore DeFi opportunities</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="stats-card rounded-lg overflow-hidden">
            <div className={`h-1 bg-gradient-to-r ${stat.color}`}></div>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">{stat.label}</span>
                <div
                  className={`w-6 h-6 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white`}
                >
                  {stat.icon}
                </div>
              </div>
              <div className="text-xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      {/* <div className="flex overflow-x-auto pb-2 space-x-3 scrollbar-hide">
        {quickActions.map((action, index) => (
          <Link key={index} href={action.href}>
            <Button
              className={`rounded-lg h-auto py-2 px-4 bg-gradient-to-r ${action.color} text-white hover:shadow-lg transition-all min-w-[100px] flex-shrink-0`}
            >
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mb-1">
                  {action.icon}
                </div>
                <span className="text-sm">{action.label}</span>
              </div>
            </Button>
          </Link>
        ))}
      </div> */}

      {/* Your Positions */}
      <Card className="card-dark rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white">Your Positions</CardTitle>
            <Link href="/history">
              <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-2">
          <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-lg">
                          🔷
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">ETH Collateral</div>
                          <div className="text-xs text-slate-400">0.5 ETH ($1,710)</div>
                        </div>
                      </div>
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">Active</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400">Borrowed</div>
                        <div className="font-semibold text-white">€1,000 EURC</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Health Factor</div>
                        <div className="font-semibold text-green-400">1.8</div>
                      </div>
                      <div>
                        <div className="text-slate-400">APY Earned</div>
                        <div className="font-semibold text-white">4.2%</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/20 h-full">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-lg">
                          🟣
                        </div>
                        <div>
                          <div className="font-semibold text-white text-sm">stETH Deposit</div>
                          <div className="text-xs text-slate-400">1.2 stETH ($4,098)</div>
                        </div>
                      </div>
                      <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Earning</Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <div className="text-slate-400">Strategy</div>
                        <div className="font-semibold text-white">Balanced</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Current APY</div>
                        <div className="font-semibold text-green-400">5.8%</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Earned</div>
                        <div className="font-semibold text-white">+0.02 ETH</div>
                      </div>
                    </div>
                  </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="card-dark rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-white">Market Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-32 bg-slate-800/50 rounded-lg flex items-center justify-center">
              <PieChart className="h-20 w-20 text-purple-400 opacity-50" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span className="text-xs text-slate-300">ETH (45%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-300">stETH (30%)</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                  <span className="text-xs text-slate-300">WBTC (15%)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                  <span className="text-xs text-slate-300">LINK (10%)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-dark rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-white">Yield Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {vaultStrategies.map((strategy, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg flex items-center justify-between ${
                    strategy.recommended ? "bg-purple-500/10 border border-purple-500/20" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${strategy.color} flex items-center justify-center text-white text-sm`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center">
                        {strategy.name}
                        {strategy.recommended && (
                          <Badge className="ml-1 bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            <Star className="h-2 w-2 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>
                      {/* <div className="text-xs text-slate-400">{strategy.risk} Risk</div> */}
                      
                    </div>
                  </div>
                  {/* <div className="text-lg font-bold text-green-400">{strategy.apy}</div> */}
                  <div className="flex flex-row gap-3 text-sm">
                      <div>
                        <div className="text-slate-400">Current Holding</div>
                        <div className="font-semibold text-white">1000 EURC</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Current Holding USD</div>
                        <div className="font-semibold text-white">1000 EURC</div>
                      </div>
                      <div>
                        <div className="text-slate-400">APY</div>
                        <div className="font-semibold text-green-400">{strategy.apy}</div>
                      </div>
                    </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}