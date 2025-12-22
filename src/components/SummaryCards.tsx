import type { CalculationResults } from '../types';
import { formatCurrency } from '../utils/calculations';

interface SummaryCardsProps {
  results: CalculationResults;
}

interface CardProps {
  title: string;
  buyValue: string;
  investValue: string;
  buyLabel?: string;
  investLabel?: string;
  highlight?: 'buy' | 'invest' | null;
}

function Card({ title, buyValue, investValue, buyLabel = 'Buy', investLabel = 'Invest', highlight }: CardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-sm font-medium text-gray-500 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className={`text-center p-2 rounded ${highlight === 'buy' ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}>
          <p className="text-xs text-gray-500 mb-1">{buyLabel}</p>
          <p className={`text-lg font-bold ${highlight === 'buy' ? 'text-blue-600' : 'text-blue-500'}`}>
            {buyValue}
          </p>
        </div>
        <div className={`text-center p-2 rounded ${highlight === 'invest' ? 'bg-green-50 ring-2 ring-green-500' : ''}`}>
          <p className="text-xs text-gray-500 mb-1">{investLabel}</p>
          <p className={`text-lg font-bold ${highlight === 'invest' ? 'text-green-600' : 'text-green-500'}`}>
            {investValue}
          </p>
        </div>
      </div>
    </div>
  );
}

export function SummaryCards({ results }: SummaryCardsProps) {
  const {
    finalMortgageNetWorth,
    totalMortgageCost,
    totalRentCost,
    monthlyBreakdown,
    downPayment,
    initialMonthlyContribution,
    initialMonthlyRent,
    finalHomeValue,
    costBreakdown,
  } = results;

  
  const finalPortfolioMinusRent = (results.yearlyResults[results.yearlyResults.length - 1]?.investmentValue ?? 0) - totalRentCost;
  const difference = Math.abs(finalPortfolioMinusRent - finalMortgageNetWorth);
  const investorWins = finalPortfolioMinusRent > finalMortgageNetWorth;

  return (
    <div className="space-y-4">
      {/* Winner banner */}
      <div className={`p-4 rounded-lg text-center ${investorWins ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
        <p className="text-lg font-bold">
          {investorWins ? '📈 Investing Wins!' : '🏠 Buying Wins!'}
        </p>
        <p className="text-sm">
          by {formatCurrency(difference)} in net worth
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          title="Final Assets"
          buyValue={formatCurrency(finalMortgageNetWorth)}
          buyLabel="Home Equity"
          investValue={formatCurrency(finalPortfolioMinusRent)}
          investLabel="Portfolio - Rent"
          highlight={finalPortfolioMinusRent > finalMortgageNetWorth ? 'invest' : 'buy'}
        />

        {/* Total Spent with tooltips */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Total Spent</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className={`text-center p-2 rounded relative group cursor-help ${totalMortgageCost < totalRentCost ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}>
              <p className="text-xs text-gray-500 mb-1">Buy</p>
              <p className={`text-lg font-bold ${totalMortgageCost < totalRentCost ? 'text-blue-600' : 'text-blue-500'}`}>
                {formatCurrency(totalMortgageCost)}
              </p>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                <div className="text-left space-y-1">
                  <div className="flex justify-between gap-4"><span>Down Payment:</span><span>{formatCurrency(costBreakdown.downPayment)}</span></div>
                  <div className="flex justify-between gap-4"><span>Buying Costs:</span><span>{formatCurrency(costBreakdown.buyingCosts)}</span></div>
                  <div className="flex justify-between gap-4"><span>Principal:</span><span>{formatCurrency(costBreakdown.totalPrincipal)}</span></div>
                  <div className="flex justify-between gap-4"><span>Interest:</span><span>{formatCurrency(costBreakdown.totalInterest)}</span></div>
                  <div className="flex justify-between gap-4"><span>Property Tax:</span><span>{formatCurrency(costBreakdown.totalPropertyTax)}</span></div>
                  <div className="flex justify-between gap-4"><span>Maintenance:</span><span>{formatCurrency(costBreakdown.totalMaintenance)}</span></div>
                  <div className="flex justify-between gap-4"><span>Other Costs:</span><span>{formatCurrency(costBreakdown.totalOtherCosts)}</span></div>
                  <div className="border-t border-gray-600 pt-1 flex justify-between gap-4 font-bold"><span>Total:</span><span>{formatCurrency(totalMortgageCost)}</span></div>
                </div>
                <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></span>
              </div>
            </div>
            <div className={`text-center p-2 rounded relative group cursor-help ${totalMortgageCost >= totalRentCost ? 'bg-green-50 ring-2 ring-green-500' : ''}`}>
              <p className="text-xs text-gray-500 mb-1">Invest</p>
              <p className={`text-lg font-bold ${totalMortgageCost >= totalRentCost ? 'text-green-600' : 'text-green-500'}`}>
                {formatCurrency(costBreakdown.initialInvestment + costBreakdown.totalContributions + costBreakdown.totalRentPaid)}
              </p>
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                <div className="text-left space-y-1">
                  <div className="flex justify-between gap-4"><span>Initial Investment:</span><span>{formatCurrency(costBreakdown.initialInvestment)}</span></div>
                  <div className="flex justify-between gap-4"><span>Monthly Contributions:</span><span>{formatCurrency(costBreakdown.totalContributions)}</span></div>
                  <div className="flex justify-between gap-4"><span>Rent Paid:</span><span>{formatCurrency(costBreakdown.totalRentPaid)}</span></div>
                  <div className="border-t border-gray-600 pt-1 flex justify-between gap-4 font-bold"><span>Total:</span><span>{formatCurrency(costBreakdown.initialInvestment + costBreakdown.totalContributions + costBreakdown.totalRentPaid)}</span></div>
                </div>
                <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></span>
              </div>
            </div>
          </div>
        </div>

        <Card
          title="Initial Investment"
          buyValue={formatCurrency(downPayment)}
          buyLabel="Down Payment"
          investValue={formatCurrency(downPayment)}
          investLabel="Initial Portfolio"
        />

        <Card
          title="Monthly Costs"
          buyValue={formatCurrency(monthlyBreakdown.totalMonthlyCost)}
          buyLabel="Mortgage + All Costs"
          investValue={formatCurrency(initialMonthlyRent)}
          investLabel="Rent (Year 1)"
        />
      </div>

      {/* Monthly breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Monthly Mortgage Breakdown</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Principal (avg)</p>
              <p className="font-semibold">{formatCurrency(monthlyBreakdown.principal)}</p>
            </div>
            <div>
              <p className="text-gray-500">Interest (avg)</p>
              <p className="font-semibold">{formatCurrency(monthlyBreakdown.interest)}</p>
            </div>
            <div>
              <p className="text-gray-500">Property Tax</p>
              <p className="font-semibold">{formatCurrency(monthlyBreakdown.propertyTax)}</p>
            </div>
            <div>
              <p className="text-gray-500">Maintenance</p>
              <p className="font-semibold">{formatCurrency(monthlyBreakdown.maintenance)}</p>
            </div>
            <div>
              <p className="text-gray-500">Other Costs</p>
              <p className="font-semibold">{formatCurrency(monthlyBreakdown.otherCosts)}</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between">
              <span className="font-medium">Total Monthly Cost</span>
              <span className="font-bold text-blue-600">{formatCurrency(monthlyBreakdown.totalMonthlyCost)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Monthly Investment Contribution</h3>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Buyer's Monthly Cost</span>
              <span>{formatCurrency(monthlyBreakdown.totalMonthlyCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Renter's Monthly Cost</span>
              <span>- {formatCurrency(initialMonthlyRent)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="flex justify-between">
              <span className="font-medium">Monthly to Investments</span>
              <span className={`font-bold ${initialMonthlyContribution >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(initialMonthlyContribution)}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Renter invests the difference each month. At end, buys home for {formatCurrency(finalHomeValue)}.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
