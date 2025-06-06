import { DollarSign, TrendingUp, Users, CreditCard } from "lucide-react"
import { FinancialMetricCard } from "@/components/admin/analytics/financial-metric-card"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LineChart,
  Line,
} from "recharts" // Example charting library

const sampleRevenueData: { name: string; revenue: number; mrr: number }[] = []
const samplePlanData: { name: string; revenue: number }[] = []

export default function FinancialAnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Financial Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <FinancialMetricCard title="Total Revenue" value="$0.00" IconComponent={DollarSign} description="No data yet" />
        <FinancialMetricCard title="MRR" value="$0.00" IconComponent={TrendingUp} description="No data yet" />
        <FinancialMetricCard
          title="Avg. LTV"
          value="$0.00"
          IconComponent={Users}
          description="Average customer lifetime value"
        />
        <FinancialMetricCard
          title="ARPU"
          value="$0.00"
          IconComponent={CreditCard}
          description="Average revenue per user"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground/80">Revenue & MRR Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sampleRevenueData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" strokeOpacity={0.5} />
                <YAxis strokeOpacity={0.5} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="mrr" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground/80">Revenue by Plan</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={samplePlanData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="name" strokeOpacity={0.5} />
                <YAxis strokeOpacity={0.5} />
                <Tooltip />
                <Legend />
                <Bar dataKey="revenue" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground/80">Payment Gateway Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Placeholder for payment gateway transaction logs and status.</p>
          {/* Future: Table of transactions */}
        </CardContent>
      </Card>
    </div>
  )
}
