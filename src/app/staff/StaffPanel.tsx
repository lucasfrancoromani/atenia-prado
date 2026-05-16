"use client";

import { useEffect, useMemo, useState } from "react";
import { StaffOrderCard } from "@/components/StaffOrderCard";
import { formatCurrency } from "@/lib/menu";
import { getOrders, ORDER_STORAGE_KEY, updateOrderStatus } from "@/lib/orders";
import type { Order, OrderStatus } from "@/types/order";

export function StaffPanel() {
  const [orders, setOrders] = useState<Order[]>(() => getOrders());

  function refreshOrders() {
    setOrders(getOrders());
  }

  useEffect(() => {
    const initialRefresh = window.setTimeout(refreshOrders, 0);

    function handleStorage(event: StorageEvent) {
      if (event.key === ORDER_STORAGE_KEY) {
        refreshOrders();
      }
    }

    window.addEventListener("storage", handleStorage);
    const interval = window.setInterval(refreshOrders, 2500);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.clearTimeout(initialRefresh);
      window.clearInterval(interval);
    };
  }, []);

  const activeOrders = orders.filter((order) => order.status !== "entregado");
  const deliveredOrders = orders.filter((order) => order.status === "entregado");
  const orderedOrders = [...activeOrders, ...deliveredOrders];
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const readyCount = orders.filter((order) => order.status === "listo").length;

  const topProducts = useMemo(() => {
    const totals = new Map<string, number>();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        totals.set(item.name, (totals.get(item.name) ?? 0) + item.quantity);
      });
    });

    return Array.from(totals.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [orders]);

  function handleStatusChange(orderId: string, status: OrderStatus) {
    setOrders(updateOrderStatus(orderId, status));
  }

  return (
    <section className="pb-10 pt-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="premium-panel rounded-3xl p-5">
          <p className="text-sm text-muted">Pedidos activos</p>
          <p className="mt-2 font-mono text-4xl font-bold">
            {activeOrders.length}
          </p>
        </div>
        <div className="premium-panel rounded-3xl p-5">
          <p className="text-sm text-muted">Ventas demo</p>
          <p className="mt-2 font-mono text-4xl font-bold text-accent">
            {formatCurrency(revenue)}
          </p>
        </div>
        <div className="premium-panel rounded-3xl p-5">
          <p className="text-sm text-muted">Listos para servir</p>
          <p className="mt-2 font-mono text-4xl font-bold text-success">
            {readyCount}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
                Barra
              </p>
              <h1 className="mt-2 text-3xl font-semibold">
                Pedidos en tiempo real
              </h1>
            </div>
            <button
              type="button"
              onClick={refreshOrders}
              className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 transition hover:border-accent/50 hover:text-accent"
            >
              Actualizar
            </button>
          </div>

          {orderedOrders.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {orderedOrders.map((order) => (
                <StaffOrderCard
                  key={order.id}
                  order={order}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="premium-panel grid min-h-72 place-items-center rounded-[2rem] p-8 text-center">
              <div>
                <p className="text-5xl text-accent">+</p>
                <h2 className="mt-4 text-2xl font-semibold">
                  Aún no hay pedidos
                </h2>
                <p className="mt-2 max-w-sm text-sm leading-6 text-muted">
                  Abre una mesa, agrega productos y confirma el pago para ver la
                  comanda aquí.
                </p>
              </div>
            </div>
          )}
        </div>

        <aside className="premium-panel h-fit rounded-[2rem] p-5">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-accent">
            Resumen
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Pulso del día</h2>
          <div className="mt-5 space-y-4">
            {topProducts.length ? (
              topProducts.map(([name, quantity], index) => (
                <div key={name}>
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="text-white/85">{name}</span>
                    <span className="font-mono text-muted">{quantity}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{
                        width: `${Math.max(18, 100 - index * 18)}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-muted">
                Los productos más vendidos aparecerán cuando entren pedidos.
              </p>
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
