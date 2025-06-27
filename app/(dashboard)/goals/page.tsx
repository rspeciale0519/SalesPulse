"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, Target, DollarSign, TrendingUp, Calendar, Phone } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { BulletproofInput } from "@/components/bulletproof-input"
import { useEnhancedInput } from "@/hooks/use-enhanced-input"

const GoalsCalculator = () => {
  const { actualTheme } = useTheme()

  // Initialize focus preservation
  useEnhancedInput()

  // Simple string state - memoized to prevent unnecessary re-renders
  const [values, setValues] = useState({
    grossIncome: "120000",
    reinvestmentPercent: "20",
    incomePerDeal: "2500",
    closeRate: "25",
    showRate: "80",
    callBookRate: "10",
    daysPerWeek: "5",
    weeksPerYear: "50",
  })

  const [whatIfValues, setWhatIfValues] = useState({
    grossIncome: "120000",
    reinvestmentPercent: "20",
    incomePerDeal: "2500",
    closeRate: "25",
    showRate: "80",
    callBookRate: "10",
    daysPerWeek: "5",
    weeksPerYear: "50",
  })

  // Memoized update functions to prevent re-renders
  const updateValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateWhatIfValue = useCallback((key: string, value: string) => {
    setWhatIfValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Memoized calculations
  const currentMetrics = useMemo(() => {
    const grossIncomeNum = Number.parseFloat(values.grossIncome) || 0
    const reinvestmentPercentNum = Number.parseFloat(values.reinvestmentPercent) || 0
    const incomePerDealNum = Number.parseFloat(values.incomePerDeal) || 1
    const closeRateNum = Number.parseFloat(values.closeRate) || 1
    const callBookRateNum = Number.parseFloat(values.callBookRate) || 1
    const daysPerWeekNum = Number.parseFloat(values.daysPerWeek) || 1
    const weeksPerYearNum = Number.parseFloat(values.weeksPerYear) || 1

    const netIncome = grossIncomeNum * (1 - reinvestmentPercentNum / 100)
    const dealsNeeded = Math.ceil(grossIncomeNum / incomePerDealNum)
    const appointmentsNeeded = Math.ceil(dealsNeeded / (closeRateNum / 100))
    const callsNeeded = Math.ceil(appointmentsNeeded / (callBookRateNum / 100))
    const dailyCalls = Math.ceil(callsNeeded / (daysPerWeekNum * weeksPerYearNum))
    const weeklyDeals = Math.ceil(dealsNeeded / weeksPerYearNum)

    return {
      netIncome,
      dealsNeeded,
      appointmentsNeeded,
      callsNeeded,
      dailyCalls,
      weeklyDeals,
    }
  }, [values])

  const whatIfMetrics = useMemo(() => {
    const grossIncomeNum = Number.parseFloat(whatIfValues.grossIncome) || 0
    const reinvestmentPercentNum = Number.parseFloat(whatIfValues.reinvestmentPercent) || 0
    const incomePerDealNum = Number.parseFloat(whatIfValues.incomePerDeal) || 1
    const closeRateNum = Number.parseFloat(whatIfValues.closeRate) || 1
    const callBookRateNum = Number.parseFloat(whatIfValues.callBookRate) || 1
    const daysPerWeekNum = Number.parseFloat(whatIfValues.daysPerWeek) || 1
    const weeksPerYearNum = Number.parseFloat(whatIfValues.weeksPerYear) || 1

    const netIncome = grossIncomeNum * (1 - reinvestmentPercentNum / 100)
    const dealsNeeded = Math.ceil(grossIncomeNum / incomePerDealNum)
    const appointmentsNeeded = Math.ceil(dealsNeeded / (closeRateNum / 100))
    const callsNeeded = Math.ceil(appointmentsNeeded / (callBookRateNum / 100))
    const dailyCalls = Math.ceil(callsNeeded / (daysPerWeekNum * weeksPerYearNum))
    const weeklyDeals = Math.ceil(dealsNeeded / weeksPerYearNum)

    return {
      netIncome,
      dealsNeeded,
      appointmentsNeeded,
      callsNeeded,
      dailyCalls,
      weeklyDeals,
    }
  }, [whatIfValues])

  const getInputClasses = useCallback(() => {
    return actualTheme === "dark"
      ? "input-theme bg-zinc-800/80 border-zinc-600 text-white focus:border-red-400 focus:ring-red-400/20"
      : "input-theme bg-white/90 border-gray-300 text-black focus:border-red-400 focus:ring-red-400/20"
  }, [actualTheme])

  const InputField = useCallback(
    ({
      id,
      label,
      value,
      onChange,
      suffix = "",
      tooltip = "",
      allowDecimals = false,
      maxLength = 10,
      max = Number.MAX_SAFE_INTEGER,
    }: {
      id: string
      label: string
      value: string
      onChange: (value: string) => void
      suffix?: string
      tooltip?: string
      allowDecimals?: boolean
      maxLength?: number
      max?: number
    }) => (
      <div className="space-y-2">
        <Label className="text-theme-secondary text-sm font-medium">{label}</Label>
        <BulletproofInput
          id={id}
          initialValue={value}
          onValueChange={onChange}
          className={getInputClasses()}
          maxLength={maxLength}
          allowDecimals={allowDecimals}
          suffix={suffix}
          max={max}
        />
        {tooltip && <p className="text-xs text-theme-muted">{tooltip}</p>}
      </div>
    ),
    [getInputClasses],
  )

  const MetricCard = useCallback(
    ({
      title,
      value,
      subtitle,
      icon: Icon,
    }: {
      title: string
      value: string | number
      subtitle?: string
      icon: any
    }) => (
      <Card className="glass glass-hover rounded-xl gradient-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-primary">
              <Icon className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm text-theme-secondary">{title}</p>
              <p className="text-xl font-bold text-theme-primary">{value}</p>
              {subtitle && <p className="text-xs text-theme-muted">{subtitle}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    ),
    [],
  )

  const applyWhatIfToGoals = useCallback(() => {
    setValues({ ...whatIfValues })
  }, [whatIfValues])

  const resetWhatIf = useCallback(() => {
    setWhatIfValues({ ...values })
  }, [values])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calculator className="h-8 w-8 text-blue-400" />
        <h1 className="text-3xl font-bold text-theme-primary">Goals Calculator</h1>
      </div>

      <Tabs defaultValue="my-goals" className="space-y-6">
        <TabsList className="glass border-zinc-700">
          <TabsTrigger value="my-goals" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
            My Goals
          </TabsTrigger>
          <TabsTrigger value="what-if" className="data-[state=active]:gradient-primary data-[state=active]:text-white">
            What-If Scenario
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-goals" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Section */}
            <div className="space-y-6">
              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goal Setting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="goals-gross-income"
                    label="Gross Annual Income"
                    value={values.grossIncome}
                    onChange={(value) => updateValue("grossIncome", value)}
                    suffix="$"
                    maxLength={12}
                    max={10000000}
                    tooltip="Enter your target annual income before taxes"
                  />
                  <InputField
                    id="goals-reinvestment"
                    label="Reinvestment Percentage"
                    value={values.reinvestmentPercent}
                    onChange={(value) => updateValue("reinvestmentPercent", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of income to reinvest in business"
                  />
                  <InputField
                    id="goals-income-per-deal"
                    label="Income per Deal"
                    value={values.incomePerDeal}
                    onChange={(value) => updateValue("incomePerDeal", value)}
                    suffix="$"
                    maxLength={8}
                    max={1000000}
                    tooltip="Average commission or income per closed deal"
                  />
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">KPIs & Rates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="goals-close-rate"
                    label="Close Rate"
                    value={values.closeRate}
                    onChange={(value) => updateValue("closeRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of appointments that result in closed deals"
                  />
                  <InputField
                    id="goals-show-rate"
                    label="Show Rate"
                    value={values.showRate}
                    onChange={(value) => updateValue("showRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of scheduled appointments that actually show up"
                  />
                  <InputField
                    id="goals-call-book-rate"
                    label="Call to Book Rate"
                    value={values.callBookRate}
                    onChange={(value) => updateValue("callBookRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of calls that result in booked appointments"
                  />
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Work Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="goals-days-per-week"
                    label="Days per Week"
                    value={values.daysPerWeek}
                    onChange={(value) => updateValue("daysPerWeek", value)}
                    maxLength={1}
                    max={7}
                    tooltip="Number of working days per week"
                  />
                  <InputField
                    id="goals-weeks-per-year"
                    label="Work Weeks per Year"
                    value={values.weeksPerYear}
                    onChange={(value) => updateValue("weeksPerYear", value)}
                    maxLength={2}
                    max={52}
                    tooltip="Number of working weeks per year (accounting for vacation)"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Calculated Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricCard
                    title="Net Income"
                    value={`$${currentMetrics.netIncome.toLocaleString()}`}
                    icon={DollarSign}
                  />
                  <MetricCard
                    title="Deals Needed"
                    value={currentMetrics.dealsNeeded}
                    subtitle={`${currentMetrics.weeklyDeals} per week`}
                    icon={Target}
                  />
                  <MetricCard
                    title="Appointments Needed"
                    value={currentMetrics.appointmentsNeeded}
                    subtitle="Total for year"
                    icon={Calendar}
                  />
                  <MetricCard
                    title="Calls Needed"
                    value={currentMetrics.callsNeeded}
                    subtitle={`${currentMetrics.dailyCalls} per day`}
                    icon={Phone}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="what-if" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* What-If Input Section */}
            <div className="space-y-6">
              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Goal Setting
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="whatif-gross-income"
                    label="Gross Annual Income"
                    value={whatIfValues.grossIncome}
                    onChange={(value) => updateWhatIfValue("grossIncome", value)}
                    suffix="$"
                    maxLength={12}
                    max={10000000}
                    tooltip="Enter your target annual income before taxes"
                  />
                  <InputField
                    id="whatif-reinvestment"
                    label="Reinvestment Percentage"
                    value={whatIfValues.reinvestmentPercent}
                    onChange={(value) => updateWhatIfValue("reinvestmentPercent", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of income to reinvest in business"
                  />
                  <InputField
                    id="whatif-income-per-deal"
                    label="Income per Deal"
                    value={whatIfValues.incomePerDeal}
                    onChange={(value) => updateWhatIfValue("incomePerDeal", value)}
                    suffix="$"
                    maxLength={8}
                    max={1000000}
                    tooltip="Average commission or income per closed deal"
                  />
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">KPIs & Rates</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="whatif-close-rate"
                    label="Close Rate"
                    value={whatIfValues.closeRate}
                    onChange={(value) => updateWhatIfValue("closeRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of appointments that result in closed deals"
                  />
                  <InputField
                    id="whatif-show-rate"
                    label="Show Rate"
                    value={whatIfValues.showRate}
                    onChange={(value) => updateWhatIfValue("showRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of scheduled appointments that actually show up"
                  />
                  <InputField
                    id="whatif-call-book-rate"
                    label="Call to Book Rate"
                    value={whatIfValues.callBookRate}
                    onChange={(value) => updateWhatIfValue("callBookRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of calls that result in booked appointments"
                  />
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Work Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="whatif-days-per-week"
                    label="Days per Week"
                    value={whatIfValues.daysPerWeek}
                    onChange={(value) => updateWhatIfValue("daysPerWeek", value)}
                    maxLength={1}
                    max={7}
                    tooltip="Number of working days per week"
                  />
                  <InputField
                    id="whatif-weeks-per-year"
                    label="Work Weeks per Year"
                    value={whatIfValues.weeksPerYear}
                    onChange={(value) => updateWhatIfValue("weeksPerYear", value)}
                    maxLength={2}
                    max={52}
                    tooltip="Number of working weeks per year (accounting for vacation)"
                  />
                </CardContent>
              </Card>
            </div>

            {/* What-If Results Section */}
            <div className="space-y-6">
              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    What-If Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <MetricCard
                    title="Net Income"
                    value={`$${whatIfMetrics.netIncome.toLocaleString()}`}
                    icon={DollarSign}
                  />
                  <MetricCard
                    title="Deals Needed"
                    value={whatIfMetrics.dealsNeeded}
                    subtitle={`${whatIfMetrics.weeklyDeals} per week`}
                    icon={Target}
                  />
                  <MetricCard
                    title="Appointments Needed"
                    value={whatIfMetrics.appointmentsNeeded}
                    subtitle="Total for year"
                    icon={Calendar}
                  />
                  <MetricCard
                    title="Calls Needed"
                    value={whatIfMetrics.callsNeeded}
                    subtitle={`${whatIfMetrics.dailyCalls} per day`}
                    icon={Phone}
                  />
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={applyWhatIfToGoals}
                    className="w-full gradient-primary text-white hover:opacity-90"
                  >
                    Apply What-If to My Goals
                  </Button>
                  <Button
                    onClick={resetWhatIf}
                    variant="outline"
                    className="w-full border-zinc-600 text-theme-secondary hover:bg-zinc-800"
                  >
                    Reset What-If to Current Goals
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function GoalsPage() {
  // Log to the browser console when this component renders
  console.log("[CLIENT] Dashboard GoalsPage is rendering")

  return (
    <div className="p-6">
      <GoalsCalculator />
    </div>
  )
}
