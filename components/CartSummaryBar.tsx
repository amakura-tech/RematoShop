import React from 'react';

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

interface CartSummaryBarProps {
    subtotal: number;
    shippingCost: number;
    total: number;
    onProceed: () => void;
}

export const CartSummaryBar: React.FC<CartSummaryBarProps> = ({ subtotal, shippingCost, total, onProceed }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-card-bg/95 backdrop-blur-sm border-t border-border-soft shadow-[0_-4px_30px_rgba(0,0,0,0.1)] z-50 animate-fade-in-up">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
                <div className="flex justify-between items-center gap-4">
                    <div className="flex-grow text-sm text-text-secondary">
                        <div className="flex justify-between"><span>Subtotal</span> <span className="font-semibold text-text-primary">${subtotal.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>Envío</span> <span className="font-semibold text-text-primary">${shippingCost.toFixed(2)}</span></div>
                        <div className="flex justify-between text-base font-bold text-text-primary mt-1 border-t border-dashed border-border-soft pt-1"><span>Total</span> <span>${total.toFixed(2)}</span></div>
                    </div>
                    <button 
                        onClick={onProceed}
                        className="bg-accent text-white font-bold py-3 px-6 rounded-xl hover:bg-accent-hover transition-colors duration-200 shadow-lg hover:shadow-xl text-lg flex items-center gap-2 active:scale-95"
                    >
                        <span>Proceder al Pago</span>
                        <ChevronRightIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};