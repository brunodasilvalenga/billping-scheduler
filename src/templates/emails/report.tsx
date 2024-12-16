import { Body, Container, Column, Head, Html, Img, Preview, Row, Section, Text, Link, Tailwind } from '@react-email/components'
import { DailyCost } from '../../services/awsCostManager'

interface CloudCostReportEmailTemplateProps {
  accountName: string
  userName: string
  provider: 'Azure' | 'AWS' | 'GCP'
  reportPeriod: string
  periodCost: number
  periodChange: number
  monthCost: number
  monthChange: number
  forecast: number
  forecastMonth: string
  accentColor?: string
  lastPeriodCost: number
  lastMonthCost: number
  forecastChange: number
  lastSevenDaysDailyCost: DailyCost[]
}

export default function CloudCostReportEmailTemplate({
  accountName = 'Acme Inc.',
  userName = 'Bruno Valenga',
  provider = 'AWS',
  reportPeriod = 'June 1 - June 7, 2023',
  periodCost = 21.58,
  periodChange = 25,
  monthCost = 189.58,
  monthChange = -5,
  forecast = 189.58,
  forecastMonth = 'December',
  accentColor = '#0066FF',
  lastPeriodCost = 12.5,
  lastMonthCost = 123,
  forecastChange = 12,
  lastSevenDaysDailyCost = [],
}: CloudCostReportEmailTemplateProps) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Preview>Your Weekly Cloud Cost Report for {accountName}</Preview>

        <Body className="bg-gray-100 font-sans">
          <Container>
            <Section className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Header */}
              <Row className="bg-gray-50 px-8 py-6">
                <Column>
                  <Img
                    src={`https://www.billping.com/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Flogo-color.09a438dc.png&w=256&q=75`}
                    alt="BillPing Logo"
                    className="w-14"
                  />
                </Column>
              </Row>

              {/* Main Content */}
              <Section className="py-6">
                <Text className="text-xl font-bold text-gray-800 mb-2 text-center">Hello, {userName}</Text>
                <Text className="text-base text-gray-600 text-center">
                  <strong>
                    {provider} - {accountName}
                  </strong>
                </Text>
                <Text className="text-base text-gray-600 text-center">Here's your cost report for the period of:</Text>
                <Text className="text-sm text-gray-600 mb-6 pt-[-60px] text-center">
                  <strong>{reportPeriod}</strong>
                </Text>

                {/* Cost Overview */}
                <Row className="py-8">
                  <Column className="text-center align-top">
                    <Text className="text-xm font-semibold text-gray-500 uppercase mb-2">Yesterday</Text>
                    <Text className="text-2xl font-bold" style={{ color: accentColor }}>
                      ${periodCost.toFixed(2)}
                    </Text>
                    <Text className="text-[10px] text-gray-800">
                      <span className={periodChange >= 0 ? 'text-red-500' : 'text-green-500'}>
                        {periodChange > 0 ? '↑' : '↓'} {Math.abs(periodChange)}%
                      </span>{' '}
                      from last week
                    </Text>
                    <Text className="text-[10px] text-gray-500">Last week: ${lastPeriodCost.toFixed(2)}</Text>
                  </Column>
                  <Column className="text-center align-top" style={{ borderLeft: `1px solid #e5e7eb`, borderRight: `1px solid #e5e7eb` }}>
                    <Text className="text-xm font-semibold text-gray-500 uppercase mb-2">Month to Date</Text>
                    <Text className="text-2xl font-bold text-gray-800">${monthCost.toFixed(2)}</Text>
                    <Text className="text-[10px] text-gray-800">
                      <span className={monthChange >= 0 ? 'text-red-500' : 'text-green-500'}>
                        {monthChange > 0 ? '↑' : '↓'} {Math.abs(monthChange)}%
                      </span>{' '}
                      from last month
                    </Text>
                    <Text className="text-[10px] text-gray-500">Last month: ${lastMonthCost.toFixed(2)}</Text>
                  </Column>
                  <Column className="text-center align-top">
                    <Text className="text-xm font-semibold text-gray-500 uppercase mb-2">Forecast</Text>
                    <Text className="text-2xl font-bold text-gray-800">${forecast.toFixed(2)}</Text>
                    <Text className="text-[10px] text-gray-800">
                      <span className={forecastChange >= 0 ? 'text-red-500' : 'text-green-500'}>
                        {forecastChange > 0 ? '↑' : '↓'} {Math.abs(forecastChange)}%
                      </span>{' '}
                      vs last month
                    </Text>
                    <Text className="text-[10px] text-gray-500">{forecastMonth}</Text>
                  </Column>
                </Row>
                <Section className="p-6">
                  <Text className="text-xm font-bold text-gray-500 uppercase mb-2 text-center">Last 7 days</Text>
                  <Row className="border-b border-gray-200 pb-4">
                    {lastSevenDaysDailyCost.map((item, index) => (
                      <Column key={item.day} className="text-center" style={index > 0 ? { borderLeft: `1px solid #e5e7eb` } : {}}>
                        <Text className="text-gray-600 text-sm">{item.day}</Text>
                        <Text className="text-[10px] font-bold">${item.cost.toFixed(2)}</Text>
                      </Column>
                    ))}
                  </Row>
                  <Text className="text-sm text-gray-600 mt-2 text-center">
                    Average per day: ${(lastSevenDaysDailyCost.reduce((sum, item) => sum + item.cost, 0) / lastSevenDaysDailyCost.length).toFixed(2)}
                  </Text>
                </Section>

                {/* CTA */}
                <Section className="mt-8 text-center">
                  <Link
                    href="https://app.billping.com/dashboard"
                    className="inline-block px-4 py-1.5 text-sm font-semibold text-white rounded-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    Report Settings
                  </Link>
                </Section>
              </Section>

              {/* Footer */}
              <Section className="px-8 py-4 bg-gray-50 text-center">
                <Text className="text-xs text-gray-500">You're receiving this email because you've subscribed to weekly reports from Bill Ping.</Text>
                <Text className="text-xs text-gray-500 mt-2">
                  <Link href="#" className="text-blue-600 hover:underline">
                    Unsubscribe
                  </Link>{' '}
                  or{' '}
                  <Link href="#" className="text-blue-600 hover:underline">
                    Update preferences
                  </Link>
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  )
}
