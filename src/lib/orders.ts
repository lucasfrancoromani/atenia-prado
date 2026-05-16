import type { CartItem, Order, OrderStatus } from "@/types/order";

export const ORDER_STORAGE_KEY = "qr-horeca-orders-v1";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function safeParseOrders(rawOrders: string | null): Order[] {
  if (!rawOrders) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawOrders);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getOrders(): Order[] {
  if (!canUseStorage()) {
    return [];
  }

  return safeParseOrders(window.localStorage.getItem(ORDER_STORAGE_KEY));
}

export function saveOrders(orders: Order[]) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
}

export function createOrder(tableId: string, cartItems: CartItem[]): Order {
  const total = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  const order: Order = {
    id: crypto.randomUUID(),
    orderNumber: `#${Math.floor(1000 + Math.random() * 9000)}`,
    tableId,
    items: cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      category: item.product.category,
      price: item.product.price,
      quantity: item.quantity,
    })),
    total,
    status: "nuevo",
    paid: true,
    createdAt: new Date().toISOString(),
    estimatedMinutes: Math.max(5, Math.min(14, 4 + cartItems.length * 2)),
  };

  saveOrders([order, ...getOrders()]);
  return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus) {
  const updatedOrders = getOrders().map((order) =>
    order.id === orderId ? { ...order, status } : order,
  );

  saveOrders(updatedOrders);
  return updatedOrders;
}
