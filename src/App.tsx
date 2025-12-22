import { useState, useEffect, useCallback } from 'react';
import type { MortgageInputs, InvestmentInputs } from './types';
import { useCalculations } from './hooks/useCalculations';
import { InputPanel } from './components/InputPanel';
import { ResultsChart } from './components/ResultsChart';
import { SummaryCards } from './components/SummaryCards';
import { YearlyBreakdown } from './components/YearlyBreakdown';

const defaultMortgageInputs: MortgageInputs = {
  homePrice: 400000,
  downPaymentPercent: 50,
  mortgageTermYears: 10,
  interestRate: 4,
  yearlyPropertyTax: 2800,
  monthlyMaintenance: 500,
  otherCostsPercent: 0.7,
  buyingCosts: 2000,
};

const defaultInvestmentInputs: InvestmentInputs = {
  monthlyRent: 2300,
  rentIncreaseRate: 2.1,
  investmentReturnRate: 11,
  useManualContribution: false,
  manualMonthlyContribution: 500,
};

// Short keys for URL encoding
const KEY_MAP = {
  homePrice: 'p',
  downPaymentPercent: 'd',
  mortgageTermYears: 't',
  interestRate: 'r',
  yearlyPropertyTax: 'x',
  monthlyMaintenance: 'm',
  otherCostsPercent: 'o',
  buyingCosts: 'b',
  monthlyRent: 'n',
  rentIncreaseRate: 'i',
  investmentReturnRate: 'v',
  useManualContribution: 'u',
  manualMonthlyContribution: 'c',
} as const;

const REVERSE_KEY_MAP = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k])
) as Record<string, string>;

function parseInputsFromURL(): { mortgage: MortgageInputs; investment: InvestmentInputs } | null {
  const params = new URLSearchParams(window.location.search);
  if (params.size === 0) return null;

  try {
    const mortgage = { ...defaultMortgageInputs };
    const investment = { ...defaultInvestmentInputs };

    for (const [shortKey, value] of params.entries()) {
      const fullKey = REVERSE_KEY_MAP[shortKey];
      if (!fullKey) continue;

      if (fullKey in defaultMortgageInputs) {
        (mortgage as unknown as Record<string, number>)[fullKey] = parseFloat(value);
      } else if (fullKey in defaultInvestmentInputs) {
        if (fullKey === 'useManualContribution') {
          (investment as unknown as Record<string, boolean>)[fullKey] = value === '1';
        } else {
          (investment as unknown as Record<string, number>)[fullKey] = parseFloat(value);
        }
      }
    }

    return { mortgage, investment };
  } catch {
    return null;
  }
}

function encodeInputsToURL(mortgage: MortgageInputs, investment: InvestmentInputs): string {
  const params = new URLSearchParams();

  // Only encode values that differ from defaults
  for (const [key, shortKey] of Object.entries(KEY_MAP)) {
    if (key in mortgage) {
      const val = mortgage[key as keyof MortgageInputs];
      const def = defaultMortgageInputs[key as keyof MortgageInputs];
      if (val !== def) params.set(shortKey, String(val));
    } else if (key in investment) {
      const val = investment[key as keyof InvestmentInputs];
      const def = defaultInvestmentInputs[key as keyof InvestmentInputs];
      if (val !== def) params.set(shortKey, key === 'useManualContribution' ? (val ? '1' : '0') : String(val));
    }
  }

  const query = params.toString();
  return `${window.location.origin}${window.location.pathname}${query ? '?' + query : ''}`;
}

function App() {
  const [mortgageInputs, setMortgageInputs] = useState<MortgageInputs>(() => {
    const parsed = parseInputsFromURL();
    return parsed?.mortgage ?? defaultMortgageInputs;
  });
  const [investmentInputs, setInvestmentInputs] = useState<InvestmentInputs>(() => {
    const parsed = parseInputsFromURL();
    return parsed?.investment ?? defaultInvestmentInputs;
  });
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = encodeInputsToURL(mortgageInputs, investmentInputs);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      prompt('Copy this link:', url);
    }
  }, [mortgageInputs, investmentInputs]);

  useEffect(() => {
    const url = encodeInputsToURL(mortgageInputs, investmentInputs);
    window.history.replaceState(null, '', url);
  }, [mortgageInputs, investmentInputs]);

  const results = useCalculations(mortgageInputs, investmentInputs);

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Mortgage vs Investment Calculator
          </h1>
          <p className="text-gray-600 mb-4">
            Compare buying a home vs renting and investing the difference
          </p>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700"
          >
            {copied ? (
              <>
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share
              </>
            )}
          </button>
        </header>

        <div className="space-y-6">
          <InputPanel
            mortgageInputs={mortgageInputs}
            investmentInputs={investmentInputs}
            onMortgageChange={setMortgageInputs}
            onInvestmentChange={setInvestmentInputs}
          />

          <SummaryCards results={results} />

          <ResultsChart yearlyResults={results.yearlyResults} />

          <YearlyBreakdown yearlyResults={results.yearlyResults} />
        </div>

        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>
            This calculator is for educational purposes only.
            Consult a financial advisor for personalized advice.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
