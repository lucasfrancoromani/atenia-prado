"use client";

import Image from "next/image";
import type { Order, OrderStatus } from "@/types/order";
import { formatCurrency, menuProducts } from "@/lib/menu";

const statusLabels: Record<OrderStatus, string> = {
  nuevo: "Nuevo",
  preparando: "Preparando",
  listo: "Listo",
  entregado: "Entregado",
};

const statusClassNames: Record<OrderStatus, string> = {
  nuevo: "bg-accent text-black",
  preparando: "bg-blue-500 text-white",
  listo: "bg-success text-white",
  entregado: "bg-white/10 text-white/55",
};

type StaffOrderCardProps = {
  order: Order;
  onStatusChange: (orderId: string, status: OrderStatus) => void;
};

export function StaffOrderCard({ order, onStatusChange }: StaffOrderCardProps) {
  const delivered = order.status === "entregado";
  const createdTime = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(order.createdAt));

  return (
    <article
      className={`premium-panel rounded-3xl p-5 transition ${
        delivered ? "opacity-55" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-muted">{order.orderNumber}</p>
          <h3 className="mt-2 text-3xl font-semibold">Mesa {order.tableId}</h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] ${statusClassNames[order.status]}`}
        >
          {statusLabels[order.status]}
        </span>
      </div>

      <div className="mt-5 space-y-2">
        {order.items.map((item) => (
          <div
            key={`${order.id}-${item.productId}`}
            className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.035] px-3 py-3"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Image
                src={
                  menuProducts.find((product) => product.id === item.productId)
                    ?.imageUrl ?? "/assets/drink-cana.svg"
                }
                alt={item.name}
                width={42}
                height={42}
                className="size-11 shrink-0 rounded-xl border border-white/10 object-cover"
              />
              <span className="truncate text-sm text-white/90">
                {item.quantity}x {item.name}
              </span>
            </div>
            <span className="font-mono text-sm text-white/80">
              {formatCurrency(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5 text-sm">
        <div>
          <p className="text-muted">Total</p>
          <p className="mt-1 font-mono font-semibold">
            {formatCurrency(order.total)}
          </p>
        </div>
        <div>
          <p className="text-muted">Pago</p>
          <p className="mt-1 font-semibold text-success">
            {order.paid ? "Pagado" : "Pendiente"}
          </p>
        </div>
        <div>
          <p className="text-muted">Hora</p>
          <p className="mt-1 font-mono font-semibold">{createdTime}</p>
        </div>
      </div>

      <label className="mt-5 block text-xs font-bold uppercase tracking-[0.18em] text-muted">
        Estado
      </label>
      <select
        value={order.status}
        onChange={(event) =>
          onStatusChange(order.id, event.target.value as OrderStatus)
        }
        className="mt-2 min-h-12 w-full rounded-2xl border border-white/10 bg-[#101319] px-4 font-semibold text-white outline-none transition focus:border-accent"
      >
        <option value="nuevo">Nuevo</option>
        <option value="preparando">Preparando</option>
        <option value="listo">Listo</option>
        <option value="entregado">Entregado</option>
      </select>
    </article>
  );
}
