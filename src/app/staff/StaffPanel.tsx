"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/menu";
import { supabase } from "@/lib/supabase";

type OrderStatus = "NUEVO" | "PREPARANDO" | "LISTO";
type StaffOrder = {
  id: string;
  tableId: string;
  time: string;
  status: OrderStatus;
  items: { name: string; qty: number; price: number; imageUrl?: string }[];
  total: number;
  tip: number;
  comment?: string;
};

const initialOrders: StaffOrder[] = [
  {
    id: "3457", tableId: "12", time: "12:45", status: "NUEVO",
    items: [
      { name: "Caña", qty: 2, price: 1.90, imageUrl: "/mock-beer.png" },
      { name: "Aperol Spritz", qty: 1, price: 6.50, imageUrl: "/aperitivos.png" }
    ],
    total: 10.30, tip: 0,
  },
  {
    id: "3456", tableId: "05", time: "12:44", status: "NUEVO",
    items: [
      { name: "Doble", qty: 1, price: 3.40, imageUrl: "/mock-beer.png" },
      { name: "Coca Cola", qty: 1, price: 2.50, imageUrl: "/mock-beer.png" }
    ],
    total: 5.90, tip: 0,
  }
];

type Tab = "pedidos" | "historial" | "productos" | "ajustes";

export function StaffPanel() {
  const [activeTab, setActiveTab] = useState<Tab>("pedidos");
  const [orders, setOrders] = useState<StaffOrder[]>(initialOrders);
  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null);

  // MAGIA EN TIEMPO REAL
  useEffect(() => {
    const channel = supabase
      .channel('realtime-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const dbOrder = payload.new;
          const date = new Date(dbOrder.created_at);
          const timeString = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

          const incomingOrder: StaffOrder = {
            id: String(dbOrder.order_number).padStart(4, "0"),
            tableId: dbOrder.table_id,
            time: timeString,
            status: "NUEVO",
            items: dbOrder.items,
            total: Number(dbOrder.total),
            tip: Number(dbOrder.tip),
            comment: dbOrder.comment
          };

          // Intento de reproducir sonido (funcionará si el usuario ya hizo clic en la página)
          // Reproducir sonido manejando la promesa del Autoplay
          const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
          audio.play().catch((error) => {
            console.warn("🔔 Sonido silenciado: El camarero debe hacer al menos un clic en la pantalla para activar las alertas sonoras.");
          });

          setOrders((currentOrders) => [incomingOrder, ...currentOrders]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handlePrint = () => window.print();

  const cycleStatus = (e: React.MouseEvent, id: string, currentStatus: OrderStatus) => {
    e.stopPropagation();
    const nextStatus: Record<OrderStatus, OrderStatus> = {
      "NUEVO": "PREPARANDO",
      "PREPARANDO": "LISTO",
      "LISTO": "NUEVO"
    };
    setOrders((curr) => curr.map(o => o.id === id ? { ...o, status: nextStatus[currentStatus] } : o));

    if (selectedOrder?.id === id) {
      setSelectedOrder(curr => curr ? { ...curr, status: nextStatus[currentStatus] } : null);
    }
  };

  const markAsReadyAndClose = (id: string) => {
    setOrders((curr) => curr.map(o => o.id === id ? { ...o, status: "LISTO" } : o));
    setSelectedOrder(null);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "NUEVO": return "bg-accent text-black";
      case "PREPARANDO": return "bg-blue-600 text-white";
      case "LISTO": return "bg-[#22c55e] text-white";
    }
  };

  return (
    <>
      {/* Estilos inyectados para el resplandor de alerta visual */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes alert-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(245, 197, 66, 0.1); border-color: rgba(245, 197, 66, 0.3); }
          50% { box-shadow: 0 0 45px rgba(245, 197, 66, 0.6); border-color: rgba(245, 197, 66, 0.9); }
        }
        .animate-alert-glow {
          animation: alert-glow 1.5s ease-in-out infinite;
        }
      `}} />

      <div className="flex flex-col h-screen bg-[#0f1115] text-white print:hidden font-sans w-full max-w-[1800px] mx-auto relative">

        {/* PANTALLA 1: PEDIDOS EN CURSO */}
        {activeTab === "pedidos" && (
          <div className="flex-1 flex flex-col overflow-hidden fade-in">
            <header className="flex items-center justify-between px-6 md:px-12 pt-8 md:pt-16 pb-6 md:pb-12">
              <div className="flex items-center gap-4 md:gap-6">
                <button className="text-white/60 hover:text-white transition">
                  <svg className="w-6 h-6 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>
                <h1 className="text-base md:text-2xl font-black tracking-[0.2em] uppercase text-white/90">Pedidos en curso</h1>
              </div>
              <div className="text-xs md:text-lg font-semibold text-white/50 flex items-center gap-2 md:gap-3 border border-white/10 rounded-xl px-4 py-2 md:py-3 cursor-pointer hover:bg-white/5 transition">
                Todos <span className="text-[10px] md:text-sm">▼</span>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 md:px-12 pb-32 md:pb-40 space-y-4 md:space-y-6 no-scrollbar">
              {orders.map((order, index) => {
                // Ahora la alerta visual se aplica a CUALQUIER pedido que esté "NUEVO"
                const isNewAlert = order.status === "NUEVO";

                return (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`relative flex flex-col md:flex-row md:items-center justify-between bg-[#181b22] rounded-2xl md:rounded-3xl p-4 md:p-6 cursor-pointer transition active:scale-[0.99] hover:bg-[#1c2028] border gap-4 md:gap-0 ${isNewAlert
                      ? "animate-alert-glow animate-in fade-in slide-in-from-top-4"
                      : "border-white/5"
                      }`}
                  >
                    {/* Detalle de la línea superior resaltada */}
                    {isNewAlert && (
                      <div className="absolute -top-[1px] left-6 md:left-8 w-16 md:w-32 h-[2px] md:h-[3px] bg-accent rounded-b-sm" />
                    )}

                    {/* BALIZA LUMINOSA RADAR (Ping) */}
                    {/* Ubicación interna segura y tamaño optimizado para evitar cortes en los bordes */}
                    {isNewAlert && (
                      <span className="absolute top-2 right-2 md:top-3 md:right-3 flex h-4 w-4 md:h-5 md:w-5 z-10">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 md:h-5 md:w-5 bg-accent border-2 border-[#181b22]"></span>
                      </span>
                    )}

                    <div className="flex items-center gap-4 md:gap-8 flex-1 min-w-0">
                      <div className={`grid h-16 w-20 md:h-24 md:w-28 place-items-center rounded-xl md:rounded-2xl font-black text-2xl md:text-[2.5rem] shrink-0 transition-colors ${isNewAlert ? "bg-accent text-black" : "bg-[#22252e] text-white"
                        }`}>
                        {order.tableId}
                      </div>

                      <div className="hidden md:block text-2xl font-semibold text-white/40 shrink-0 w-28">
                        #{order.id}
                      </div>

                      <div className="flex items-center gap-3 md:gap-4 text-base md:text-2xl text-white/90 font-medium flex-1 min-w-0">
                        <div className="opacity-30 mix-blend-luminosity grayscale hidden md:flex shrink-0">
                          <svg className="w-5 h-5 md:w-7 md:h-7" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2h10v3H7V2zm2 5h6v13a2 2 0 01-2 2h-2a2 2 0 01-2-2V7z" /></svg>
                        </div>
                        <span className="truncate">
                          {order.items.map(i => `${i.qty}x ${i.name}`).join(", ")}
                        </span>

                        {/* Indicador visual de nota/comentario */}
                        {order.comment && (
                          <span className="ml-3 shrink-0 inline-flex items-center gap-1.5 bg-accent/10 border border-accent/30 text-accent text-xs md:text-base px-2.5 py-1 rounded-xl font-black uppercase tracking-wider animate-pulse">
                            <span>📝</span>
                            <span className="hidden sm:inline">Nota</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 md:gap-12 shrink-0">
                      <span className="text-sm md:text-2xl text-white/40 font-mono pl-1 md:pl-0">{order.time}</span>
                      <button
                        onClick={(e) => cycleStatus(e, order.id, order.status)}
                        className={`flex-1 md:flex-none md:w-56 py-3 md:py-5 rounded-xl md:rounded-2xl text-xs md:text-xl font-black uppercase tracking-wider transition shadow-lg ${getStatusColor(order.status)}`}
                      >
                        {order.status}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PANTALLA 3: RESUMEN DEL DÍA */}
        {activeTab === "historial" && (
          <div className="flex-1 overflow-y-auto px-6 md:px-12 pt-8 md:pt-16 pb-32 md:pb-40 fade-in">
            <h1 className="text-base md:text-2xl font-black tracking-[0.2em] uppercase text-white/90 mb-6 md:mb-12">Resumen del día</h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-6 md:mb-12">
              <div className="bg-[#181b22] rounded-2xl md:rounded-[2rem] p-5 md:p-8 border border-white/5">
                <p className="text-xs md:text-lg text-white/50 mb-2 md:mb-3 font-semibold">Pedidos</p>
                <p className="text-2xl md:text-[3rem] leading-none font-black">{orders.length + 126}</p>
              </div>
              <div className="bg-[#181b22] rounded-2xl md:rounded-[2rem] p-5 md:p-8 border border-white/5">
                <p className="text-xs md:text-lg text-white/50 mb-2 md:mb-3 font-semibold flex items-center gap-1 md:gap-2">
                  <span className="text-accent">🔒</span> Ventas
                </p>
                <p className="text-2xl md:text-[3rem] leading-none font-black">1.248 €</p>
              </div>
              <div className="bg-[#181b22] rounded-2xl md:rounded-[2rem] p-5 md:p-8 border border-white/5">
                <p className="text-xs md:text-lg text-white/50 mb-2 md:mb-3 font-semibold">Ticket medio</p>
                <p className="text-2xl md:text-[3rem] leading-none font-black">9,75 €</p>
              </div>
              <div className="bg-[#181b22] rounded-2xl md:rounded-[2rem] p-5 md:p-8 border border-white/5">
                <p className="text-xs md:text-lg text-white/50 mb-2 md:mb-3 font-semibold">Tiempo prom.</p>
                <p className="text-2xl md:text-[3rem] leading-none font-black">7 min</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="bg-[#181b22] rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5">
                <p className="text-sm md:text-xl font-bold text-white/80 mb-6 md:mb-10">Productos más vendidos</p>
                <div className="space-y-4 md:space-y-8">
                  {[
                    { name: "Caña", qty: 58, width: "100%" },
                    { name: "Aperol Spritz", qty: 34, width: "60%" },
                    { name: "Doble", qty: 22, width: "40%" },
                    { name: "Coca Cola", qty: 14, width: "25%" },
                    { name: "Agua", qty: 10, width: "15%" },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-3 md:gap-6 text-sm md:text-xl">
                      <span className="w-24 md:w-40 truncate text-white/60">{p.name}</span>
                      <div className="flex-1 h-2 md:h-3 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent rounded-full" style={{ width: p.width }} />
                      </div>
                      <span className="w-8 md:w-12 text-right font-mono text-white/80">{p.qty}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#181b22] rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 border border-white/5 flex flex-col">
                <p className="text-sm md:text-xl font-bold text-white/80 mb-6 md:mb-10">Pedidos por hora</p>
                <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 mt-auto pt-4 md:pt-6 border-l-2 border-b-2 border-white/10 relative min-h-[150px]">
                  <div className="absolute -left-6 md:-left-10 top-0 bottom-0 flex flex-col justify-between text-[10px] md:text-sm text-white/40">
                    <span>30</span><span>20</span><span>10</span><span>0</span>
                  </div>
                  {[
                    { time: "10h", h: "10%" }, { time: "12h", h: "30%" }, { time: "14h", h: "60%" },
                    { time: "16h", h: "90%" }, { time: "18h", h: "70%" }, { time: "20h", h: "50%" },
                    { time: "22h", h: "40%" }, { time: "00h", h: "20%" }
                  ].map((bar, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                      <div className="w-full bg-[#1e40af] rounded-t-sm md:rounded-t-md transition-colors group-hover:bg-accent" style={{ height: bar.h }} />
                      <span className="text-[10px] md:text-base text-white/40 mt-2 md:mt-4">{bar.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "productos" || activeTab === "ajustes") && (
          <div className="flex-1 grid place-items-center text-white/40 uppercase tracking-widest text-lg md:text-3xl font-bold fade-in">
            Próximamente: {activeTab}
          </div>
        )}

        {/* BARRA DE NAVEGACIÓN INFERIOR */}
        <nav className="absolute bottom-0 w-full bg-[#0a0c10]/95 backdrop-blur-md border-t border-white/5 flex justify-around items-center h-20 md:h-32 z-40 px-4 md:px-12">
          <button onClick={() => setActiveTab("pedidos")} className={`flex flex-col items-center gap-1 md:gap-3 ${activeTab === "pedidos" ? "text-accent" : "text-white/40 hover:text-white/70 transition"}`}>
            <svg className="w-6 h-6 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
            <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">Pedidos</span>
          </button>
          <button onClick={() => setActiveTab("historial")} className={`flex flex-col items-center gap-1 md:gap-3 ${activeTab === "historial" ? "text-accent" : "text-white/40 hover:text-white/70 transition"}`}>
            <svg className="w-6 h-6 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">Historial</span>
          </button>
          <button onClick={() => setActiveTab("productos")} className={`flex flex-col items-center gap-1 md:gap-3 ${activeTab === "productos" ? "text-accent" : "text-white/40 hover:text-white/70 transition"}`}>
            <svg className="w-6 h-6 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">Productos</span>
          </button>
          <button onClick={() => setActiveTab("ajustes")} className={`flex flex-col items-center gap-1 md:gap-3 ${activeTab === "ajustes" ? "text-accent" : "text-white/40 hover:text-white/70 transition"}`}>
            <svg className="w-6 h-6 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="text-[10px] md:text-sm font-bold uppercase tracking-wider">Ajustes</span>
          </button>
        </nav>

        {/* DETALLE DEL PEDIDO (MODAL) */}
        {selectedOrder && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8 fade-in">
            <div className="bg-[#181b22] border border-white/10 rounded-[2rem] md:rounded-[3rem] w-full max-w-sm md:max-w-2xl overflow-hidden flex flex-col shadow-2xl relative">

              <button onClick={() => setSelectedOrder(null)} className="absolute top-5 md:top-8 right-5 md:right-8 text-white/40 hover:text-white transition">
                <svg className="w-6 h-6 md:w-8 md:h-8" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 18L18 6M6 6l12 12" /></svg>
              </button>

              <div className="p-6 md:p-10 border-b border-white/5">
                <div className="flex justify-between items-center mb-4 md:mb-8">
                  <span className="text-white/50 text-sm md:text-xl font-semibold">Pedido #{selectedOrder.id}</span>
                  <span className={`px-3 md:px-5 py-1 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-sm font-black uppercase tracking-wider ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-3xl md:text-[4rem] leading-none font-black text-white tracking-tight">Mesa {selectedOrder.tableId}</p>
                  </div>
                  <span className="font-mono text-white/50 text-sm md:text-xl">{selectedOrder.time}</span>
                </div>
              </div>

              <div className="p-6 md:p-10 flex-1 space-y-4 md:space-y-8 overflow-y-auto max-h-[40vh]">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-3 md:gap-6">
                      <div className="relative bg-white/5 rounded-xl md:rounded-2xl w-10 h-12 md:w-14 md:h-16 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                        {item.imageUrl ? (
                          <Image src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                        ) : (
                          <span className="text-sm md:text-xl">🍺</span>
                        )}
                      </div>
                      <span className="font-semibold text-white/90 text-sm md:text-2xl">
                        <span className="text-accent font-black mr-2 md:mr-3">{item.qty}x</span> {item.name}
                      </span>
                    </div>
                    <span className="font-mono text-white/70 text-sm md:text-2xl">{formatCurrency(item.qty * item.price)}</span>
                  </div>
                ))}

                <div className="mt-6 md:mt-12">
                  <p className="text-xs md:text-lg font-semibold text-white/40 mb-2 md:mb-3">Comentario</p>
                  <p className="text-sm md:text-xl text-white/80 bg-white/[0.02] p-4 md:p-6 rounded-xl md:rounded-3xl border border-white/5">
                    {selectedOrder.comment || "Sin comentarios"}
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-10 space-y-3 md:space-y-5 bg-white/[0.01]">
                <button
                  onClick={() => markAsReadyAndClose(selectedOrder.id)}
                  className="w-full py-4 md:py-6 rounded-xl md:rounded-3xl bg-[#22c55e] text-white text-base md:text-2xl font-black transition active:scale-[0.98] shadow-[0_10px_30px_rgba(34,197,94,0.2)] hover:brightness-110"
                >
                  Marcar como listo
                </button>
                <button
                  onClick={handlePrint}
                  className="w-full py-4 md:py-6 rounded-xl md:rounded-3xl border border-white/10 text-white text-sm md:text-xl font-bold transition active:scale-[0.98] hover:bg-white/5"
                >
                  Imprimir ticket
                </button>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* PLANTILLA DE IMPRESIÓN DEL TICKET */}
      {selectedOrder && (
        <div className="hidden print:block text-black bg-white w-[80mm] p-4 font-mono text-sm mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-xl font-black uppercase">MERCADO DEL PRADO</h2>
            <p className="text-xs mt-1">Ticket de Comanda</p>
            <p className="text-xs mt-1">{new Date().toLocaleDateString()} - {selectedOrder.time}</p>
          </div>
          <div className="border-t border-b border-black border-dashed py-2 mb-4 text-center">
            <p className="text-3xl font-black">MESA {selectedOrder.tableId}</p>
            <p className="text-xs mt-1 uppercase">Orden: {selectedOrder.id}</p>
          </div>
          <div className="space-y-2 mb-4">
            {selectedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.qty}x {item.name}</span>
                <span>{formatCurrency(item.qty * item.price)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-black border-dashed pt-2 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(selectedOrder.total)}</span>
            </div>
            {selectedOrder.tip > 0 && (
              <div className="flex justify-between">
                <span>Servicio</span>
                <span>{formatCurrency(selectedOrder.tip)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black mt-2">
              <span>TOTAL</span>
              <span>{formatCurrency(selectedOrder.total + selectedOrder.tip)}</span>
            </div>
          </div>
          {selectedOrder.comment && (
            <div className="mt-4 p-2 border border-black text-center">
              <p className="font-bold">NOTA:</p>
              <p className="text-xs">{selectedOrder.comment}</p>
            </div>
          )}
          <div className="text-center mt-6 text-xs">
            <p>¡Gracias por su visita!</p>
            <p className="mt-1">Generado por Atenia AI</p>
          </div>
        </div>
      )}
    </>
  );
}