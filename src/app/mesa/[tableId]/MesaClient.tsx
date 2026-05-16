"use client";

import Image from "next/image";
import { useMemo, useState, useEffect } from "react";
import { CartDrawer } from "@/components/CartDrawer";
import { OrderConfirmation } from "@/components/OrderConfirmation";
import { ProductCard } from "@/components/ProductCard";
import { formatCurrency, menuCategories, menuProducts } from "@/lib/menu";
import { createOrder } from "@/lib/orders";
import type { CartItem, Order, Product } from "@/types/order";

type MesaClientProps = {
  tableId: string;
};

type Step = "menu" | "payment" | "confirmation";

export function MesaClient({ tableId }: MesaClientProps) {
  const [viewState, setViewState] = useState<"home" | "category">("home");
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState<Step>("menu");
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [tip, setTip] = useState(0);

  useEffect(() => {
    const handlePopState = () => {
      setViewState("home");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openCategory = (category: Product["category"]) => {
    setActiveCategory(category);
    setViewState("category");
    window.history.pushState({ view: "category" }, "");
  };

  const closeCategory = () => {
    if (window.history.state?.view === "category") {
      window.history.back();
    } else {
      setViewState("home");
    }
  };

  const cartItems = useMemo<CartItem[]>(() => {
    return menuProducts
      .map((product) => ({
        product,
        quantity: cart[product.id] ?? 0,
      }))
      .filter((item) => item.quantity > 0);
  }, [cart]);

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const productsByCategory = menuProducts.filter((product) => product.category === activeCategory);

  function addProduct(productId: string) {
    setCart((current) => ({ ...current, [productId]: (current[productId] ?? 0) + 1 }));
  }

  function removeProduct(productId: string) {
    setCart((current) => {
      const nextQuantity = (current[productId] ?? 0) - 1;
      if (nextQuantity <= 0) {
        const rest = { ...current };
        delete rest[productId];
        return rest;
      }
      return { ...current, [productId]: nextQuantity };
    });
  }

  function confirmPayment() {
    if (!cartItems.length) {
      setStep("menu");
      return;
    }
    const order = createOrder(tableId, cartItems);
    setCreatedOrder(order);
    setCart({});
    setTip(0);
    setDrawerOpen(false);
    setStep("confirmation");
  }

  if (step === "confirmation" && createdOrder) {
    return (
      <OrderConfirmation
        order={createdOrder}
        onReset={() => {
          setCreatedOrder(null);
          setStep("menu");
          setViewState("home");
        }}
      />
    );
  }

  return (
    <section className="mx-auto w-full max-w-md bg-[#0f1115] min-h-screen px-4 pb-28 pt-4 text-white font-sans antialiased">

      {/* PANTALLA 1: HOME DE LA MESA */}
      {viewState === "home" && (
        <div className="fade-in">
          <div className="flex items-start justify-between pt-8 pb-2">
            <h1 className="text-3xl font-black tracking-tight text-white uppercase leading-[0.95] flex flex-col">
              <span>MERCADO</span>
              <span className="text-white/80 font-bold text-xl tracking-widest mt-0.5">DEL PRADO</span>
            </h1>
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-bold text-white/80 mt-1">
              ES <span className="text-[10px] opacity-60">▼</span>
            </div>
          </div>

          <div className="mt-10">
            <p className="text-2xl font-black text-accent tracking-wide">Mesa {tableId}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white leading-tight">
              Hola! ¿Qué vas a tomar?
            </h2>
            <p className="mt-1 text-sm text-white/50">Selecciona tus productos</p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              type="button"
              onClick={() => openCategory("Cervezas")}
              className="group relative w-full h-40 rounded-[1.5rem] overflow-hidden border border-white/5 text-left transition-transform duration-300 active:scale-[0.97] select-none touch-manipulation"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <Image
                src="/mock-beer.png"
                alt="Bebidas"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover brightness-[0.4] transition-transform duration-700 md:group-hover:scale-105 pointer-events-none"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 pointer-events-none">
                <span className="block text-xs font-black uppercase tracking-[0.25em] text-accent">Sección</span>
                <span className="block text-2xl font-black tracking-wide text-white mt-0.5">BEBIDAS</span>
              </div>
            </button>

            <button
              type="button"
              disabled
              className="relative w-full h-40 rounded-[1.5rem] overflow-hidden border border-white/5 opacity-60 text-left select-none"
            >
              <Image
                src="/aperitivos.png"
                alt="Aperitivos"
                fill
                sizes="(max-width: 768px) 100vw, 400px"
                className="object-cover brightness-[0.25] pointer-events-none"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
              <div className="absolute bottom-5 left-5 pointer-events-none">
                <span className="block text-xs font-black uppercase tracking-[0.25em] text-white/40">Sección</span>
                <span className="block text-2xl font-black tracking-wide text-white/40 mt-0.5">APERITIVOS</span>
              </div>
              <div className="absolute top-4 right-4 bg-black/60 border border-white/10 px-2 py-0.5 rounded text-[10px] text-accent uppercase font-black tracking-widest pointer-events-none">
                Próximamente
              </div>
            </button>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md p-4">
            <button
              type="button"
              onClick={() => totalCount > 0 && setDrawerOpen(true)}
              className="flex min-h-14 w-full items-center justify-between rounded-full border border-white/10 bg-[#1a1c23]/95 px-6 font-bold text-white/90 shadow-[0_0_40px_rgba(0,0,0,0.8)] backdrop-blur transition active:scale-95"
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-accent">
                  {totalCount}
                </span>
                <span className="text-sm tracking-wide">Ver pedido</span>
              </div>
              <span className="font-mono text-sm text-white/75">{formatCurrency(total)}</span>
            </button>
          </div>
        </div>
      )}

      {/* PANTALLA 2: LISTADO DE PRODUCTOS */}
      {viewState === "category" && (
        <div className="fade-in">
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={closeCategory}
              className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/80 active:text-accent touch-manipulation p-2 -ml-2 transition-colors"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              <span className="text-accent text-lg leading-none">←</span> BEBIDAS
            </button>

            <button
              type="button"
              onClick={() => totalCount > 0 && setDrawerOpen(true)}
              className="relative p-2 text-white/80 touch-manipulation transition-transform active:scale-90"
              style={{ WebkitTapHighlightColor: 'transparent' }}
            >
              🛒
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-black text-black">
                  {totalCount}
                </span>
              )}
            </button>
          </div>

          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {menuCategories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 rounded-full px-5 py-2 text-xs font-black tracking-wider uppercase transition-all touch-manipulation active:scale-95 ${activeCategory === category
                  ? "bg-accent text-black shadow-lg shadow-accent/10"
                  : "bg-[#181b22] border border-white/5 text-white/60"
                  }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {category === "Cafes" ? "Cafés" : category}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-3">
            {productsByCategory.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                quantity={cart[product.id] ?? 0}
                onAdd={() => addProduct(product.id)}
                onRemove={() => removeProduct(product.id)}
              />
            ))}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md p-4">
            <button
              type="button"
              onClick={() => totalCount > 0 ? setDrawerOpen(true) : closeCategory()}
              className={`flex min-h-14 w-full items-center justify-between rounded-full px-6 font-black tracking-wide text-black shadow-[0_15px_40px_rgba(245,197,66,0.2)] transition active:scale-95 ${totalCount > 0 ? "bg-accent" : "bg-accent/40 opacity-60 cursor-not-allowed"
                }`}
              disabled={totalCount === 0}
            >
              <span className="text-sm uppercase tracking-wider">Ver pedido ({totalCount})</span>
              <span className="font-mono text-base">{formatCurrency(total)}</span>
            </button>
          </div>
        </div>
      )}

      {/* CAJÓN 1: CARRITO (Pantalla 3) */}
      <CartDrawer
        isOpen={drawerOpen}
        items={cartItems}
        total={total}
        totalCount={totalCount}
        onClose={() => setDrawerOpen(false)}
        onAdd={addProduct}
        onRemove={removeProduct}
        onCheckout={(tipAmount) => {
          setTip(tipAmount);
          setDrawerOpen(false);
          setStep("payment"); // Activa el cajón de pago
        }}
      />

      {/* CAJÓN 2: PAGO SEGURO (Pantalla 4 rediseñada a "Pro & Suave") */}
      {step === "payment" && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md fade-in">

          <section className="premium-panel relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] p-6 pb-10 animate-slide-up">
            <div className="mx-auto mb-6 h-1.5 w-12 rounded-full bg-white/20" />

            {/* Cabecera Suave */}
            <div className="flex items-center justify-between mb-8">
              <button
                type="button"
                onClick={() => setStep("menu")}
                className="p-2 -ml-2 text-white/60 active:scale-90 transition-transform"
                aria-label="Volver atrás"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
              </button>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-white/80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0110 0v4"></path></svg>
                <span>Pago Seguro</span>
              </div>
              <div className="w-8" /> {/* Espaciador invisible para centrar */}
            </div>

            {/* Monto Total Impactante */}
            <div className="text-center mb-10">
              <p className="text-sm font-semibold text-muted mb-1">Total a pagar</p>
              <p className="text-[3.25rem] font-black text-white tracking-tighter leading-none">
                {formatCurrency(total + tip)}
              </p>
            </div>

            {/* Botones de Pago Pro */}
            <div className="space-y-3">
              <button onClick={confirmPayment} className="w-full flex items-center justify-center gap-2.5 min-h-[3.5rem] rounded-[1.25rem] bg-white text-black text-lg font-bold transition active:scale-[0.98] shadow-lg">
                <svg width="22" height="22" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" /></svg>
                <span>Pay</span>
              </button>

              <button onClick={confirmPayment} className="w-full flex items-center justify-center gap-2.5 min-h-[3.5rem] rounded-[1.25rem] bg-[#181b22] border border-white/5 text-white text-lg font-bold transition active:scale-[0.98] hover:bg-white/[0.04]">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                <span>Pay</span>
              </button>

              <button onClick={confirmPayment} className="w-full flex items-center justify-center gap-3 min-h-[3.5rem] rounded-[1.25rem] bg-[#181b22] border border-white/5 text-white text-lg font-bold transition active:scale-[0.98] hover:bg-white/[0.04]">
                {/* SVG de Tarjeta arreglado con viewBox nativo */}
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2" ry="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                <span>Tarjeta</span>
              </button>
            </div>

            {/* Desglose Suavizado */}
            <div className="mt-8 rounded-2xl bg-white/[0.02] border border-white/5 p-4">
              <div className="flex justify-between text-sm text-muted mb-2">
                <span>Subtotal</span>
                <span className="font-mono">{formatCurrency(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-muted mb-4">
                <span>Servicio</span>
                <span className="font-mono">{formatCurrency(tip)}</span>
              </div>
              <div className="flex justify-between pt-4 text-[17px] font-bold text-white border-t border-white/10">
                <span>Total</span>
                <span className="font-mono text-accent">{formatCurrency(total + tip)}</span>
              </div>
            </div>

            {/* Sello de Confianza Sutil y Premium */}
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="grid size-7 place-items-center rounded-full bg-success/10 text-success">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
              </div>
              <span className="text-sm font-semibold text-success/90">
                Pago 100% seguro. <span className="text-white/40 font-normal">Datos encriptados.</span>
              </span>
            </div>

          </section>
        </div>
      )}

    </section>
  );
}