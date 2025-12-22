import type { MortgageInputs, InvestmentInputs, CalculationResults } from '../types';
import { calculateResults } from '../utils/calculations';

export function useCalculations(
  mortgageInputs: MortgageInputs,
  investmentInputs: InvestmentInputs
): CalculationResults {
  // Recalculate on every render since inputs change frequently
  return calculateResults(mortgageInputs, investmentInputs);
}
