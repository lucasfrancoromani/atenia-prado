"use client";

import Image from "next/image";
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
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/60 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Cerrar carrito"
        onClick={onClose}
      />
      <section className="premium-panel relative z-10 max-h-[86vh] w-full overflow-y-auto rounded-t-[2rem] p-5 pb-7">
        <div className="mx-auto h-1.5 w-12 rounded-full bg-white/20" />
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
            className="grid size-10 place-items-center rounded-full border border-white/10 text-xl text-white/80"
            aria-label="Cerrar"
          >
            x
          </button>
        </div>

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
                  className="grid size-9 place-items-center rounded-full border border-white/10 text-lg"
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
                  className="grid size-9 place-items-center rounded-full bg-accent text-lg font-bold text-black"
                  aria-label={`Agregar ${item.product.name}`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3 border-t border-white/10 pt-5">
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Servicio</span>
            <span>{formatCurrency(0)}</span>
          </div>
          <div className="flex items-center justify-between text-xl font-semibold">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onCheckout}
          className="mt-6 min-h-14 w-full rounded-2xl bg-accent text-base font-bold text-black shadow-[0_18px_42px_rgba(245,197,66,0.18)] transition hover:brightness-110"
        >
          Continuar al pago
        </button>
      </section>
    </div>
  );
}
