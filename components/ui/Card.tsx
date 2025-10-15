import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', padding = true }) => {
  return (
    <div className={`bg-base-100 text-base-content rounded-3xl shadow-2xl dark:shadow-black/25 dark:border dark:border-base-300/50 transition-all duration-300 ${className}`}>
      {padding ? <div className="p-6">{children}</div> : children}
    </div>
  );
};

export default Card;