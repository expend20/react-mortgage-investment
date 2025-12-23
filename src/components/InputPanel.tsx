import React from 'react';
import type { MortgageInputs, InvestmentInputs, DownPaymentUnit, TaxUnit, MaintenanceUnit, OtherCostsUnit } from '../types';

interface InputPanelProps {
  mortgageInputs: MortgageInputs;
  investmentInputs: InvestmentInputs;
  onMortgageChange: (inputs: MortgageInputs) => void;
  onInvestmentChange: (inputs: InvestmentInputs) => void;
}

interface InputFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  step?: number;
  min?: number;
  max?: number;
  tooltip?: string;
}

interface UnitOption<T extends string> {
  value: T;
  label: string;
  prefix?: string;
  suffix?: string;
  step: number;
  min?: number;
  max?: number;
}

interface InputFieldWithUnitProps<T extends string> {
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: T;
  onUnitChange: (unit: T, convertedValue: number) => void;
  units: UnitOption<T>[];
  tooltip?: string;
  convertValue: (value: number, fromUnit: T, toUnit: T) => number;
}

function useInputHandlers(
  value: number,
  onChange: (value: number) => void,
  step: number,
  min?: number,
  max?: number
) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  const increment = React.useCallback(() => {
    const decimals = (step.toString().split('.')[1] || '').length;
    let newValue = Math.round((value + step) * Math.pow(10, decimals)) / Math.pow(10, decimals);
    if (max !== undefined) newValue = Math.min(max, newValue);
    onChange(newValue);
  }, [value, onChange, step, max]);

  const decrement = React.useCallback(() => {
    const decimals = (step.toString().split('.')[1] || '').length;
    let newValue = Math.round((value - step) * Math.pow(10, decimals)) / Math.pow(10, decimals);
    if (min !== undefined) newValue = Math.max(min, newValue);
    onChange(newValue);
  }, [value, onChange, step, min]);

  // Scroll wheel support for desktop
  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === el) {
        e.preventDefault();
        const decimals = (step.toString().split('.')[1] || '').length;
        const delta = e.deltaY < 0 ? step : -step;
        let newValue = Math.round((value + delta) * Math.pow(10, decimals)) / Math.pow(10, decimals);
        if (min !== undefined) newValue = Math.max(min, newValue);
        if (max !== undefined) newValue = Math.min(max, newValue);
        onChange(newValue);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [value, onChange, step, min, max]);

  return { inputRef, increment, decrement };
}

function Tooltip({ text }: { text: string }) {
  return (
    <span className="relative group">
      <span className="cursor-help text-gray-400 hover:text-gray-600">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </span>
      <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
        {text}
        <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></span>
      </span>
    </span>
  );
}

