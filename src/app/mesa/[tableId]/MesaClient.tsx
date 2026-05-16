"use client";

import Image from "next/image";
// Añadimos useEffect para escuchar los gestos de iOS
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

  // --- LÓGICA DE NAVEGACIÓN NATIVA (SWIPE BACK iOS) ---
  useEffect(() => {
    const handlePopState = () => {
      // Si el usuario hace el gesto de "deslizar atrás" en su móvil, lo devolvemos al Home
      setViewState("home");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const openCategory = (category: Product["category"]) => {
    setActiveCategory(category);
    setViewState("category");
    // Inyectamos un paso en el historial del móvil para habilitar el gesto "Atrás"
    window.history.pushState({ view: "category" }, "");
  };

  const closeCategory = () => {
    // Si toca el botón de la flecha <-, usamos la API nativa para limpiar el historial y disparar el popstate
    if (window.history.state?.view === "category") {
      window.history.back();
    } else {
      setViewState("home");
    }
  };
  // -----------------------------------------------------

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

  if (step === "payment") {
    return (
      <section className="mx-auto w-full max-w-md px-4 pb-8 pt-3 text-white">
        <button type="button" onClick={() => setStep("menu")} className="mb-5 text-sm font-semibold text-white/70">
          ← Volver al menú
        </button>
        <div className="rounded-[2rem] bg-[#14161d] border border-white/5 p-6">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">Pago seguro</p>
          <h1 className="mt-3 text-2xl font-bold">Confirma tu pedido</h1>
          <div className="mt-6 space-y-3">
            {cartItems.map((item) => (
              <div key={item.product.id} className="flex items-center justify-between rounded-xl bg-white/[0.02] px-4 py-3">
                <span className="text-sm">{item.quantity}x {item.product.name}</span>
                <span className="font-mono text-sm text-white/80">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t border-white/5 pt-4 flex justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-accent">{formatCurrency(total)}</span>
          </div>
          <div className="mt-6 grid gap-3">
            <button onClick={confirmPayment} className="min-h-14 w-full rounded-2xl bg-accent text-base font-black text-black transition hover:brightness-110">
              Confirmar pago · {formatCurrency(total)}
            </button>
          </div>
        </div>
      </section>
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
            <p className="text-2xl font-black text-accent tracking-wide">Mesa 12</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white leading-tight">
              Hola! ¿Qué vas a tomar?
            </h2>
            <p className="mt-1 text-sm text-white/50">Selecciona tus productos</p>
          </div>

          <div className="mt-8 space-y-4">

            {/* Tarjeta BEBIDAS (Con la animación de hundimiento restaurada) */}
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

            {/* Tarjeta APERITIVOS */}
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

      <CartDrawer
        isOpen={drawerOpen}
        items={cartItems}
        total={total}
        totalCount={totalCount}
        onClose={() => setDrawerOpen(false)}
        onAdd={addProduct}
        onRemove={removeProduct}
        onCheckout={() => {
          setDrawerOpen(false);
          setStep("payment");
        }}
      />
    </section>
  );
}