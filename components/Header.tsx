
import React from 'react';
import { StepIndicator } from './StepIndicator';
import type { Step } from '../types';

const ShoppingCartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

interface HeaderProps {
    cartItemCount: number;
    onCartClick: () => void;
    onHomeClick: () => void;
    step: Step;
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, onHomeClick, step }) => {
  return (
    <header className="w-full bg-card-bg border-b border-border-soft shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
            <div className="flex-shrink-0">
                <button onClick={onHomeClick} className="font-marker text-3xl tracking-wider text-text-primary">
                    REMATOSHOP
                </button>
            </div>
            
            <div className="flex-grow justify-center px-4 hidden md:flex">
                 {step !== 'confirmation' && <StepIndicator currentStep={step} />}
            </div>

            <div className="flex-shrink-0">
                <button 
                  onClick={onCartClick} 
                  disabled={cartItemCount === 0}
                  className="relative cursor-pointer group p-2 -mr-2 disabled:cursor-default disabled:opacity-50" 
                  aria-label={`Ver carrito con ${cartItemCount} productos`}
                >
                    <ShoppingCartIcon />
                    {cartItemCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center ring-2 ring-card-bg">
                            {cartItemCount}
                        </span>
                    )}
                </button>
            </div>
        </div>
      </div>
    </header>
  );
};