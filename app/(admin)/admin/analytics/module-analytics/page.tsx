import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { BarChart3, Puzzle, TrendingUp } from "lucide-react"

const sampleModuleAdoption: { id: string; name: string; users: number; adoptionRate: string; popular: boolean }[] = []
const sampleKpiUsage: { module: string; kpi: string; usage: string }[] = []

export default function ModuleAnalyticsPage() {
  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground/90">Module Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Modules</CardTitle>
            <Puzzle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground">Active industry modules</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Most Popular Module</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">N/A</div>
            <p className="text-xs text-muted-foreground">0% adoption rate</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. KPIs per Module</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">0</div>
            <p className="text-xs text-muted-foreground">Average configured KPIs</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground/80">Module Adoption Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module Name</TableHead>
                <TableHead>Active Users</TableHead>
                <TableHead>Adoption Rate</TableHead>
                <TableHead>Popularity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleModuleAdoption.map((module) => (
                <TableRow key={module.id}>
                  <TableCell className="font-medium">{module.name}</TableCell>
                  <TableCell>{module.users}</TableCell>
                  <TableCell>{module.adoptionRate}</TableCell>
                  <TableCell>
                    <Badge
                      variant={module.popular ? "default" : "secondary"}
                      className={module.popular ? "bg-green-500/20 text-green-700 border-green-500/30" : ""}
                    >
                      {module.popular ? "High" : "Low"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-card/50 backdrop-blur-lg border-border/30 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground/80">Key KPI Usage by Module</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead>KPI</TableHead>
                <TableHead>Usage Level</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleKpiUsage.map((kpi, index) => (
                <TableRow key={index}>
                  <TableCell>{kpi.module}</TableCell>
                  <TableCell className="font-medium">{kpi.kpi}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{kpi.usage}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
