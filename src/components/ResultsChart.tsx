import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { YearlyResult } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ResultsChartProps {
  yearlyResults: YearlyResult[];
}

function formatCompact(value: number): string {
  if (Math.abs(value) >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `$${Math.round(value / 1000)}k`;
  }
  return `$${value}`;
}

export function ResultsChart({ yearlyResults }: ResultsChartProps) {
  const data = yearlyResults.map((result) => ({
    year: result.year,
    buy: Math.round(result.mortgageNetWorth),
    invest: Math.round(result.investmentValue - result.rentCumulativeCost),
  }));

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Net Worth Over Time</h2>

      {/* Legend - compact and above chart */}
      <div className="flex justify-center gap-4 sm:gap-6 mb-3 text-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-600"></span>
          <span className="text-gray-600">Buy</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-600"></span>
          <span className="text-gray-600">Invest</span>
        </div>
      </div>

      <div className="h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatCompact}
              tick={{ fontSize: 11 }}
              stroke="#9ca3af"
              width={50}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrency(value),
                name === 'buy' ? 'Buy (Home Equity)' : 'Invest (Portfolio)'
              ]}
              labelFormatter={(label) => `Year ${label}`}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Line
              type="monotone"
              dataKey="buy"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ fill: '#2563eb', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 6 }}
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="invest"
              stroke="#16a34a"
              strokeWidth={2.5}
              dot={{ fill: '#16a34a', strokeWidth: 0, r: 3 }}
              activeDot={{ r: 6 }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
