import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function VirtualCalculator({ isOpen, onClose }) {
  const [display, setDisplay] = useState('0');

  if (!isOpen) return null;

  const handleBtn = (val) => {
    if (val === 'C') setDisplay('0');
    else if (val === '=') {
      try {
        // Simple evaluation for non-critical mock calculator
        const sanitized = display.replace(/×/g, '*').replace(/÷/g, '/');
        setDisplay(String(Function(`'use strict'; return (${sanitized})`)()));
      } catch {
        setDisplay('Error');
      }
    } else {
      setDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
    }
  };

  return (
    <div className="fixed top-20 right-20 w-64 bg-gray-800 text-white rounded-lg shadow-2xl border border-gray-600 z-50 overflow-hidden font-mono">
      <div className="flex justify-between items-center bg-gray-900 px-3 py-2 border-b border-gray-700 text-xs font-bold">
        <span>TCS iON Calculator</span>
        <button onClick={onClose} className="hover:text-red-400"><X size={16} /></button>
      </div>
      <div className="p-3 bg-gray-950 text-right text-xl font-bold tracking-wider text-green-400 overflow-x-auto">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1 p-2 bg-gray-800 text-sm">
        {['C', '(', ')', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '0', '.', '√', '='].map((btn) => (
          <button
            key={btn}
            onClick={() => handleBtn(btn)}
            className="p-2.5 bg-gray-700 hover:bg-gray-600 rounded text-center font-bold transition active:scale-95"
          >
            {btn}
          </button>
        ))}
      </div>
    </div>
  );
}
