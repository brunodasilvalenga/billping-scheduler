import { CostExplorerClient, GetCostAndUsageCommand, GetCostForecastCommand } from '@aws-sdk/client-cost-explorer'
import { AwsCredentialIdentity } from '@aws-sdk/types'
import { startOfMonth, endOfMonth, addDays, format, subMonths, subDays } from 'date-fns'
import { TZDate } from '@date-fns/tz'

export interface DailyCost {
  day: string
  cost: number
}

export interface CostReport {
  reportPeriod: string
  periodCost: number
  previousPeriodCost: number
  periodChange: number
  monthCostToDate: number
  previousMonthCost: number
  forecast: number
  forecastMonth: string
  forecastChange: number
  monthChange: number
  getLastSevenDaysDailyCost: DailyCost[]
}

export interface DateRange {
  startDate: string // Format: 'YYYY-MM-DD'
  endDate: string // Format: 'YYYY-MM-DD'
}

export interface AWSClientConfig {
  region?: string
  credentials?: AwsCredentialIdentity | (() => Promise<AwsCredentialIdentity>)
}

export class AWSCostManager {
  private client: CostExplorerClient

  constructor(config: AWSClientConfig) {
    this.client = new CostExplorerClient({
      region: config.region ?? 'us-east-1',
      credentials: config.credentials,
    })
  }

  async getCostReport(dateRange: DateRange): Promise<CostReport> {
    try {
      const startDate = dateRange.startDate
      const endDate = format(addDays(dateRange.endDate, 1), 'yyyy-MM-dd')
      const today = TZDate.tz('Australia/Sydney')

      // Validate date format
      if (!this.isValidDateFormat(startDate) || !this.isValidDateFormat(endDate)) {
        throw new Error('Invalid date format. Use YYYY-MM-DD')
      }

      // Get current period costs
      const periodCostData = await this.client.send(
        new GetCostAndUsageCommand({
          TimePeriod: {
            Start: startDate,
            End: endDate,
          },
          Granularity: 'DAILY',
          Metrics: ['UnblendedCost'],
        }),
      )

      // Get previous period costs for comparison
      const previousStartDate = format(addDays(new Date(startDate), -7), 'yyyy-MM-dd')
      const previousEndDate = format(addDays(new Date(endDate), -7), 'yyyy-MM-dd')
      const previousPeriodCostData = await this.client.send(
        new GetCostAndUsageCommand({
          TimePeriod: {
            Start: previousStartDate,
            End: previousEndDate,
          },
          Granularity: 'DAILY',
          Metrics: ['UnblendedCost'],
        }),
      )

      // Get month-to-date costs
      const monthStart = startOfMonth(today).toISOString().split('T')[0]
      const monthEnd = endOfMonth(today).toISOString().split('T')[0]
      const monthCostData = await this.client.send(
        new GetCostAndUsageCommand({
          TimePeriod: {
            Start: monthStart,
            End: monthEnd,
          },
          Granularity: 'MONTHLY',
          Metrics: ['UnblendedCost'],
        }),
      )

      // Get previous month costs for comparison
      const lastMonth = subMonths(today, 1)
      const previousMonthStart = startOfMonth(lastMonth).toISOString().split('T')[0]
      const previousMonthEnd = addDays(endOfMonth(lastMonth), 1).toISOString().split('T')[0]

      const previousMonthCostData = await this.client.send(
        new GetCostAndUsageCommand({
          TimePeriod: {
            Start: previousMonthStart,
            End: previousMonthEnd,
          },
          Granularity: 'MONTHLY',
          Metrics: ['UnblendedCost'],
        }),
      )

      // Get forecast for the rest of the month
      const forecastData = await this.client.send(
        new GetCostForecastCommand({
          TimePeriod: {
            Start: format(new Date(), 'yyyy-MM-dd'),
            End: monthEnd,
          },
          Metric: 'UNBLENDED_COST',
          Granularity: 'MONTHLY',
        }),
      )

      const lastSevenDaysStartDate = format(subDays(today, 7), 'yyyy-MM-dd')
      const lastSevenDaysEndDate = format(today, 'yyyy-MM-dd')

      const getLastSevenDaysDailyCosts = await this.client.send(
        new GetCostAndUsageCommand({
          TimePeriod: {
            Start: lastSevenDaysStartDate,
            End: lastSevenDaysEndDate,
          },
          Granularity: 'DAILY',
          Metrics: ['UnblendedCost'],
        }),
      )

      const getLastSevenDaysDailyCostData: DailyCost[] =
        getLastSevenDaysDailyCosts.ResultsByTime?.map(day => ({
          day: format(new Date(day.TimePeriod?.Start || ''), 'EEE'),
          cost: Number(parseFloat(day.Total?.UnblendedCost?.Amount || '0').toFixed(2)),
        })) || []

      const periodCost = this.calculateCost(periodCostData)
      const previousPeriodCost = this.calculateCost(previousPeriodCostData)
      const monthCost = this.calculateCost(monthCostData)
      const previousMonthCost = this.calculateCost(previousMonthCostData)
      const forecastCost = Number(forecastData.Total?.Amount) || 0

      return {
        reportPeriod: `${this.formatDate(startDate)} - ${this.formatDate(endDate)}`,
        periodCost: Number(periodCost.toFixed(2)),
        previousPeriodCost: Number(previousPeriodCost.toFixed(2)),
        periodChange: this.calculateChange(periodCost, previousPeriodCost),
        monthCostToDate: Number(monthCost.toFixed(2)),
        previousMonthCost: Number(previousMonthCost.toFixed(2)),
        monthChange: this.calculateChange(monthCost, previousMonthCost),
        forecast: Number(forecastCost.toFixed(2)),
        forecastMonth: format(new Date(monthEnd), 'MMMM yyyy'),
        forecastChange: this.calculateChange(forecastCost, previousMonthCost),
        getLastSevenDaysDailyCost: getLastSevenDaysDailyCostData,
      }
    } catch (error) {
      console.error('Error fetching cost data:', error)
      throw error
    }
  }

  private isValidDateFormat(date: string): boolean {
    const regex = /^\d{4}-\d{2}-\d{2}$/
    return regex.test(date) && !isNaN(Date.parse(date))
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString)
    return format(date, 'MMMM d, yyyy')
  }

  private calculateCost(data: any): number {
    return (
      data.ResultsByTime?.reduce((total: number, period: any) => {
        const cost = parseFloat(period.Total?.UnblendedCost?.Amount || 0)
        return total + cost
      }, 0) || 0
    )
  }

  private calculateChange(currentValue: number, previousValue: number): number {
    if (previousValue === 0) return 0
    const change = ((currentValue - previousValue) / previousValue) * 100
    return Number(change.toFixed(2))
  }
}
