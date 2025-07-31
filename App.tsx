
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Footer } from './components/Footer';
import { OrderSummary } from './components/OrderSummary';
import { DeliveryForm } from './components/DeliveryForm';
import { OrderConfirmation } from './components/OrderConfirmation';
import { CartSummaryBar } from './components/CartSummaryBar';
import type { Product, CartItem, OrderDetails, Step } from './types';

const WHATSAPP_NUMBER = '525577599017';
const SHIPPING_COST = 20;
const PRODUCTS_URL = 'https://raw.githubusercontent.com/remato-shop/remato-shop.github.io/refs/heads/main/data/products.json';


const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<Step>('selection');
  const [finalOrder, setFinalOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);
        const response = await fetch(PRODUCTS_URL);
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo obtener la lista de productos.`);
        }
        const rawData = await response.json();
        
        const mappedProducts: Product[] = rawData.map((item: any) => ({
          id: item['Código de barras'],
          name: item['Nombre'],
          description: item['Descripción'],
          price: parseFloat(item['Precio']),
          stock: parseInt(item['Stock'], 10),
          category: item['Categoría'],
        }));

        setProducts(mappedProducts);
      } catch (err: any) {
        console.error("Fallo al obtener los productos:", err);
        setLoadingError('No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
        if (quantity <= 0) {
            return prevCart.filter(item => item.product.id !== productId);
        }
        return prevCart.map(item =>
            item.product.id === productId ? { ...item, quantity: Math.min(quantity, item.product.stock) } : item
        );
    });
  };

  const handleRemoveFromCart = (productId: string) => {
      setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };
  
  const handleGoToSummary = () => {
    if (cart.length > 0) {
        setStep('summary');
    }
  };
  
  const handleGoHome = () => {
      setCart([]);
      setFinalOrder(null);
      setStep('selection');
  }
  
  const sendOrderToWhatsApp = (orderDetails: OrderDetails) => {
    const MAX_LENGTH = 4096;

    const productList = orderDetails.cart
      .map(item => `${item.product.id},${item.quantity}`)
      .join('\n');

    const message = `
[PEDIDO:${orderDetails.id}]
Recibe: ${orderDetails.recipientName}
Dirección: ${orderDetails.deliveryAddress}
Fecha: ${new Date(orderDetails.deliveryDate + 'T00:00:00').toISOString().split('T')[0]}
Hora: ${orderDetails.deliveryTime}
--PRODUCTOS--
${productList}
--FIN PRODUCTOS--
    `.trim().replace(/^\s+/gm, '');

    if (message.length > MAX_LENGTH) {
        alert("🚨 El mensaje es demasiado largo para enviarse por WhatsApp.\nPor favor, contacta al cliente directamente para confirmar.");
        return;
    }

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleFinalizeOrder = (deliveryDetails: Omit<OrderDetails, 'id' | 'cart' | 'total' | 'subtotal' | 'shippingCost'>) => {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomPart = Math.floor(Math.random() * 9000) + 1000;
    const orderId = `ORD-${datePart}-${timePart}-${randomPart}`;
    
    const completeOrder: OrderDetails = {
        id: orderId,
        ...deliveryDetails,
        cart: cart,
        subtotal: cartSubtotal,
        shippingCost: SHIPPING_COST,
        total: orderTotal,
    };
    
    setFinalOrder(completeOrder);
    sendOrderToWhatsApp(completeOrder);
    
    setCart([]);
    setStep('confirmation');
  };
  
  const handleStartNewOrder = () => {
      setFinalOrder(null);
      setStep('selection');
  }
  
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(() => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0), [cart]);
  const orderTotal = useMemo(() => cartSubtotal + SHIPPING_COST, [cartSubtotal]);


  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) {
      return products;
    }
    return products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }, [searchQuery, products]);
  
  const renderSelectionList = () => {
    if (filteredProducts.length > 0) {
      return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-32">
          {filteredProducts.map((product) => (
            <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      );
    }
    return (
        <div className="text-center py-20">
            <p className="text-2xl text-text-secondary font-semibold">No se encontraron productos</p>
            <p className="text-text-secondary/70 mt-2">Intenta con otra búsqueda o revisa nuestros productos.</p>
        </div>
    );
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 'summary':
        return <OrderSummary
          cartItems={cart}
          subtotal={cartSubtotal}
          shippingCost={SHIPPING_COST}
          total={orderTotal}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveFromCart}
          onGoBack={() => setStep('selection')}
          onProceed={() => setStep('delivery')}
        />;
      case 'delivery':
        return <DeliveryForm
          onGoBack={() => setStep('summary')}
          onFinalizeOrder={handleFinalizeOrder}
          subtotal={cartSubtotal}
          shippingCost={SHIPPING_COST}
          total={orderTotal}
        />;
      case 'confirmation':
        return finalOrder ? <OrderConfirmation orderDetails={finalOrder} onNewOrder={handleStartNewOrder} /> : null;
      case 'selection':
      default:
        if (isLoading) {
            return (
                <div className="text-center py-20 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mb-4"></div>
                    <p className="text-xl text-text-secondary font-semibold">Cargando productos...</p>
                </div>
            );
        }

        if (loadingError) {
            return (
                <div className="text-center py-20">
                    <p className="text-xl text-red-500 font-semibold">¡Ups! Algo salió mal</p>
                    <p className="text-text-secondary/70 mt-2">{loadingError}</p>
                </div>
            );
        }
        
        return (
          <>
            <div className="relative my-6 max-w-2xl mx-auto">
              <input 
                type="text" 
                placeholder="Buscar por nombre, categoría o descripción..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-card-bg rounded-lg py-3 pl-12 pr-4 text-base text-text-primary placeholder-text-secondary/70 ring-1 ring-inset ring-border-soft focus:outline-none focus:ring-2 focus:ring-accent transition-shadow duration-200 shadow-sm"
                aria-label="Buscar productos"
              />
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
            </div>
            {renderSelectionList()}
          </>
        );
    }
  }

  return (
    <div className="min-h-screen font-sans bg-background flex flex-col">
      <Header 
        cartItemCount={cartItemCount} 
        onCartClick={handleGoToSummary} 
        onHomeClick={handleGoHome}
        step={step} 
      />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderCurrentStep()}
      </main>

      {cart.length > 0 && step === 'selection' && (
        <CartSummaryBar 
          subtotal={cartSubtotal}
          shippingCost={SHIPPING_COST}
          total={orderTotal}
          onProceed={handleGoToSummary}
        />
      )}

      <Footer />
    </div>
  );
};

export default App;
