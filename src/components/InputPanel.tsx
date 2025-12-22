import React from 'react';
import type { MortgageInputs, InvestmentInputs } from '../types';

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

function InputField({ label, value, onChange, prefix, suffix, step = 1, min, max, tooltip }: InputFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isDragging = React.useRef(false);
  const startY = React.useRef(0);
  const startValue = React.useRef(0);

  React.useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (document.activeElement === el) {
        e.preventDefault();
        const delta = e.deltaY < 0 ? step : -step;
        const decimals = (step.toString().split('.')[1] || '').length;
        let newValue = Math.round((value + delta) * Math.pow(10, decimals)) / Math.pow(10, decimals);
        if (min !== undefined) newValue = Math.max(min, newValue);
        if (max !== undefined) newValue = Math.min(max, newValue);
        onChange(newValue);
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [value, onChange, step, min, max]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startValue.current = value;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaY = startY.current - e.clientY;
    const sensitivity = 5;
    const steps = Math.round(deltaY / sensitivity);
    if (steps === 0) return;
    const decimals = (step.toString().split('.')[1] || '').length;
    let newValue = Math.round((startValue.current + steps * step) * Math.pow(10, decimals)) / Math.pow(10, decimals);
    if (min !== undefined) newValue = Math.max(min, newValue);
    if (max !== undefined) newValue = Math.min(max, newValue);
    onChange(newValue);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
        {label}
        {tooltip && (
          <span className="relative group">
            <span className="cursor-help text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </span>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs text-white bg-gray-800 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {tooltip}
              <span className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800"></span>
            </span>
          </span>
        )}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            {prefix}
          </span>
        )}
        <input
          ref={inputRef}
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          step={step}
          min={min}
          max={max}
          style={{ touchAction: 'none' }}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-ns-resize ${prefix ? 'pl-7' : ''} ${suffix ? 'pr-10' : ''}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {suffix}
          </span>
        )}
        <span className={`absolute ${suffix ? 'right-16' : 'right-3'} top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none select-none text-xs`}>
          ▲▼
        </span>
      </div>
    </div>
  );
}

export function InputPanel({
  mortgageInputs,
  investmentInputs,
  onMortgageChange,
  onInvestmentChange,
}: InputPanelProps) {
  const updateMortgage = (key: keyof MortgageInputs, value: number) => {
    onMortgageChange({ ...mortgageInputs, [key]: value });
  };

  const updateInvestment = (key: keyof InvestmentInputs, value: number | boolean) => {
    onInvestmentChange({ ...investmentInputs, [key]: value });
  };

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

        <InputField
          label="Down Payment"
          value={mortgageInputs.downPaymentPercent}
          onChange={(v) => updateMortgage('downPaymentPercent', v)}
          suffix="%"
          step={5}
          min={0}
          max={100}
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

        <InputField
          label="Yearly Property Tax"
          value={mortgageInputs.yearlyPropertyTax}
          onChange={(v) => updateMortgage('yearlyPropertyTax', v)}
          prefix="$"
          suffix="/yr"
          step={100}
          min={0}
        />

        <InputField
          label="Maintenance"
          value={mortgageInputs.monthlyMaintenance}
          onChange={(v) => updateMortgage('monthlyMaintenance', v)}
          prefix="$"
          suffix="/mo"
          step={50}
          min={0}
          tooltip="Includes HOA, insurance, maintenance, repairs, and other recurring costs."
        />

        <InputField
          label="Other Costs"
          value={mortgageInputs.otherCostsPercent}
          onChange={(v) => updateMortgage('otherCostsPercent', v)}
          suffix="%/yr"
          step={0.1}
          min={0}
          tooltip="Annual costs as % of home value (e.g., renovation, repairs). 0.7% = $2,800/yr on $400k home."
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
