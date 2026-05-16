import Image from "next/image";
import type { Product } from "@/types/order";
import { formatCurrency } from "@/lib/menu";

type ProductCardProps = {
  product: Product;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
};

export function ProductCard({ product, quantity, onAdd, onRemove }: ProductCardProps) {
  return (
    <article className="bg-[#14161d] border border-white/[0.03] rounded-2xl p-3 flex items-center justify-between gap-3 transition-all hover:border-white/10">

      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="relative size-16 shrink-0 overflow-hidden rounded-xl bg-neutral-900 border border-white/5">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="64px" /* FIX: Como la miniatura mide 4rem (64px), le decimos a Next.js que la optimice exacto a ese tamaño */
            className="object-cover"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-white tracking-wide truncate">
            {product.name}
          </p>
          <p className="mt-0.5 font-mono text-xs font-semibold text-white/50">
            {formatCurrency(product.price)}
          </p>
        </div>
      </div>

      <div className="flex items-center bg-black/20 rounded-full border border-white/5 p-0.5 shrink-0">
        {quantity > 0 ? (
          <div className="flex items-center gap-2 px-1">
            <button
              type="button"
              onClick={onRemove}
              className="grid size-7 place-items-center rounded-full bg-white/[0.04] text-sm font-black text-white/80 transition hover:bg-white/10 active:scale-90"
              aria-label="Restar uno"
            >
              -
            </button>
            <span className="w-4 text-center font-mono text-xs font-bold text-accent">
              {quantity}
            </span>
          </div>
        ) : null}

        <button
          type="button"
          onClick={onAdd}
          className="grid size-8 place-items-center rounded-full bg-accent text-lg font-black text-black transition active:scale-90 shadow-md shadow-accent/5"
          aria-label="Sumar uno"
        >
          +
        </button>
      </div>
    </article>
  );
}