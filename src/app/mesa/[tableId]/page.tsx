import { MesaClient } from "./MesaClient";

type TablePageProps = {
  params: Promise<{
    tableId: string;
  }>;
};

export default async function TablePage({ params }: TablePageProps) {
  const { tableId } = await params;

  return (
    <main className="min-h-screen bg-[#0f1115] text-white">
      <MesaClient tableId={tableId} />
    </main>
  );
}