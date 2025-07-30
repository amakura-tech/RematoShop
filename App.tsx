
import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Footer } from './components/Footer';
import { OrderSummary } from './components/OrderSummary';
import { DeliveryForm } from './components/DeliveryForm';
import { OrderConfirmation } from './components/OrderConfirmation';
import { CartSummaryBar } from './components/CartSummaryBar';
import type { Product, CartItem, OrderDetails, Step } from './types';
import { GoogleGenAI } from '@google/genai';
import { WHATSAPP_NUMBER } from './config';

const SHIPPING_COST = 20;

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState<Step>('selection');
  const [finalOrder, setFinalOrder] = useState<OrderDetails | null>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);

  useEffect(() => {
    try {
      // The platform is expected to provide process.env.API_KEY.
      // If it's not available, we prevent a crash and disable AI features.
      const apiKey = (process as any)?.env?.API_KEY;
      if (apiKey) {
        setAi(new GoogleGenAI({ apiKey }));
      } else {
        console.warn("API key not found. AI features will be disabled.");
      }
    } catch (e) {
      console.error("Error initializing GoogleGenAI:", e);
    }
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
    // Generar un ID de pedido único
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
    sendOrderToWhatsApp(completeOrder); // Enviar pedido a WhatsApp
    
    setCart([]);
    setStep('confirmation');
  };
  
  const handleStartNewOrder = () => {
      setFinalOrder(null);
      setStep('selection');
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('./data/products.json');
        if (!response.ok) {
          throw new Error(`Error al cargar datos: ${response.statusText}`);
        }
        const rawData = await response.json();
        const data: Product[] = rawData.map((item: any) => ({
          id: item['Código de barras'],
          name: item['Nombre'],
          description: item['Descripción'],
          price: parseFloat(item['Precio']),
          stock: parseInt(item['Stock'], 10),
          category: item['Categoría'],
        }));
        setProducts(data);
      } catch (e) {
        if (e instanceof Error) {
          setError(`No se pudieron cargar los productos: ${e.message}`);
        } else {
          setError('Ocurrió un error desconocido.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);
  
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
  }, [products, searchQuery]);
  
  const renderSelectionStep = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center py-20 px-4 bg-red-100/50 border border-red-400/50 text-red-700 rounded-lg">
          <p className="text-xl font-semibold">{error}</p>
        </div>
      );
    }
    if (filteredProducts.length > 0) {
      return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-32">
          {filteredProducts.map((product) => (
            <ProductCard 
                key={product.id} 
                product={product} 
                ai={ai} 
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
            {renderSelectionStep()}
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