function InputField({ label, value, onChange, prefix, suffix, step = 1, min, max, tooltip }: InputFieldProps) {
  const { inputRef, increment, decrement } = useInputHandlers(value, onChange, step, min, max);
  const [displayValue, setDisplayValue] = React.useState(String(value));
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync display value when external value changes (but not while focused/editing)
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(String(value));
    }
  }, [value, isFocused]);

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
        {label}
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="flex">
        <button
          type="button"
          onClick={decrement}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-300 border-r-0 rounded-l-md text-gray-600 font-medium transition-colors"
        >
          −
        </button>
        <div className="relative flex-1">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {prefix}
            </span>
          )}
          <input
            ref={inputRef}
            type="number"
            value={isFocused ? displayValue : value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              const parsed = parseFloat(displayValue);
              onChange(isNaN(parsed) ? 0 : parsed);
            }}
            onChange={(e) => {
              setDisplayValue(e.target.value);
              const parsed = parseFloat(e.target.value);
              if (!isNaN(parsed)) {
                onChange(parsed);
              }
            }}
            step={step}
            min={min}
            max={max}
            className="w-full px-8 py-2 border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
          />
          {suffix && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {suffix}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={increment}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-300 border-l-0 rounded-r-md text-gray-600 font-medium transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

function InputFieldWithUnit<T extends string>({
  label,
  value,
  onChange,
  unit,
  onUnitChange,
  units,
  tooltip,
  convertValue,
}: InputFieldWithUnitProps<T>) {
  const currentUnit = units.find(u => u.value === unit) || units[0];
  const { inputRef, increment, decrement } = useInputHandlers(
    value,
    onChange,
    currentUnit.step,
    currentUnit.min,
    currentUnit.max
  );
  const [displayValue, setDisplayValue] = React.useState(String(value));
  const [isFocused, setIsFocused] = React.useState(false);

  // Sync display value when external value changes (but not while focused/editing)
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(String(value));
    }
  }, [value, isFocused]);

  const handleUnitChange = (newUnit: T) => {
    if (newUnit === unit) return;
    const convertedValue = convertValue(value, unit, newUnit);
    onUnitChange(newUnit, convertedValue);
  };

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
          {label}
          {tooltip && <Tooltip text={tooltip} />}
        </label>
        <div className="flex rounded-md overflow-hidden border border-gray-300 text-xs">
          {units.map((u) => (
            <button
              key={u.value}
              type="button"
              onClick={() => handleUnitChange(u.value)}
              className={`px-2 py-0.5 transition-colors ${
                unit === u.value
                  ? 'bg-gray-400 text-white'
                  : 'bg-white text-gray-400 hover:bg-gray-50'
              } ${units.indexOf(u) > 0 ? 'border-l border-gray-300' : ''}`}
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex">
        <button
          type="button"
          onClick={decrement}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-300 border-r-0 rounded-l-md text-gray-600 font-medium transition-colors"
        >
          −
        </button>
        <div className="relative flex-1">
          {currentUnit.prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {currentUnit.prefix}
            </span>
          )}
          <input
            ref={inputRef}
            type="number"
            value={isFocused ? displayValue : value}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setIsFocused(false);
              const parsed = parseFloat(displayValue);
              onChange(isNaN(parsed) ? 0 : parsed);
            }}
            onChange={(e) => {
              setDisplayValue(e.target.value);
              const parsed = parseFloat(e.target.value);
              if (!isNaN(parsed)) {
                onChange(parsed);
              }
            }}
            step={currentUnit.step}
            min={currentUnit.min}
            max={currentUnit.max}
            className="w-full px-8 py-2 border-y border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
          />
          {currentUnit.suffix && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              {currentUnit.suffix}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={increment}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 border border-gray-300 border-l-0 rounded-r-md text-gray-600 font-medium transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}

const downPaymentUnits: UnitOption<DownPaymentUnit>[] = [
  { value: 'percent', label: '%', suffix: '%', step: 5, min: 0, max: 100 },
  { value: 'dollar', label: '$', prefix: '$', step: 10000, min: 0 },
];

const propertyTaxUnits: UnitOption<TaxUnit>[] = [
  { value: 'dollarYearly', label: '$/yr', prefix: '$', suffix: '/yr', step: 100, min: 0 },
  { value: 'percent', label: '%', suffix: '%/yr', step: 0.1, min: 0 },
];

const maintenanceUnits: UnitOption<MaintenanceUnit>[] = [
  { value: 'dollarMonthly', label: '$/mo', prefix: '$', suffix: '/mo', step: 50, min: 0 },
  { value: 'dollarYearly', label: '$/yr', prefix: '$', suffix: '/yr', step: 500, min: 0 },
  { value: 'percent', label: '%', suffix: '%/yr', step: 0.1, min: 0 },
];

const otherCostsUnits: UnitOption<OtherCostsUnit>[] = [
  { value: 'percent', label: '%', suffix: '%/yr', step: 0.1, min: 0 },
  { value: 'dollarMonthly', label: '$/mo', prefix: '$', suffix: '/mo', step: 50, min: 0 },
  { value: 'dollarYearly', label: '$/yr', prefix: '$', suffix: '/yr', step: 500, min: 0 },
];

