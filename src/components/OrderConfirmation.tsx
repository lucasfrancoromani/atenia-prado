import Link from "next/link";
import type { Order } from "@/types/order";

type OrderConfirmationProps = {
  order: Order;
  onReset: () => void;
};

export function OrderConfirmation({ order, onReset }: OrderConfirmationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-md fade-in">

      <section className="premium-panel relative z-10 w-full max-h-[90vh] overflow-y-auto rounded-t-[2.5rem] p-6 pb-10 animate-slide-up text-center">
        <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-white/20" />

        {/* Ícono de Éxito Premium */}
        <div className="mx-auto mb-6 grid size-24 place-items-center rounded-full bg-success/10 border border-success/20 text-success shadow-[0_0_60px_rgba(34,197,94,0.15)]">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5"></path>
          </svg>
        </div>

        <p className="text-xs font-black uppercase tracking-[0.24em] text-accent mb-2">
          ¡Pedido confirmado!
        </p>
        <h1 className="text-3xl font-black text-white tracking-tight mb-8">
          Mesa {order.tableId}
        </h1>

        {/* Tarjeta de Resumen */}
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 mb-6 text-left">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-muted">Número de pedido</span>
            <span className="font-mono text-xl font-bold text-white">{order.orderNumber}</span>
          </div>
          <div className="h-px bg-white/5 w-full my-4" />
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-muted">Tiempo estimado</span>
            <span className="font-mono text-lg font-bold text-white">
              {order.estimatedMinutes} - {order.estimatedMinutes + 4} min
            </span>
          </div>
        </div>

        {/* COPY ACTUALIZADO: Enfoque en el servicio de mesa */}
        <p className="text-sm leading-relaxed text-white/70 mb-8 px-2">
          Relájate y disfruta. Nuestros camareros te llevarán el pedido a la mesa enseguida.
        </p>

        {/* Botón Principal */}
        <button
          type="button"
          onClick={onReset}
          className="w-full flex items-center justify-center min-h-[3.5rem] rounded-[1.25rem] bg-accent text-black text-lg font-bold transition active:scale-[0.98] shadow-[0_15px_40px_rgba(245,197,66,0.15)] mb-4"
        >
          Seguir pidiendo
        </button>

        {/* Atajo para la demostración (para que pases directo al panel de staff) */}
        <Link
          href="/staff"
          className="inline-flex items-center justify-center min-h-[3.5rem] rounded-[1.25rem] border border-white/10 w-full text-white/60 font-semibold transition active:scale-[0.98] hover:bg-white/[0.02]"
        >
          Ver comanda en panel staff
        </Link>
      </section>

    </div>
  );
}