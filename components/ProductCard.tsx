
import React from 'react';
import type { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
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