
import React, { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { Footer } from './components/Footer';
import { OrderSummary } from './components/OrderSummary';
import { DeliveryForm } from './components/DeliveryForm';
import { OrderConfirmation } from './components/OrderConfirmation';
import { CartSummaryBar } from './components/CartSummaryBar';
import type { Product, CartItem, OrderDetails, Step } from './types';

// CONFIGURA TU NÚMERO DE WHATSAPP AQUÍ
// Incluye el código de país sin el símbolo '+' o espacios.
// Ejemplo para México: '5211234567890'
const WHATSAPP_NUMBER = '525577599017';
const SHIPPING_COST = 20;
const PRODUCTS_URL = 'https://raw.githubusercontent.com/remato-shop/remato-shop.github.io/refs/heads/main/data/products.json';


const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);


const App: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [step, setStep] = useState<Step>('selection');
  const [finalOrder, setFinalOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    const signal = abortController.signal;

    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setLoadingError(null);
        const response = await fetch(PRODUCTS_URL, { signal });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: No se pudo obtener la lista de productos.`);
        }
        const rawData = await response.json();
        
        const mappedProducts: Product[] = rawData
          .filter((item: any) => item && item['Código de barras']) // Ensure product has an ID
          .map((item: any) => ({
            id: item['Código de barras'],
            name: item['Nombre'] || '',
            description: item['Descripción'] || '',
            price: parseFloat(item['Precio']) || 0,
            stock: parseInt(item['Stock'], 10) || 0,
            category: item['Categoría'] || '',
            image: item['Imagen'] || undefined,
        }));
        
        // De-duplicate products based on their ID to prevent rendering issues from dirty data.
        const uniqueProductsMap = new Map<string, Product>();
        for (const product of mappedProducts) {
            if (!uniqueProductsMap.has(product.id)) {
                uniqueProductsMap.set(product.id, product);
            }
        }
        const uniqueProducts = Array.from(uniqueProductsMap.values());
        
        if (!signal.aborted) {
            setProducts(uniqueProducts);
        }
      } catch (err: any) {
        if (signal.aborted) {
            console.log('Fetch aborted');
        } else {
            console.error("Fallo al obtener los productos:", err);
            setLoadingError('No se pudieron cargar los productos. Por favor, intenta de nuevo más tarde.');
        }
      } finally {
        if (!signal.aborted) {
            setIsLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      abortController.abort();
    };
  }, []);
  
  const filteredProducts = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase().trim();
    if (!lowercasedQuery) {
      return products;
    }
    return products.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(lowercasedQuery);
      const priceMatch = product.price.toString().includes(lowercasedQuery);
      return nameMatch || priceMatch;
    });
  }, [products, searchQuery]);


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
    // Se crea un mensaje estructurado que es fácil de leer para humanos y de procesar para un programa.
    
    // Lista de productos en formato: ID | Cantidad | Nombre
    const productList = orderDetails.cart
      .map(item => `${item.product.id} | ${item.quantity} | ${item.product.name}`)
      .join('\n');

    const message = `
*--- 🛍️ NUEVO PEDIDO REMATOSHOP 🛍️ ---*

*ID de Pedido:*
\`\`\`${orderDetails.id}\`\`\`

*Datos del Cliente:*
- *Recibe:* ${orderDetails.recipientName}
- *Dirección:* ${orderDetails.deliveryAddress}

*Entrega Programada:*
- *Fecha:* ${new Date(orderDetails.deliveryDate + 'T00:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
- *Hora:* ${orderDetails.deliveryTime}

--------------------------------------------------
*Resumen de Productos:*
(Formato: ID | Cantidad | Nombre)
\`\`\`
${productList}
\`\`\`
--------------------------------------------------

*TOTAL A PAGAR:* *$${orderDetails.total.toFixed(2)}*

¡Gracias por coordinar este pedido!
    `.trim().replace(/^\s+/gm, '');
    
    // El límite de caracteres de una URL es de aproximadamente 2000. 
    // Se codifica el mensaje para asegurar que sea una URL válida.
    if (encodeURIComponent(message).length > 2000) {
        alert("🚨 El pedido es muy grande y el mensaje podría no enviarse correctamente por WhatsApp.\n\nPor favor, contacta al cliente directamente para confirmar.");
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

    if (products.length > 0 && filteredProducts.length === 0) {
      return (
        <div className="text-center py-20">
          <p className="text-2xl text-text-secondary font-semibold">No se encontraron productos</p>
          <p className="text-text-secondary/70 mt-2">Intenta con otra palabra o revisa el precio que buscas.</p>
        </div>
      );
    }

    return (
        <div className="text-center py-20">
            <p className="text-2xl text-text-secondary font-semibold">No hay productos disponibles</p>
            <p className="text-text-secondary/70 mt-2">Por favor, vuelve a intentarlo más tarde.</p>
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
            <div className="mb-8 max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <SearchIcon />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre o precio..."
                  className="w-full bg-card-bg rounded-full p-4 pl-12 text-base text-text-primary ring-1 ring-inset ring-border-soft focus:outline-none focus:ring-2 focus:ring-accent transition shadow-sm"
                  aria-label="Buscar productos"
                />
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
