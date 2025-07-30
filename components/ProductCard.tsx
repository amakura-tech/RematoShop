
import React, { useState } from 'react';
import type { Product } from '../types';
import type { GoogleGenAI } from '@google/genai';

interface ProductCardProps {
  product: Product;
  ai: GoogleGenAI;
  onAddToCart: (product: Product) => void;
}

const SparklesIcon: React.FC<{ className?: string }> = ({ className = "h-4 w-4 mr-1.5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.293 2.293a1 1 0 010 1.414L13 12l-2.293-2.293a1 1 0 010-1.414L13 6zm5 16l2.293-2.293a1 1 0 000-1.414L13 12l-2.293 2.293a1 1 0 000 1.414L13 18z" />
    </svg>
);

const LoadingSpinner: React.FC = () => (
    <svg className="animate-spin h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export const ProductCard: React.FC<ProductCardProps> = ({ product, ai, onAddToCart }) => {
  const [summary, setSummary] = useState('');
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState('');

  const handleGenerateSummary = async () => {
    if (!product.description || isLoadingSummary) return;
    setIsLoadingSummary(true);
    setErrorSummary('');
    setSummary('');

    try {
        const prompt = `Genera un resumen de marketing corto (2-3 frases), atractivo y fácil de entender para el siguiente producto. Enfócate en los beneficios para el cliente y usa un tono amigable y casual. No repitas el nombre del producto en el resumen.

        Nombre del Producto: "${product.name}"
        Descripción Original: "${product.description}"`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        setSummary(response.text);

    } catch (error) {
        console.error('Error generating summary:', error);
        setErrorSummary('No se pudo generar el resumen.');
    } finally {
        setIsLoadingSummary(false);
    }
  };

  return (
    <div className="bg-card-bg rounded-xl p-5 ring-1 ring-border-soft/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">
      <div className="flex-grow">
         <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-text-secondary uppercase tracking-wider">{product.category}</p>
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {product.stock > 0 && product.stock <= 10 && (
                  <span className="text-xs font-bold bg-yellow-500 text-white px-2 py-1 rounded-full">¡Pocas unidades!</span>
              )}
              {product.stock > 0 ? (
                  <span className="text-xs font-semibold bg-green-100 text-green-800 px-2 py-1 rounded-full">Disponibles: {product.stock}</span>
              ) : (
                  <span className="text-xs font-semibold bg-red-100 text-red-800 px-2 py-1 rounded-full">Agotado</span>
              )}
            </div>
          </div>
          <h3 className="text-lg font-semibold text-text-primary mt-1">
              {product.name}
          </h3>
          <p className="text-sm text-text-secondary mt-2 leading-relaxed">{product.description}</p>
        
            <div className="mt-4">
                {!summary && product.description && (
                    <div>
                    {!isLoadingSummary ? (
                        <button
                            onClick={handleGenerateSummary}
                            className="text-xs font-semibold text-accent flex items-center hover:text-accent-hover transition-colors duration-200 group/button"
                            aria-label={`Generar resumen para ${product.name}`}
                        >
                            <SparklesIcon className="h-4 w-4 mr-1.5 text-yellow-500 group-hover/button:scale-110 transition-transform"/>
                            <span className="group-hover/button:underline">Ver resumen con IA</span>
                        </button>
                    ) : (
                        <div className="text-xs font-semibold text-text-secondary flex items-center">
                            <LoadingSpinner />
                            <span>Generando...</span>
                        </div>
                    )}
                    </div>
                )}
                
                {summary && (
                    <div className="mt-3 p-3 bg-accent/5 rounded-lg border border-accent/10">
                        <h4 className="text-sm font-bold text-accent-hover flex items-center">
                            <SparklesIcon className="h-5 w-5 mr-1.5 text-yellow-500"/>
                            Resumen Inteligente
                        </h4>
                        <p className="text-sm text-text-secondary mt-1">{summary}</p>
                    </div>
                )}

                {errorSummary && (
                    <p className="text-xs text-red-600 mt-2">{errorSummary}</p>
                )}
            </div>
        </div>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border-soft">
            <span className="text-lg font-bold text-text-primary">
                ${product.price.toFixed(2)}
            </span>
            <button 
                disabled={product.stock === 0} 
                onClick={() => onAddToCart(product)}
                className="bg-accent text-white font-semibold py-2 px-5 rounded-lg hover:bg-accent-hover transition-colors duration-200 shadow-sm hover:shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed active:scale-95"
                aria-label={product.stock > 0 ? `Añadir ${product.name} al carrito` : `${product.name} está agotado`}
            >
                Añadir
            </button>
        </div>
    </div>
  );
};
