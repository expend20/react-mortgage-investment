import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { YearlyResult } from '../types';
import { formatCurrency } from '../utils/calculations';

interface ResultsChartProps {
  yearlyResults: YearlyResult[];
}

export function ResultsChart({ yearlyResults }: ResultsChartProps) {
  const data = yearlyResults.map((result) => ({
    year: `Year ${result.year}`,
    'Buy (Home Equity)': Math.round(result.mortgageNetWorth),
    'Invest (Portfolio - Rent)': Math.round(result.investmentValue - result.rentCumulativeCost),
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Net Worth Over Time</h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
            />
            <YAxis
              tickFormatter={(value) => formatCurrency(value)}
              tick={{ fontSize: 12 }}
              stroke="#6b7280"
              width={80}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="Buy (Home Equity)"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ fill: '#2563eb', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
              animationDuration={300}
            />
            <Line
              type="monotone"
              dataKey="Invest (Portfolio - Rent)"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{ fill: '#16a34a', strokeWidth: 2 }}
              activeDot={{ r: 8 }}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
