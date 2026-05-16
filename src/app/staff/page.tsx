import { Header } from "@/components/Header";
import { StaffPanel } from "./StaffPanel";

export default function StaffPage() {
  return (
    <main className="soft-grid min-h-screen text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <Header eyebrow="Staff bar" title="Pedidos en curso" />
        <StaffPanel />
      </div>
    </main>
  );
}
