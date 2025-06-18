"use client"
import {
  DollarSign,
  TrendingUp,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function HistoryPage() {
  const transactions = [
    {
      type: "Borrow",
      amount: "€1,000 EURC",
      collateral: "0.5 ETH",
      date: "2024-01-15",
      status: "Active",
      color: "purple",
    },
    {
      type: "Deposit",
      amount: "1.2 stETH",
      collateral: "-",
      date: "2024-01-10",
      status: "Earning",
      color: "blue",
    },
    {
      type: "Repay",
      amount: "€500 EURC",
      collateral: "0.25 ETH Released",
      date: "2024-01-05",
      status: "Completed",
      color: "green",
    },
  ]

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h1 className="text-3xl font-bold text-white mb-2">
          Transaction <span className="text-gradient-purple">History</span>
        </h1>
        <p className="text-slate-300 text-sm">Track all your lending and borrowing activities</p>
      </div>

      <Card className="card-dark rounded-lg">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold text-white">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.map((tx, index) => (
              <div key={index} className="bg-slate-800/30 rounded-lg p-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-${tx.color}-500/20 flex items-center justify-center`}>
                    {tx.type === "Borrow" && <DollarSign className="h-4 w-4 text-purple-400" />}
                    {tx.type === "Deposit" && <TrendingUp className="h-4 w-4 text-blue-400" />}
                    {tx.type === "Repay" && <ArrowRight className="h-4 w-4 text-green-400" />}
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">{tx.type}</div>
                    <div className="text-xs text-slate-400">{tx.amount}</div>
                    {tx.collateral !== "-" && <div className="text-xs text-slate-500">{tx.collateral}</div>}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">{tx.date}</div>
                  <Badge
                    className={`text-xs ${
                      tx.status === "Active"
                        ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                        : tx.status === "Earning"
                          ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                          : "bg-green-500/20 text-green-400 border-green-500/30"
                    }`}
                  >
                    {tx.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}