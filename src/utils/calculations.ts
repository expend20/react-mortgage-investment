import type { MortgageInputs, InvestmentInputs, YearlyResult, MonthlyBreakdown, CalculationResults, CostBreakdown } from '../types';

export function calculateMonthlyMortgagePayment(
  principal: number,
  annualRate: number,
  termYears: number
): number {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;

  if (monthlyRate === 0) {
    return principal / numPayments;
  }

  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1)
  );
}

export function calculateRemainingBalance(
  principal: number,
  annualRate: number,
  termYears: number,
  monthsPaid: number
): number {
  const monthlyRate = annualRate / 12;
  const numPayments = termYears * 12;

  if (monthlyRate === 0) {
    return principal - (principal / numPayments) * monthsPaid;
  }

  const monthlyPayment = calculateMonthlyMortgagePayment(principal, annualRate, termYears);

  return (
    principal * Math.pow(1 + monthlyRate, monthsPaid) -
    monthlyPayment * ((Math.pow(1 + monthlyRate, monthsPaid) - 1) / monthlyRate)
  );
}

export function calculateResults(
  mortgageInputs: MortgageInputs,
  investmentInputs: InvestmentInputs
): CalculationResults {
  const {
    homePrice,
    downPaymentPercent,
    mortgageTermYears,
    interestRate,
    yearlyPropertyTax,
    monthlyMaintenance,
    otherCostsPercent,
    buyingCosts,
  } = mortgageInputs;

  const {
    monthlyRent,
    rentIncreaseRate,
    investmentReturnRate,
    useManualContribution,
    manualMonthlyContribution,
  } = investmentInputs;

  // Calculate initial values
  const downPayment = homePrice * (downPaymentPercent / 100);
  const loanAmount = homePrice - downPayment;

  // Monthly mortgage payment (P&I only)
  const monthlyMortgagePI = calculateMonthlyMortgagePayment(
    loanAmount,
    interestRate / 100,
    mortgageTermYears
  );

  // Monthly costs for homeowner (using fixed amounts)
  const monthlyPropertyTax = yearlyPropertyTax / 12;
  const monthlyOtherCostsAmount = homePrice * (otherCostsPercent / 100) / 12;
  const totalMonthlyMortgageCost = monthlyMortgagePI + monthlyPropertyTax + monthlyMaintenance + monthlyOtherCostsAmount;

  // Calculate average monthly principal and interest
  const totalMonths = mortgageTermYears * 12;
  const avgMonthlyPrincipal = loanAmount / totalMonths;
  const avgMonthlyInterest = monthlyMortgagePI - avgMonthlyPrincipal;

  const monthlyBreakdown: MonthlyBreakdown = {
    mortgagePayment: monthlyMortgagePI,
    principal: avgMonthlyPrincipal,
    interest: avgMonthlyInterest,
    propertyTax: monthlyPropertyTax,
    maintenance: monthlyMaintenance,
    otherCosts: monthlyOtherCostsAmount,
    totalMonthlyCost: totalMonthlyMortgageCost,
  };

  const yearlyResults: YearlyResult[] = [];

  // Track cumulative values (include one-time buying costs)
  let mortgageCumulativeCost = downPayment + buyingCosts;
  let rentCumulativeCost = 0;
  let investmentValue = downPayment;
  let currentMonthlyRent = monthlyRent;

  // Monthly investment return rate
  const monthlyInvestmentReturn = Math.pow(1 + investmentReturnRate / 100, 1/12) - 1;

  // Home value stays constant (no appreciation)
  const finalHomeValue = homePrice;

  // No monthly home savings - renter invests everything and buys home at end
  const monthlyHomeSavings = 0;

  // Yearly other costs (as percentage of home value)
  const yearlyOtherCosts = homePrice * (otherCostsPercent / 100);

  // Track cost breakdown totals
  let totalContributions = 0;
  let totalPropertyTaxPaid = 0;
  let totalMaintenancePaid = 0;
  let totalOtherCostsPaid = 0;

  // Year 0 - starting point (includes one-time buying costs)
  yearlyResults.push({
    year: 0,
    homeValue: homePrice,
    remainingBalance: loanAmount,
    homeEquity: downPayment,
    mortgageCumulativeCost: downPayment + buyingCosts,
    investmentValue: downPayment,
    rentCumulativeCost: 0,
    mortgageNetWorth: downPayment,
    investmentNetWorth: downPayment,
    difference: 0,
  });

  // Calculate for each year
  for (let year = 1; year <= mortgageTermYears; year++) {
    // Home value stays constant (no appreciation)
    const homeValue = homePrice;

    // Remaining mortgage balance at end of year
    const remainingBalance = Math.max(0, calculateRemainingBalance(
      loanAmount,
      interestRate / 100,
      mortgageTermYears,
      year * 12
    ));

    // Home equity
    const homeEquity = homeValue - remainingBalance;

    // Calculate costs for this year (using fixed amounts)
    const yearPropertyTax = yearlyPropertyTax;
    const yearMaintenance = monthlyMaintenance * 12;
    const yearMortgagePayments = monthlyMortgagePI * 12;

    mortgageCumulativeCost += yearMortgagePayments + yearPropertyTax + yearMaintenance + yearlyOtherCosts;

    // Track breakdown totals
    totalPropertyTaxPaid += yearPropertyTax;
    totalMaintenancePaid += yearMaintenance;
    totalOtherCostsPaid += yearlyOtherCosts;

    // Investment strategy - simulate month by month for this year
    for (let month = 0; month < 12; month++) {
      // Monthly contribution = mortgage costs - rent - home savings
      // Renter pays: rent + saves toward buying home at end
      const monthlyOtherCosts = yearlyOtherCosts / 12;
      const currentTotalMortgageCost = monthlyMortgagePI +
        monthlyPropertyTax +
        monthlyMaintenance +
        monthlyOtherCosts;

      const renterTotalMonthlyCost = currentMonthlyRent + monthlyHomeSavings;
      const monthlySavings = useManualContribution
        ? manualMonthlyContribution
        : currentTotalMortgageCost - renterTotalMonthlyCost;

      // Investment grows first
      investmentValue *= (1 + monthlyInvestmentReturn);

      // Then add savings (positive) or the renter pays more (negative means no contribution)
      // With manual contribution, always add the specified amount
      if (useManualContribution || monthlySavings > 0) {
        investmentValue += monthlySavings;
        totalContributions += monthlySavings;
      }

      // Track rent cost (including home savings)
      rentCumulativeCost += renterTotalMonthlyCost;
    }

    // Increase rent for next year
    currentMonthlyRent *= (1 + rentIncreaseRate / 100);

    // Net worth calculations
    // Buyer: owns home equity
    const mortgageNetWorth = homeEquity;
    // Renter: investments minus cost to buy home at current value (fair comparison)
    // Both strategies end with owning the home
    const investmentNetWorth = investmentValue - homeValue;

    yearlyResults.push({
      year,
      homeValue,
      remainingBalance,
      homeEquity,
      mortgageCumulativeCost,
      investmentValue,
      rentCumulativeCost,
      mortgageNetWorth,
      investmentNetWorth,
      difference: investmentNetWorth - mortgageNetWorth,
    });
  }

  const finalYear = yearlyResults[yearlyResults.length - 1];

  // Initial monthly contribution = manual or calculated (mortgage costs - rent)
  const initialMonthlyContribution = useManualContribution
    ? manualMonthlyContribution
    : totalMonthlyMortgageCost - (monthlyRent + monthlyHomeSavings);

  // Calculate principal and interest breakdown
  const totalMortgagePayments = monthlyMortgagePI * 12 * mortgageTermYears;
  const totalPrincipal = loanAmount; // Principal paid = loan amount (fully paid off)
  const totalInterest = totalMortgagePayments - totalPrincipal;

  const costBreakdown: CostBreakdown = {
    // Buy strategy
    downPayment,
    buyingCosts,
    totalPrincipal,
    totalInterest,
    totalPropertyTax: totalPropertyTaxPaid,
    totalMaintenance: totalMaintenancePaid,
    totalOtherCosts: totalOtherCostsPaid,
    // Invest strategy
    initialInvestment: downPayment,
    totalContributions,
    totalRentPaid: finalYear.rentCumulativeCost,
  };

  return {
    yearlyResults,
    monthlyBreakdown,
    costBreakdown,
    downPayment,
    loanAmount,
    finalMortgageNetWorth: finalYear.mortgageNetWorth,
    finalInvestmentNetWorth: finalYear.investmentNetWorth,
    totalMortgageCost: finalYear.mortgageCumulativeCost,
    totalRentCost: finalYear.rentCumulativeCost,
    winner: finalYear.investmentNetWorth > finalYear.mortgageNetWorth ? 'investment' : 'mortgage',
    initialMonthlyContribution,
    initialMonthlyRent: monthlyRent,
    monthlyHomeSavings,
    finalHomeValue,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}
