import React, { useState } from 'react';

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-base-300/60">
      <h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex justify-between items-center w-full py-4 text-left font-semibold text-base-content hover:bg-base-200/50"
          aria-expanded={isOpen}
        >
          <span>{title}</span>
          <i className={`iconoir-nav-arrow-down text-xl transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}></i>
        </button>
      </h2>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-gray-600 dark:text-gray-400">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AccordionProps {
    children: React.ReactNode;
}

export const Accordion: React.FC<AccordionProps> = ({ children }) => {
    return (
        <div className="w-full">
            {children}
        </div>
    )
}