// Conversion functions - convert value from one unit to another
function roundTo(value: number, decimals: number): number {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

function createDownPaymentConverter(homePrice: number) {
  return (value: number, fromUnit: DownPaymentUnit, toUnit: DownPaymentUnit): number => {
    if (fromUnit === toUnit) return value;
    // Convert to dollars first
    const dollars = fromUnit === 'percent' ? homePrice * (value / 100) : value;
    // Convert to target unit
    if (toUnit === 'percent') {
      return roundTo((dollars / homePrice) * 100, 1);
    }
    return roundTo(dollars, 0);
  };
}

function createPropertyTaxConverter(homePrice: number) {
  return (value: number, fromUnit: TaxUnit, toUnit: TaxUnit): number => {
    if (fromUnit === toUnit) return value;
    // Convert to yearly dollars first
    const yearlyDollars = fromUnit === 'percent' ? homePrice * (value / 100) : value;
    // Convert to target unit
    if (toUnit === 'percent') {
      return roundTo((yearlyDollars / homePrice) * 100, 2);
    }
    return roundTo(yearlyDollars, 0);
  };
}

function createMaintenanceConverter(homePrice: number) {
  return (value: number, fromUnit: MaintenanceUnit, toUnit: MaintenanceUnit): number => {
    if (fromUnit === toUnit) return value;
    // Convert to yearly dollars first
    let yearlyDollars: number;
    if (fromUnit === 'percent') {
      yearlyDollars = homePrice * (value / 100);
    } else if (fromUnit === 'dollarMonthly') {
      yearlyDollars = value * 12;
    } else {
      yearlyDollars = value;
    }
    // Convert to target unit
    if (toUnit === 'percent') {
      return roundTo((yearlyDollars / homePrice) * 100, 2);
    } else if (toUnit === 'dollarMonthly') {
      return roundTo(yearlyDollars / 12, 0);
    }
    return roundTo(yearlyDollars, 0);
  };
}

function createOtherCostsConverter(homePrice: number) {
  return (value: number, fromUnit: OtherCostsUnit, toUnit: OtherCostsUnit): number => {
    if (fromUnit === toUnit) return value;
    // Convert to yearly dollars first
    let yearlyDollars: number;
    if (fromUnit === 'percent') {
      yearlyDollars = homePrice * (value / 100);
    } else if (fromUnit === 'dollarMonthly') {
      yearlyDollars = value * 12;
    } else {
      yearlyDollars = value;
    }
    // Convert to target unit
    if (toUnit === 'percent') {
      return roundTo((yearlyDollars / homePrice) * 100, 2);
    } else if (toUnit === 'dollarMonthly') {
      return roundTo(yearlyDollars / 12, 0);
    }
    return roundTo(yearlyDollars, 0);
  };
}

export function InputPanel({
  mortgageInputs,
  investmentInputs,
  onMortgageChange,
  onInvestmentChange,
}: InputPanelProps) {
  const { homePrice } = mortgageInputs;

  const updateMortgage = <K extends keyof MortgageInputs>(key: K, value: MortgageInputs[K]) => {
    onMortgageChange({ ...mortgageInputs, [key]: value });
  };

  const updateInvestment = (key: keyof InvestmentInputs, value: number | boolean) => {
    onInvestmentChange({ ...investmentInputs, [key]: value });
  };

  // Create converters with current home price
  const convertDownPayment = createDownPaymentConverter(homePrice);
  const convertPropertyTax = createPropertyTaxConverter(homePrice);
  const convertMaintenance = createMaintenanceConverter(homePrice);
  const convertOtherCosts = createOtherCostsConverter(homePrice);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Mortgage/Buy Strategy Inputs */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
          <span className="text-2xl">🏠</span> Buy Strategy
        </h2>

        <InputField
          label="Home Price"
          value={mortgageInputs.homePrice}
          onChange={(v) => updateMortgage('homePrice', v)}
          prefix="$"
          step={10000}
          min={0}
        />

        <InputFieldWithUnit
          label="Down Payment"
          value={mortgageInputs.downPayment}
          onChange={(v) => updateMortgage('downPayment', v)}
          unit={mortgageInputs.downPaymentUnit}
          onUnitChange={(u, v) => onMortgageChange({ ...mortgageInputs, downPaymentUnit: u, downPayment: v })}
          units={downPaymentUnits}
          convertValue={convertDownPayment}
        />

        <InputField
          label="Mortgage Term"
          value={mortgageInputs.mortgageTermYears}
          onChange={(v) => updateMortgage('mortgageTermYears', v)}
          suffix="years"
          step={1}
          min={1}
          max={30}
        />

        <InputField
          label="Interest Rate"
          value={mortgageInputs.interestRate}
          onChange={(v) => updateMortgage('interestRate', v)}
          suffix="%"
          step={0.25}
          min={0}
        />

        <InputFieldWithUnit
          label="Property Tax"
          value={mortgageInputs.propertyTax}
          onChange={(v) => updateMortgage('propertyTax', v)}
          unit={mortgageInputs.propertyTaxUnit}
          onUnitChange={(u, v) => onMortgageChange({ ...mortgageInputs, propertyTaxUnit: u, propertyTax: v })}
          units={propertyTaxUnits}
          convertValue={convertPropertyTax}
        />

        <InputFieldWithUnit
          label="Maintenance"
          value={mortgageInputs.maintenance}
          onChange={(v) => updateMortgage('maintenance', v)}
          unit={mortgageInputs.maintenanceUnit}
          onUnitChange={(u, v) => onMortgageChange({ ...mortgageInputs, maintenanceUnit: u, maintenance: v })}
          units={maintenanceUnits}
          convertValue={convertMaintenance}
          tooltip="Includes HOA, insurance, maintenance, and other recurring costs."
        />

        <InputFieldWithUnit
          label="Other Costs"
          value={mortgageInputs.otherCosts}
          onChange={(v) => updateMortgage('otherCosts', v)}
          unit={mortgageInputs.otherCostsUnit}
          onUnitChange={(u, v) => onMortgageChange({ ...mortgageInputs, otherCostsUnit: u, otherCosts: v })}
          units={otherCostsUnits}
          convertValue={convertOtherCosts}
          tooltip="Additional annual costs (e.g., renovation, repairs)."
        />

        <InputField
          label="One-Time Buying Costs"
          value={mortgageInputs.buyingCosts}
          onChange={(v) => updateMortgage('buyingCosts', v)}
          prefix="$"
          step={500}
          min={0}
          tooltip="One-time costs when buying (lawyer, inspection, closing costs, etc.)"
        />
      </div>

      {/* Investment/Rent Strategy Inputs */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-green-600 mb-4 flex items-center gap-2">
          <span className="text-2xl">📈</span> Invest Strategy
        </h2>

        <InputField
          label="Monthly Rent"
          value={investmentInputs.monthlyRent}
          onChange={(v) => updateInvestment('monthlyRent', v)}
          prefix="$"
          step={100}
          min={0}
        />

        <InputField
          label="Annual Rent Increase"
          value={investmentInputs.rentIncreaseRate}
          onChange={(v) => updateInvestment('rentIncreaseRate', v)}
          suffix="%/yr"
          step={0.5}
          min={0}
        />

        <InputField
          label="Investment Return"
          value={investmentInputs.investmentReturnRate}
          onChange={(v) => updateInvestment('investmentReturnRate', v)}
          suffix="%/yr"
          step={0.5}
        />

        <div className="mt-4 mb-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={investmentInputs.useManualContribution}
              onChange={(e) => updateInvestment('useManualContribution', e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Set monthly contribution manually
            </span>
          </label>
        </div>

        {investmentInputs.useManualContribution && (
          <InputField
            label="Monthly Contribution"
            value={investmentInputs.manualMonthlyContribution}
            onChange={(v) => updateInvestment('manualMonthlyContribution', v)}
            prefix="$"
            suffix="/mo"
            step={100}
            min={0}
          />
        )}

        {!investmentInputs.useManualContribution && (
          <div className="mt-2 p-4 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> Monthly investment contribution is auto-calculated as the difference between total mortgage costs and rent.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
