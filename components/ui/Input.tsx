import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, ...props }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-base-content mb-2">
        {label}
      </label>
      <input
        id={id}
        className="block w-full px-4 py-2 border border-base-300 rounded-md shadow-sm placeholder-base-content/40 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm transition-colors duration-150 bg-base-100 text-base-content"
        {...props}
      />
    </div>
  );
};

export default Input;