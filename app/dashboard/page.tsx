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
import { useBorrow } from "@/hooks/contexts/BorrowHookContext"
import Image from "next/image"
import { PieChart as RechartsTooltipChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

// TypeScript interfaces
interface LSTData {
  name: string;
  symbol: string;
  stakedAmount: string;
  apy: string;
  icon: string;
  active?: boolean;
}

interface ChartData {
  name: string;
  symbol: string;
  value: number;
  apy: string;
  color: string;
  displayAmount: string;
  percentage: string;
}


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

  const { formattedLstData }: { formattedLstData: LSTData[] } = useBorrow();

  const quickActions = [
    { icon: <DollarSign className="h-4 w-4" />, label: "New Loan", href: "/borrow", color: "from-purple-500 to-blue-500" },
    { icon: <TrendingUp className="h-4 w-4" />, label: "Deposit", href: "/lend", color: "from-blue-500 to-cyan-500" },
    { icon: <ArrowLeftRight className="h-4 w-4" />, label: "Swap", href: "#", color: "from-cyan-500 to-purple-500" },
    { icon: <Target className="h-4 w-4" />, label: "Auto-Repay", href: "/borrow", color: "from-purple-500 to-pink-500" },
  ]

  // Color palette for pie chart
  const COLORS: string[] = [
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan  
    '#3b82f6', // Blue
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#6366f1'  // Indigo
  ];

  // Process LST data for pie chart
  const processChartData = (): ChartData[] => {
    if (!formattedLstData || formattedLstData.length === 0) return [];
    
    const chartData: ChartData[] = formattedLstData.map((item: LSTData, index: number) => {
      const amount = parseFloat(item.stakedAmount) || 0;
      return {
        name: item.name,
        symbol: item.symbol,
        value: amount,
        apy: item.apy,
        color: COLORS[index % COLORS.length],
        displayAmount: `${item.stakedAmount} ${item.symbol}`,
        percentage: "0"
      };
    });

    const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
    
    return chartData.map(item => ({
      ...item,
      percentage: totalValue > 0 ? ((item.value / totalValue) * 100).toFixed(1) : "0"
    }));
  };

  const chartData: ChartData[] = processChartData();

  // Custom tooltip for Recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 border border-slate-600 rounded-lg p-3 shadow-lg">
          <div className="text-white font-semibold">{data.name}</div>
          <div className="text-slate-300 text-sm">{data.displayAmount}</div>
          <div className="text-purple-400 text-sm">{data.percentage}% of portfolio</div>
          <div className="text-green-400 text-sm">APY: {data.apy}</div>
        </div>
      );
    }
    return null;
  };

  // Custom label function for the pie chart
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (parseFloat(percentage) < 8) return null; // Don't show labels for very small slices

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
        className="drop-shadow-lg"
      >
        {`${percentage}%`}
      </text>
    );
  };

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

      {/* Your Positions */}
      <Card className="card-dark rounded-xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white">Example Positions</CardTitle>
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
                          <div className="font-semibold text-white text-sm">EURC Supply</div>
                          <div className="text-xs text-slate-400">4000 EURC ($4,098)</div>
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
                        <div className="font-semibold text-green-400">5.5%</div>
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
            <div className="text-sm text-slate-400">LST Portfolio Distribution</div>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <>
                <div className="h-[200px] w-full mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsTooltipChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={80}
                        innerRadius={35}
                        fill="#8884d8"
                        dataKey="value"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={2}
                      >
                        {chartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.color}
                            style={{
                              filter: 'drop-shadow(0 2px 8px rgba(139, 92, 246, 0.3))',
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsTooltipChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Enhanced Legend */}
                <div className="p-2 flex flex-row">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center   p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-6 h-6 rounded-full border-2 border-white/20" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <div>
                          <span className="text-sm font-medium text-slate-200">{item.symbol}</span>
                          <div className="text-xs text-slate-500">{item.percentage}% of portfolio</div>
                        </div>
                      </div>
                      {/* <div className="text-right">
                        <div className="text-sm font-semibold text-white">{item.displayAmount}</div>
                        <div className="text-xs text-green-400">{item.apy} APY</div>
                      </div> */}
                    </div>
                  ))}
                </div>

                {/* Summary Stats */}
              
              </>
            ) : (
              <div className="h-32 bg-slate-800/50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-8 w-8 text-purple-400 opacity-50 mx-auto mb-2" />
                  <div className="text-xs text-slate-400">No LST data available</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-dark rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold text-white">Yield Strategies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formattedLstData.map((lst: LSTData, index: number) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg flex items-center justify-between  ${
                    lst.active ? "bg-purple-500/10 border border-purple-500/20" : ""
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Image
                      src={lst.icon}
                      alt="lst icon"
                      width={32}
                      height={32}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm`}
                    />
                    <div>
                      <div className="font-semibold text-white text-sm flex items-center">
                        {lst.name}
                        {lst.active && (
                          <Badge className="ml-2 bg-purple-500/20 text-purple-400 border-purple-500/30 text-xs">
                            <Star className="h-2 w-2 mr-1" />
                            Current
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-row gap-3 text-sm items-center">
                      <div>
                        <div className="text-slate-400">Staked Amount</div>
                        <div className="font-semibold text-white">{lst.stakedAmount} {lst.symbol}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">APY</div>
                        <div className="font-semibold text-green-400">{lst.apy}</div>
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