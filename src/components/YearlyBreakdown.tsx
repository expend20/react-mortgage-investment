import type { YearlyResult } from '../types';
import { formatCurrency } from '../utils/calculations';

interface YearlyBreakdownProps {
  yearlyResults: YearlyResult[];
}

export function YearlyBreakdown({ yearlyResults }: YearlyBreakdownProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Year-by-Year Breakdown</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="py-3 px-4 text-left font-semibold text-gray-600">Year</th>
            <th className="py-3 px-4 text-right font-semibold text-blue-600" colSpan={4}>
              Buy Strategy
            </th>
            <th className="py-3 px-4 text-right font-semibold text-green-600" colSpan={2}>
              Invest Strategy
            </th>
            <th className="py-3 px-4 text-right font-semibold text-gray-600">Difference</th>
          </tr>
          <tr className="border-b border-gray-100 text-xs text-gray-500">
            <th className="py-2 px-4 text-left"></th>
            <th className="py-2 px-4 text-right">Home Value</th>
            <th className="py-2 px-4 text-right">Balance</th>
            <th className="py-2 px-4 text-right">Equity</th>
            <th className="py-2 px-4 text-right">Total Costs</th>
            <th className="py-2 px-4 text-right">Portfolio</th>
            <th className="py-2 px-4 text-right">Rent Paid</th>
            <th className="py-2 px-4 text-right">Invest - Buy</th>
          </tr>
        </thead>
        <tbody>
          {yearlyResults.map((result) => (
            <tr
              key={result.year}
              className={`border-b border-gray-100 hover:bg-gray-50 ${result.year === 0 ? 'bg-gray-50' : ''}`}
            >
              <td className="py-3 px-4 font-medium">
                {result.year === 0 ? 'Start' : `Year ${result.year}`}
              </td>
              <td className="py-3 px-4 text-right text-blue-600">
                {formatCurrency(result.homeValue)}
              </td>
              <td className="py-3 px-4 text-right text-gray-500">
                {formatCurrency(result.remainingBalance)}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-blue-700">
                {formatCurrency(result.homeEquity)}
              </td>
              <td className="py-3 px-4 text-right text-gray-500">
                {formatCurrency(result.mortgageCumulativeCost)}
              </td>
              <td className="py-3 px-4 text-right font-semibold text-green-600">
                {formatCurrency(result.investmentValue)}
              </td>
              <td className="py-3 px-4 text-right text-gray-500">
                {formatCurrency(result.rentCumulativeCost)}
              </td>
              {(() => {
                const investNetWorth = result.investmentValue - result.rentCumulativeCost;
                const diff = investNetWorth - result.homeEquity;
                return (
                  <td
                    className={`py-3 px-4 text-right font-semibold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-blue-600' : 'text-gray-500'} relative group cursor-help`}
                  >
                    {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                    <div className="absolute right-0 bottom-full mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      <div className="text-green-400">Invest: {formatCurrency(result.investmentValue)} - {formatCurrency(result.rentCumulativeCost)} = {formatCurrency(investNetWorth)}</div>
                      <div className="text-blue-400">Buy: {formatCurrency(result.homeEquity)}</div>
                      <div className="border-t border-gray-600 mt-1 pt-1">
                        {formatCurrency(investNetWorth)} - {formatCurrency(result.homeEquity)} = {formatCurrency(diff)}
                      </div>
                      <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></span>
                    </div>
                  </td>
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
