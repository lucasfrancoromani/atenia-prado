import Link from "next/link";
import type { Order } from "@/types/order";
import { formatCurrency } from "@/lib/menu";

type OrderConfirmationProps = {
  order: Order;
  onReset: () => void;
};

export function OrderConfirmation({ order, onReset }: OrderConfirmationProps) {
  return (
    <section className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-md flex-col justify-center px-5 py-10">
      <div className="premium-panel rounded-[2rem] p-7 text-center">
        <div className="mx-auto grid size-20 place-items-center rounded-full bg-success text-4xl font-bold text-white shadow-[0_20px_60px_rgba(34,197,94,0.22)]">
          ✓
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-accent">
          Pedido confirmado
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Mesa {order.tableId}</h1>
        <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
          <p className="text-sm text-muted">Número de pedido</p>
          <p className="mt-2 font-mono text-3xl font-bold text-white">
            {order.orderNumber}
          </p>
          <div className="my-5 h-px bg-white/10" />
          <p className="text-sm text-muted">Tiempo estimado</p>
          <p className="mt-1 text-2xl font-semibold">
            {order.estimatedMinutes}-{order.estimatedMinutes + 4} min
          </p>
          <p className="mt-4 font-mono text-sm text-accent">
            {formatCurrency(order.total)} pagado
          </p>
        </div>
        <p className="mt-5 text-sm leading-6 text-muted">
          Te avisaremos en barra cuando esté listo. Puedes seguir pidiendo
          desde esta mesa.
        </p>
        <div className="mt-7 grid gap-3">
          <button
            type="button"
            onClick={onReset}
            className="min-h-13 rounded-2xl bg-accent px-5 font-bold text-black"
          >
            Seguir pidiendo
          </button>
          <Link
            href="/staff"
            className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-white/10 px-5 font-semibold text-white/80"
          >
            Ver en staff
          </Link>
        </div>
      </div>
    </section>
  );
}
