"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import type { CartItem } from "@/types/order";
import { formatCurrency } from "@/lib/menu";

type CartDrawerProps = {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  totalCount: number;
  onClose: () => void;
  onAdd: (productId: string) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
};

type TipType = "10" | "round" | "custom" | null;

export function CartDrawer({
  isOpen,
  items,
  total,
  totalCount,
  onClose,
  onAdd,
  onRemove,
  onCheckout,
}: CartDrawerProps) {
  const [comment, setComment] = useState("");
  const [tipType, setTipType] = useState<TipType>(null);
  const [customTip, setCustomTip] = useState<string>("");

  // Reiniciar propina al cerrar el cajón
  useEffect(() => {
    if (!isOpen || totalCount === 0) {
      setTipType(null);
      setCustomTip("");
    }
  }, [isOpen, totalCount]);

  if (!isOpen) {
    return null;
  }

  // --- CÁLCULOS DE SERVICIO (PROPINA) ---
  const subtotal = total;
  const tenPercent = Number((subtotal * 0.1).toFixed(2));
  const nextWhole = Math.ceil(subtotal) === subtotal ? subtotal + 1 : Math.ceil(subtotal);
  const roundUpAmount = Number((nextWhole - subtotal).toFixed(2));

  const currentTip =
    tipType === "10" ? tenPercent :
      tipType === "round" ? roundUpAmount :
        tipType === "custom" ? (Number(customTip.replace(",", ".")) || 0) : 0;

  const finalTotal = subtotal + currentTip;

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/60 backdrop-blur-sm fade-in">
      <button
        type="button"
        className="absolute inset-0 cursor-default outline-none"
        aria-label="Cerrar carrito"
        onClick={onClose}
      />
      <section className="premium-panel relative z-10 max-h-[86vh] w-full overflow-y-auto rounded-t-[2rem] p-5 pb-7 animate-slide-up">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/20" />

        {/* Cabecera original respetada */}
        <div className="mt-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
              Tu pedido
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {totalCount} producto{totalCount === 1 ? "" : "s"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-10 place-items-center rounded-full border border-white/10 text-xl text-white/80 transition active:scale-90"
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

        {/* Productos con diseño original */}
        <div className="mt-6 space-y-3">
          {items.map((item) => (
            <div
              key={item.product.id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.035] p-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Image
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  width={54}
                  height={54}
                  className="size-14 shrink-0 rounded-2xl border border-white/10 object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.product.name}</p>
                  <p className="mt-1 font-mono text-sm text-muted">
                    {item.quantity} x {formatCurrency(item.product.price)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onRemove(item.product.id)}
                  className="grid size-9 place-items-center rounded-full border border-white/10 text-lg transition active:scale-90"
                  aria-label={`Quitar ${item.product.name}`}
                >
                  -
                </button>
                <span className="w-5 text-center font-mono text-sm">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => onAdd(item.product.id)}
                  className="grid size-9 place-items-center rounded-full bg-accent text-lg font-bold text-black transition active:scale-90"
                  aria-label={`Agregar ${item.product.name}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Módulo de Servicio / Propina */}
        <div className="mt-6 rounded-2xl bg-black/20 border border-white/5 p-4">
          <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-accent">
            ¿Añadir propina al servicio?
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTipType(tipType === "round" ? null : "round")}
              className={`flex-1 rounded-xl border py-2 transition-all ${tipType === "round" ? "border-accent bg-accent/10 text-accent" : "border-white/10 bg-white/[0.02] text-white/80"}`}
            >
              <span className="block text-[10px] uppercase font-bold opacity-70">Redondear</span>
              <span className="block font-mono text-sm font-bold mt-0.5">+{formatCurrency(roundUpAmount)}</span>
            </button>

            <button
              type="button"
              onClick={() => setTipType(tipType === "10" ? null : "10")}
              className={`flex-1 rounded-xl border py-2 transition-all ${tipType === "10" ? "border-accent bg-accent/10 text-accent" : "border-white/10 bg-white/[0.02] text-white/80"}`}
            >
              <span className="block text-[10px] uppercase font-bold opacity-70">10%</span>
              <span className="block font-mono text-sm font-bold mt-0.5">+{formatCurrency(tenPercent)}</span>
            </button>

            <button
              type="button"
              onClick={() => setTipType(tipType === "custom" ? null : "custom")}
              className={`flex-1 rounded-xl border py-2 transition-all flex flex-col items-center justify-center ${tipType === "custom" ? "border-accent bg-accent/10 text-accent" : "border-white/10 bg-white/[0.02] text-white/80"}`}
            >
              <span className="block text-[10px] uppercase font-bold opacity-70">Otro</span>
            </button>
          </div>

          {/* Input para propina personalizada */}
          {tipType === "custom" && (
            <div className="mt-3 flex items-center gap-2 animate-slide-up">
              <span className="text-white/50 pl-2">€</span>
              <input
                type="number"
                inputMode="decimal"
                value={customTip}
                onChange={(e) => setCustomTip(e.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent border-b border-white/20 py-1 text-lg font-mono text-white outline-none focus:border-accent"
              />
            </div>
          )}
        </div>

        {/* Totales */}
        <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Servicio</span>
            <span className={currentTip > 0 ? "text-accent font-semibold" : ""}>
              {formatCurrency(currentTip)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xl font-semibold">
            <span>Total</span>
            <span>{formatCurrency(finalTotal)}</span>
          </div>
        </div>

        {/* Caja de Comentarios adaptada al diseño original */}
        <div className="mt-6">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="¿Algún comentario? Ej: limón aparte..."
            className="w-full rounded-2xl border border-white/8 bg-white/[0.035] px-4 py-4 text-sm text-white placeholder:text-white/40 transition-colors focus:border-accent focus:bg-white/[0.05] outline-none"
          />
        </div>

        {/* Botón original respetado */}
        <button
          type="button"
          onClick={onCheckout}
          className="mt-6 min-h-14 w-full rounded-2xl bg-accent text-base font-bold text-black shadow-[0_18px_42px_rgba(245,197,66,0.18)] transition hover:brightness-110 active:scale-[0.98]"
        >
          Continuar al pago
        </button>
      </section>
    </div>
  );
}