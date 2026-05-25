import type { ReactNode } from 'react';

interface Props {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  variant?: 'default' | 'danger' | 'success' | 'warning';
  disabled?: boolean;
}

const VARIANT_CLASSES = {
  default:  'text-gray-500 hover:text-orange-500 hover:bg-orange-50',
  danger:   'text-gray-400 hover:text-red-500 hover:bg-red-50',
  success:  'text-gray-400 hover:text-green-600 hover:bg-green-50',
  warning:  'text-gray-400 hover:text-yellow-600 hover:bg-yellow-50',
};

export default function ActionButton({ onClick, icon, label, variant = 'default', disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]}`}
    >
      {icon}
    </button>
  );
}
