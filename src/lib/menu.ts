import type { Product } from "@/types/order";

export const menuProducts: Product[] = [
  {
    id: "cana",
    name: "Caña",
    category: "Cervezas",
    price: 1.90, // Precio ajustado al mockup
    description: "Tirada fría, espuma fina.",
    imageUrl: "/mock-beer.png",
  },
  {
    id: "doble",
    name: "Doble",
    category: "Cervezas",
    price: 3.40, // Precio ajustado al mockup
    description: "Más cuerpo, mismo punto perfecto.",
    imageUrl: "/mock-beer.png",
  },
  {
    id: "aperol-spritz",
    name: "Aperol Spritz",
    category: "Copas",
    price: 6.50, // Precio ajustado al mockup
    description: "Aperol, burbuja y naranja.",
    imageUrl: "/mock-aperol.png",
  },
  {
    id: "coca-cola",
    name: "Coca Cola",
    category: "Refrescos",
    price: 2.20, // Precio ajustado al mockup
    description: "Botellín frío servido con hielo.",
    imageUrl: "/mock-coca.png",
  },
  {
    id: "agua-mineral",
    name: "Agua",
    category: "Agua",
    price: 1.50, // Precio ajustado al mockup
    description: "Natural o con gas.",
    imageUrl: "/mock-water.png",
  },
];

export const menuCategories = Array.from(
  new Set(menuProducts.map((product) => product.category)),
);

export function formatCurrency(value: number) {
  // Fix: Usar formato manual en lugar de Intl.NumberFormat
  // Intl.NumberFormat genera espacios distintos (NBSP vs normal) en Node.js (Servidor) y iOS Safari (Cliente),
  // lo que causa un "Hydration Error" que congela todo el Javascript de la página en el móvil.
  const formatted = value.toFixed(2).replace(".", ",");
  return `${formatted} €`;
}
