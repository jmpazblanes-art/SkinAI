import React, { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  className = '',
  variant = 'primary',
  isLoading = false,
  loadingText = 'Procesando...',
  icon,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-lg';

  const variantClasses = {
    primary: 'text-white bg-primary hover:bg-primary-focus focus:ring-primary',
    secondary: 'text-base-content bg-base-300/50 hover:bg-base-300/80 focus:ring-primary',
    ghost: 'text-base-content bg-transparent hover:bg-base-200 focus:ring-primary',
  };

  return (
    <button
      ref={ref}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon }
      {isLoading ? loadingText : children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;