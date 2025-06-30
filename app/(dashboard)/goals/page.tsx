"use client"

import { useState, useMemo, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Calculator, Target, DollarSign, TrendingUp, Calendar, Phone, Users } from "lucide-react"
import { useTheme } from "@/components/theme-provider"
import { BulletproofInput } from "@/components/bulletproof-input"
import { useEnhancedInput } from "@/hooks/use-enhanced-input"

const GoalsCalculator = () => {
  const { actualTheme } = useTheme()
  useEnhancedInput()

  // Complete state with all fields from spreadsheet
  const [values, setValues] = useState({
    grossIncome: "100000",
    reinvestmentPercent: "20", 
    incomePerDeal: "500",
    takenRate: "70",
    closeRate: "40",
    showRate: "50", 
    callBookRate: "150",
    daysPerWeek: "6",
    weeksPerYear: "50",
    dealReferralPercent: "25",
    otherReferralSources: "40",
    referralSitRate: "70", 
    referralCloseRate: "65",
    actualCallsMade: "0",
    actualDealsClosedL: "0",
  })

  const [whatIfValues, setWhatIfValues] = useState({
    grossIncome: "100000",
    reinvestmentPercent: "20",
    incomePerDeal: "500", 
    takenRate: "70",
    closeRate: "40",
    showRate: "50",
    callBookRate: "150", 
    daysPerWeek: "6",
    weeksPerYear: "50",
    dealReferralPercent: "25",
    otherReferralSources: "40",
    referralSitRate: "70",
    referralCloseRate: "65", 
    actualCallsMade: "0",
    actualDealsClosedL: "0",
  })

  const updateValue = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  const updateWhatIfValue = useCallback((key: string, value: string) => {
    setWhatIfValues((prev) => ({ ...prev, [key]: value }))
  }, [])

  // Comprehensive calculations matching spreadsheet logic
  const currentMetrics = useMemo(() => {
    const grossIncomeNum = Number.parseFloat(values.grossIncome) || 0
    const reinvestmentPercentNum = Number.parseFloat(values.reinvestmentPercent) || 0
    const incomePerDealNum = Number.parseFloat(values.incomePerDeal) || 1
    const takenRateNum = Number.parseFloat(values.takenRate) || 1
    const closeRateNum = Number.parseFloat(values.closeRate) || 1
    const showRateNum = Number.parseFloat(values.showRate) || 1
    const callBookRateNum = Number.parseFloat(values.callBookRate) || 1
    const daysPerWeekNum = Number.parseFloat(values.daysPerWeek) || 1
    const weeksPerYearNum = Number.parseFloat(values.weeksPerYear) || 1
    const dealReferralPercentNum = Number.parseFloat(values.dealReferralPercent) || 0
    const otherReferralSourcesNum = Number.parseFloat(values.otherReferralSources) || 0
    const referralSitRateNum = Number.parseFloat(values.referralSitRate) || 1
    const referralCloseRateNum = Number.parseFloat(values.referralCloseRate) || 1

    const netIncome = grossIncomeNum * (1 - reinvestmentPercentNum / 100)
    const dealsNeeded = Math.ceil(grossIncomeNum / incomePerDealNum)
    const appointmentsRun = Math.ceil(dealsNeeded / (closeRateNum / 100))
    const appointmentsSet = Math.ceil(appointmentsRun / (showRateNum / 100))
    const callsNeeded = Math.ceil(appointmentsSet * callBookRateNum)
    
    // Activity breakdowns
    const dailyDeals = Math.ceil(dealsNeeded / (daysPerWeekNum * weeksPerYearNum))
    const weeklyDeals = Math.ceil(dealsNeeded / weeksPerYearNum)
    const dailyAppointmentsRun = Math.ceil(appointmentsRun / (daysPerWeekNum * weeksPerYearNum))
    const weeklyAppointmentsRun = Math.ceil(appointmentsRun / weeksPerYearNum)
    const dailyAppointmentsSet = Math.ceil(appointmentsSet / (daysPerWeekNum * weeksPerYearNum))
    const weeklyAppointmentsSet = Math.ceil(appointmentsSet / weeksPerYearNum)
    const dailyCalls = Math.ceil(callsNeeded / (daysPerWeekNum * weeksPerYearNum))
    const weeklyCalls = Math.ceil(callsNeeded / weeksPerYearNum)
    
    // Referral calculations
    const totalReferralsReceived = Math.ceil((dealsNeeded * dealReferralPercentNum / 100) + otherReferralSourcesNum)
    const dealsFromReferrals = Math.ceil(totalReferralsReceived * (referralSitRateNum / 100) * (referralCloseRateNum / 100))
    const referralIncome = dealsFromReferrals * incomePerDealNum
    const incomeWithoutReferrals = netIncome
    const incomeWithReferrals = netIncome + referralIncome
    const incomeIncrease = incomeWithReferrals > 0 ? ((incomeWithReferrals - incomeWithoutReferrals) / incomeWithoutReferrals) * 100 : 0

    return {
      netIncome, dealsNeeded, appointmentsRun, appointmentsSet, callsNeeded,
      dailyDeals, weeklyDeals, dailyAppointmentsRun, weeklyAppointmentsRun,
      dailyAppointmentsSet, weeklyAppointmentsSet, dailyCalls, weeklyCalls,
      totalReferralsReceived, dealsFromReferrals, referralIncome,
      incomeWithoutReferrals, incomeWithReferrals, incomeIncrease,
    }
  }, [values])

  const whatIfMetrics = useMemo(() => {
    const grossIncomeNum = Number.parseFloat(whatIfValues.grossIncome) || 0
    const reinvestmentPercentNum = Number.parseFloat(whatIfValues.reinvestmentPercent) || 0
    const incomePerDealNum = Number.parseFloat(whatIfValues.incomePerDeal) || 1
    const takenRateNum = Number.parseFloat(whatIfValues.takenRate) || 1
    const closeRateNum = Number.parseFloat(whatIfValues.closeRate) || 1
    const showRateNum = Number.parseFloat(whatIfValues.showRate) || 1
    const callBookRateNum = Number.parseFloat(whatIfValues.callBookRate) || 1
    const daysPerWeekNum = Number.parseFloat(whatIfValues.daysPerWeek) || 1
    const weeksPerYearNum = Number.parseFloat(whatIfValues.weeksPerYear) || 1
    const dealReferralPercentNum = Number.parseFloat(whatIfValues.dealReferralPercent) || 0
    const otherReferralSourcesNum = Number.parseFloat(whatIfValues.otherReferralSources) || 0
    const referralSitRateNum = Number.parseFloat(whatIfValues.referralSitRate) || 1
    const referralCloseRateNum = Number.parseFloat(whatIfValues.referralCloseRate) || 1

    const netIncome = grossIncomeNum * (1 - reinvestmentPercentNum / 100)
    const dealsNeeded = Math.ceil(grossIncomeNum / incomePerDealNum)
    const appointmentsRun = Math.ceil(dealsNeeded / (closeRateNum / 100))
    const appointmentsSet = Math.ceil(appointmentsRun / (showRateNum / 100))
    const callsNeeded = Math.ceil(appointmentsSet * callBookRateNum)
    
    const dailyDeals = Math.ceil(dealsNeeded / (daysPerWeekNum * weeksPerYearNum))
    const weeklyDeals = Math.ceil(dealsNeeded / weeksPerYearNum)
    const dailyAppointmentsRun = Math.ceil(appointmentsRun / (daysPerWeekNum * weeksPerYearNum))
    const weeklyAppointmentsRun = Math.ceil(appointmentsRun / weeksPerYearNum)
    const dailyAppointmentsSet = Math.ceil(appointmentsSet / (daysPerWeekNum * weeksPerYearNum))
    const weeklyAppointmentsSet = Math.ceil(appointmentsSet / weeksPerYearNum)
    const dailyCalls = Math.ceil(callsNeeded / (daysPerWeekNum * weeksPerYearNum))
    const weeklyCalls = Math.ceil(callsNeeded / weeksPerYearNum)
    
    const totalReferralsReceived = Math.ceil((dealsNeeded * dealReferralPercentNum / 100) + otherReferralSourcesNum)
    const dealsFromReferrals = Math.ceil(totalReferralsReceived * (referralSitRateNum / 100) * (referralCloseRateNum / 100))
    const referralIncome = dealsFromReferrals * incomePerDealNum
    const incomeWithoutReferrals = netIncome
    const incomeWithReferrals = netIncome + referralIncome
    const incomeIncrease = incomeWithReferrals > 0 ? ((incomeWithReferrals - incomeWithoutReferrals) / incomeWithoutReferrals) * 100 : 0

    return {
      netIncome, dealsNeeded, appointmentsRun, appointmentsSet, callsNeeded,
      dailyDeals, weeklyDeals, dailyAppointmentsRun, weeklyAppointmentsRun,
      dailyAppointmentsSet, weeklyAppointmentsSet, dailyCalls, weeklyCalls,
      totalReferralsReceived, dealsFromReferrals, referralIncome,
      incomeWithoutReferrals, incomeWithReferrals, incomeIncrease,
    }
  }, [whatIfValues])

  const getInputClasses = useCallback(() => {
    return actualTheme === "dark"
      ? "input-theme bg-zinc-800/80 border-zinc-600 text-white focus:border-red-400 focus:ring-red-400/20"
      : "input-theme bg-white/90 border-gray-300 text-black focus:border-red-400 focus:ring-red-400/20"
  }, [actualTheme])

  const InputField = useCallback(
    ({
      id, label, value, onChange, suffix = "", tooltip = "", allowDecimals = false, maxLength = 10, max = Number.MAX_SAFE_INTEGER,
    }: {
      id: string; label: string; value: string; onChange: (value: string) => void;
      suffix?: string; tooltip?: string; allowDecimals?: boolean; maxLength?: number; max?: number;
    }) => (
      <div className="space-y-2">
        <Label className="text-theme-secondary text-sm font-medium">{label}</Label>
        <BulletproofInput
          id={id} initialValue={value} onValueChange={onChange} className={getInputClasses()}
          maxLength={maxLength} allowDecimals={allowDecimals} suffix={suffix} max={max}
        />
        {tooltip && <p className="text-xs text-theme-muted">{tooltip}</p>}
      </div>
    ), [getInputClasses]
  )

  const MetricCard = useCallback(
    ({ title, value, subtitle, icon: Icon }: { title: string; value: string | number; subtitle?: string; icon: any }) => (
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
    ), []
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
                    Goal & Deal Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="goals-gross-income"
                    label="Income Goal (Gross Annual)"
                    value={values.grossIncome}
                    onChange={(value) => updateValue("grossIncome", value)}
                    suffix="$"
                    maxLength={12}
                    max={10000000}
                    tooltip="Enter your target annual income before taxes"
                  />
                  <InputField
                    id="goals-reinvestment"
                    label="Reinvestment %"
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
                    label="Income per Deal (Gross based on Average)"
                    value={values.incomePerDeal}
                    onChange={(value) => updateValue("incomePerDeal", value)}
                    suffix="$"
                    maxLength={8}
                    max={1000000}
                    tooltip="Average commission or income per closed deal"
                  />
                  <InputField
                    id="goals-taken-rate"
                    label="Taken Rate %"
                    value={values.takenRate}
                    onChange={(value) => updateValue("takenRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of deals needed to hit goal income"
                  />
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Key KPIs & Activity (Annual)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="goals-close-rate"
                    label="Close Rate %"
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
                    label="Show Rate %"
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
                    suffix=""
                    maxLength={8}
                    max={10000}
                    allowDecimals={true}
                    tooltip="Calls needed to book one appointment"
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
                    label="Days Worked per Week"
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

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Referral KPIs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="goals-deal-referral-percent"
                    label="% of Deals Yielding at least 1 Referral"
                    value={values.dealReferralPercent}
                    onChange={(value) => updateValue("dealReferralPercent", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of deals that generate at least one referral"
                  />
                  <InputField
                    id="goals-other-referral-sources"
                    label="Other Referral Sources (Annual)"
                    value={values.otherReferralSources}
                    onChange={(value) => updateValue("otherReferralSources", value)}
                    suffix=""
                    maxLength={8}
                    max={10000}
                    allowDecimals={true}
                    tooltip="Number of referrals from other sources per year"
                  />
                  <InputField
                    id="goals-referral-sit-rate"
                    label="Sit Rate (Referral Sit Rate) %"
                    value={values.referralSitRate}
                    onChange={(value) => updateValue("referralSitRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of referrals that result in appointments"
                  />
                  <InputField
                    id="goals-referral-close-rate"
                    label="Close Rate (Referral Close Rate) %"
                    value={values.referralCloseRate}
                    onChange={(value) => updateValue("referralCloseRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of referral appointments that close"
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
                    Goal Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard title="Net Income" value={`$${currentMetrics.netIncome.toLocaleString()}.00`} icon={DollarSign} />
                    <MetricCard title="Deals Needed" value={currentMetrics.dealsNeeded.toLocaleString()} icon={Target} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Annual Activity Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard title="Appointments Run" value={currentMetrics.appointmentsRun.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Appointments Set" value={currentMetrics.appointmentsSet.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Calls Needed" value={currentMetrics.callsNeeded.toLocaleString()} icon={Phone} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Weekly Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard title="Deals" value={currentMetrics.weeklyDeals.toLocaleString()} icon={Target} />
                    <MetricCard title="Appointments Run" value={currentMetrics.weeklyAppointmentsRun.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Appointments Set" value={currentMetrics.weeklyAppointmentsSet.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Calls" value={currentMetrics.weeklyCalls.toLocaleString()} icon={Phone} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Daily Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard title="Deals" value={currentMetrics.dailyDeals.toLocaleString()} icon={Target} />
                    <MetricCard title="Appointments Run" value={currentMetrics.dailyAppointmentsRun.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Appointments Set" value={currentMetrics.dailyAppointmentsSet.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Calls" value={currentMetrics.dailyCalls.toLocaleString()} icon={Phone} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Referral Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard title="Total Referrals Received" value={currentMetrics.totalReferralsReceived.toLocaleString()} icon={Users} />
                    <MetricCard title="Deals from Referrals" value={currentMetrics.dealsFromReferrals.toLocaleString()} icon={Target} />
                    <MetricCard title="Referral Income" value={`$${currentMetrics.referralIncome.toLocaleString()}.00`} icon={DollarSign} />
                    <MetricCard title="Income WITHOUT Referrals" value={`$${currentMetrics.incomeWithoutReferrals.toLocaleString()}.00`} icon={DollarSign} />
                    <MetricCard title="Income WITH Referrals" value={`$${currentMetrics.incomeWithReferrals.toLocaleString()}.00`} icon={DollarSign} />
                    <MetricCard title="Income Increase %" value={`${currentMetrics.incomeIncrease.toFixed(0)}%`} icon={TrendingUp} />
                  </div>
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
                    Goal & Deal Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="whatif-gross-income"
                    label="Income Goal (Gross Annual)"
                    value={whatIfValues.grossIncome}
                    onChange={(value) => updateWhatIfValue("grossIncome", value)}
                    suffix="$"
                    maxLength={12}
                    max={10000000}
                    tooltip="Enter your target annual income before taxes"
                  />
                  <InputField
                    id="whatif-reinvestment"
                    label="Reinvestment %"
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
                    label="Income per Deal (Gross based on Average)"
                    value={whatIfValues.incomePerDeal}
                    onChange={(value) => updateWhatIfValue("incomePerDeal", value)}
                    suffix="$"
                    maxLength={8}
                    max={1000000}
                    tooltip="Average commission or income per closed deal"
                  />
                  <InputField
                    id="whatif-taken-rate"
                    label="Taken Rate %"
                    value={whatIfValues.takenRate}
                    onChange={(value) => updateWhatIfValue("takenRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of deals needed to hit goal income"
                  />
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Key KPIs & Activity (Annual)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="whatif-close-rate"
                    label="Close Rate %"
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
                    label="Show Rate %"
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
                    suffix=""
                    maxLength={8}
                    max={10000}
                    allowDecimals={true}
                    tooltip="Calls needed to book one appointment"
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
                    label="Days Worked per Week"
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

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Referral KPIs</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <InputField
                    id="whatif-deal-referral-percent"
                    label="% of Deals Yielding at least 1 Referral"
                    value={whatIfValues.dealReferralPercent}
                    onChange={(value) => updateWhatIfValue("dealReferralPercent", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of deals that generate at least one referral"
                  />
                  <InputField
                    id="whatif-other-referral-sources"
                    label="Other Referral Sources (Annual)"
                    value={whatIfValues.otherReferralSources}
                    onChange={(value) => updateWhatIfValue("otherReferralSources", value)}
                    suffix=""
                    maxLength={8}
                    max={10000}
                    allowDecimals={true}
                    tooltip="Number of referrals from other sources per year"
                  />
                  <InputField
                    id="whatif-referral-sit-rate"
                    label="Sit Rate (Referral Sit Rate) %"
                    value={whatIfValues.referralSitRate}
                    onChange={(value) => updateWhatIfValue("referralSitRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of referrals that result in appointments"
                  />
                  <InputField
                    id="whatif-referral-close-rate"
                    label="Close Rate (Referral Close Rate) %"
                    value={whatIfValues.referralCloseRate}
                    onChange={(value) => updateWhatIfValue("referralCloseRate", value)}
                    suffix="%"
                    maxLength={5}
                    max={100}
                    allowDecimals={true}
                    tooltip="Percentage of referral appointments that close"
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
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard title="Net Income" value={`$${whatIfMetrics.netIncome.toLocaleString()}.00`} icon={DollarSign} />
                    <MetricCard title="Deals Needed" value={whatIfMetrics.dealsNeeded.toLocaleString()} icon={Target} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Annual Activity Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard title="Appointments Run" value={whatIfMetrics.appointmentsRun.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Appointments Set" value={whatIfMetrics.appointmentsSet.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Calls Needed" value={whatIfMetrics.callsNeeded.toLocaleString()} icon={Phone} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Weekly Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard title="Deals" value={whatIfMetrics.weeklyDeals.toLocaleString()} icon={Target} />
                    <MetricCard title="Appointments Run" value={whatIfMetrics.weeklyAppointmentsRun.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Appointments Set" value={whatIfMetrics.weeklyAppointmentsSet.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Calls" value={whatIfMetrics.weeklyCalls.toLocaleString()} icon={Phone} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Daily Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <MetricCard title="Deals" value={whatIfMetrics.dailyDeals.toLocaleString()} icon={Target} />
                    <MetricCard title="Appointments Run" value={whatIfMetrics.dailyAppointmentsRun.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Appointments Set" value={whatIfMetrics.dailyAppointmentsSet.toLocaleString()} icon={Calendar} />
                    <MetricCard title="Calls" value={whatIfMetrics.dailyCalls.toLocaleString()} icon={Phone} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Referral Impact</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <MetricCard title="Total Referrals Received" value={whatIfMetrics.totalReferralsReceived.toLocaleString()} icon={Users} />
                    <MetricCard title="Deals from Referrals" value={whatIfMetrics.dealsFromReferrals.toLocaleString()} icon={Target} />
                    <MetricCard title="Referral Income" value={`$${whatIfMetrics.referralIncome.toLocaleString()}.00`} icon={DollarSign} />
                    <MetricCard title="Income WITHOUT Referrals" value={`$${whatIfMetrics.incomeWithoutReferrals.toLocaleString()}.00`} icon={DollarSign} />
                    <MetricCard title="Income WITH Referrals" value={`$${whatIfMetrics.incomeWithReferrals.toLocaleString()}.00`} icon={DollarSign} />
                    <MetricCard title="Income Increase %" value={`${whatIfMetrics.incomeIncrease.toFixed(0)}%`} icon={TrendingUp} />
                  </div>
                </CardContent>
              </Card>

              <Card className="glass rounded-xl gradient-border">
                <CardHeader>
                  <CardTitle className="text-theme-primary">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={applyWhatIfToGoals} className="w-full gradient-primary text-white hover:opacity-90">
                    Apply What-If to My Goals
                  </Button>
                  <Button onClick={resetWhatIf} variant="outline" className="w-full border-zinc-600 text-theme-secondary hover:bg-zinc-800">
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

const GoalsPage = () => {
  return (
    <div className="container mx-auto py-6">
      <GoalsCalculator />
    </div>
  )
}

export default GoalsPage
