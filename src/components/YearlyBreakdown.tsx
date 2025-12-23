import { useState } from 'react';
import type { YearlyResult } from '../types';
import { formatCurrency } from '../utils/calculations';

interface YearlyBreakdownProps {
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

type MobileView = 'summary' | 'buy' | 'invest';

export function YearlyBreakdown({ yearlyResults }: YearlyBreakdownProps) {
  const [mobileView, setMobileView] = useState<MobileView>('summary');

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Year-by-Year Breakdown</h2>

      {/* Mobile view toggle */}
      <div className="flex sm:hidden rounded-lg border border-gray-200 mb-4 text-sm overflow-hidden">
        <button
          onClick={() => setMobileView('summary')}
          className={`flex-1 py-2 px-3 transition-colors ${mobileView === 'summary' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
        >
          Summary
        </button>
        <button
          onClick={() => setMobileView('buy')}
          className={`flex-1 py-2 px-3 border-l border-gray-200 transition-colors ${mobileView === 'buy' ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50'}`}
        >
          Buy
        </button>
        <button
          onClick={() => setMobileView('invest')}
          className={`flex-1 py-2 px-3 border-l border-gray-200 transition-colors ${mobileView === 'invest' ? 'bg-green-50 text-green-700 font-medium' : 'hover:bg-gray-50'}`}
        >
          Invest
        </button>
      </div>

      {/* Mobile Summary View */}
      <div className={`sm:hidden ${mobileView === 'summary' ? '' : 'hidden'}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs">
              <th className="py-2 px-2 text-left text-gray-500">Year</th>
              <th className="py-2 px-2 text-right text-blue-600">Buy</th>
              <th className="py-2 px-2 text-right text-green-600">Invest</th>
              <th className="py-2 px-2 text-right text-gray-500">Diff</th>
            </tr>
          </thead>
          <tbody>
            {yearlyResults.map((result) => {
              const investNetWorth = result.investmentValue - result.rentCumulativeCost;
              const diff = investNetWorth - result.homeEquity;
              return (
                <tr key={result.year} className="border-b border-gray-100">
                  <td className="py-2.5 px-2 font-medium text-gray-700">
                    {result.year === 0 ? '0' : result.year}
                  </td>
                  <td className="py-2.5 px-2 text-right text-blue-600 font-medium">
                    {formatCompact(result.homeEquity)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-green-600 font-medium">
                    {formatCompact(investNetWorth)}
                  </td>
                  <td className={`py-2.5 px-2 text-right font-medium ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-blue-600' : 'text-gray-400'}`}>
                    {diff > 0 ? '+' : ''}{formatCompact(diff)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Buy View */}
      <div className={`sm:hidden ${mobileView === 'buy' ? '' : 'hidden'}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs text-gray-500">
              <th className="py-2 px-2 text-left">Year</th>
              <th className="py-2 px-2 text-right">Home</th>
              <th className="py-2 px-2 text-right">Owed</th>
              <th className="py-2 px-2 text-right">Equity</th>
            </tr>
          </thead>
          <tbody>
            {yearlyResults.map((result) => (
              <tr key={result.year} className="border-b border-gray-100">
                <td className="py-2.5 px-2 font-medium text-gray-700">
                  {result.year === 0 ? '0' : result.year}
                </td>
                <td className="py-2.5 px-2 text-right text-gray-600">
                  {formatCompact(result.homeValue)}
                </td>
                <td className="py-2.5 px-2 text-right text-gray-500">
                  {formatCompact(result.remainingBalance)}
                </td>
                <td className="py-2.5 px-2 text-right text-blue-600 font-medium">
                  {formatCompact(result.homeEquity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Invest View */}
      <div className={`sm:hidden ${mobileView === 'invest' ? '' : 'hidden'}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 text-xs text-gray-500">
              <th className="py-2 px-2 text-left">Year</th>
              <th className="py-2 px-2 text-right">Portfolio</th>
              <th className="py-2 px-2 text-right">Rent</th>
              <th className="py-2 px-2 text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {yearlyResults.map((result) => {
              const netWorth = result.investmentValue - result.rentCumulativeCost;
              return (
                <tr key={result.year} className="border-b border-gray-100">
                  <td className="py-2.5 px-2 font-medium text-gray-700">
                    {result.year === 0 ? '0' : result.year}
                  </td>
                  <td className="py-2.5 px-2 text-right text-gray-600">
                    {formatCompact(result.investmentValue)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-gray-500">
                    {formatCompact(result.rentCumulativeCost)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-green-600 font-medium">
                    {formatCompact(netWorth)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Desktop full table */}
      <div className="hidden sm:block overflow-x-auto">
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
                      className={`py-3 px-4 text-right font-semibold ${diff > 0 ? 'text-green-600' : diff < 0 ? 'text-blue-600' : 'text-gray-500'}`}
                    >
                      {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                    </td>
                  );
                })()}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
