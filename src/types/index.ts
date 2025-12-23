export type DownPaymentUnit = 'percent' | 'dollar';
export type TaxUnit = 'dollarYearly' | 'percent';
export type MaintenanceUnit = 'dollarMonthly' | 'dollarYearly' | 'percent';
export type OtherCostsUnit = 'percent' | 'dollarMonthly' | 'dollarYearly';

export interface MortgageInputs {
  homePrice: number;
  downPayment: number;
  downPaymentUnit: DownPaymentUnit;
  mortgageTermYears: number;
  interestRate: number;
  propertyTax: number;
  propertyTaxUnit: TaxUnit;
  maintenance: number;
  maintenanceUnit: MaintenanceUnit;
  otherCosts: number;
  otherCostsUnit: OtherCostsUnit;
  buyingCosts: number;
}

export interface InvestmentInputs {
  monthlyRent: number;
  rentIncreaseRate: number;
  investmentReturnRate: number;
  useManualContribution: boolean;
  manualMonthlyContribution: number;
}

export interface YearlyResult {
  year: number;
  // Mortgage strategy
  homeValue: number;
  remainingBalance: number;
  homeEquity: number;
  mortgageCumulativeCost: number;
  // Investment strategy
  investmentValue: number;
  rentCumulativeCost: number;
  // Comparison
  mortgageNetWorth: number;
  investmentNetWorth: number;
  difference: number;
}

export interface MonthlyBreakdown {
  mortgagePayment: number;
  principal: number;
  interest: number;
  propertyTax: number;
  maintenance: number;
  otherCosts: number;
  totalMonthlyCost: number;
}

export interface CostBreakdown {
  // Buy strategy
  downPayment: number;
  buyingCosts: number;
  totalPrincipal: number;
  totalInterest: number;
  totalPropertyTax: number;
  totalMaintenance: number;
  totalOtherCosts: number;
  // Invest strategy
  initialInvestment: number;
  totalContributions: number;
  totalRentPaid: number;
}

export interface CalculationResults {
  yearlyResults: YearlyResult[];
  monthlyBreakdown: MonthlyBreakdown;
  costBreakdown: CostBreakdown;
  downPayment: number;
  loanAmount: number;
  finalMortgageNetWorth: number;
  finalInvestmentNetWorth: number;
  totalMortgageCost: number;
  totalRentCost: number;
  winner: 'mortgage' | 'investment';
  initialMonthlyContribution: number;
  initialMonthlyRent: number;
  monthlyHomeSavings: number;
  finalHomeValue: number;
}
