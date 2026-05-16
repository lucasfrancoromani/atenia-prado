export type Product = {
  id: string;
  name: string;
  category: "Cervezas" | "Copas" | "Refrescos" | "Agua" | "Cafes";
  price: number;
  description: string;
  imageUrl: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus = "nuevo" | "preparando" | "listo" | "entregado";

export type OrderItem = {
  productId: string;
  name: string;
  category: Product["category"];
  price: number;
  quantity: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  tableId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paid: true;
  createdAt: string;
  estimatedMinutes: number;
};
