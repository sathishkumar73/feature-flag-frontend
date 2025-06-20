'use client';

import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FaqItemProps {
  question: string;
  answer: React.ReactNode;
}

export const FaqItem = ({ question, answer, defaultOpen = false }: FaqItemProps & { defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        className="flex w-full justify-between items-center py-5 px-0 text-left text-base font-medium text-gray-900 focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-base font-medium">{question}</span>
        <span className="flex-shrink-0 ml-2">
          {isOpen ? 
            <ChevronUp className="w-5 h-5 text-black" /> : 
            <ChevronDown className="w-5 h-5 text-gray-800" />
          }
        </span>
      </button>
      {isOpen && (
        <div className="pb-5 text-gray-700 pr-8">
          {answer}
        </div>
      )}
    </div>
  );
};

export const FaqSection = ({ items }: { items: FaqItemProps[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 px-6 py-4">
      {items.map((item, index) => (
        <FaqItem key={index} question={item.question} answer={item.answer} defaultOpen={index === 0} />
      ))}
    </div>
  );
};
