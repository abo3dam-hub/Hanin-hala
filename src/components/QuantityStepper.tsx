import { MinusIcon, PlusIcon } from './Icons';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export const QuantityStepper = ({
  value,
  onChange,
  min = 1,
  max = 99,
  label = 'الكمية',
}: QuantityStepperProps) => (
  <div className="quantity" role="group" aria-label={label}>
    <button
      type="button"
      className="quantity__button"
      onClick={() => onChange(Math.max(min, value - 1))}
      disabled={value <= min}
      aria-label="إنقاص الكمية"
    >
      <MinusIcon width={16} height={16} />
    </button>
    <span className="quantity__value" aria-live="polite">
      {value}
    </span>
    <button
      type="button"
      className="quantity__button"
      onClick={() => onChange(Math.min(max, value + 1))}
      disabled={value >= max}
      aria-label="زيادة الكمية"
    >
      <PlusIcon width={16} height={16} />
    </button>
  </div>
);
