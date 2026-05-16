import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-background px-4 text-white">

      {/* Logo de la marca en la parte superior usando tu imagen */}
      <div className="absolute top-10">
        <Image
          src="/logo-atenia.png"
          alt="Logo Atenia"
          width={140}
          height={45}
          className="opacity-80 drop-shadow-lg"
          style={{ width: "auto", height: "auto" }} /* FIX: Mantiene la proporción real del logo */
          priority
        />
      </div>

      {/* FIX: Se restringe el hover a desktop (md:) y se agrega active:scale para feedback táctil en móvil */}
      {/* Usamos <a> nativo en lugar de <Link> para forzar la navegación dura */}
      <a
        href="/mesa/12"
        className="group relative inline-flex items-center justify-center rounded-full bg-accent px-16 py-6 text-2xl font-black tracking-widest text-black shadow-[0_0_60px_rgba(245,197,66,0.25)] transition-all duration-300 hover:scale-105 hover:bg-white hover:shadow-[0_0_80px_rgba(255,255,255,0.4)] active:scale-95"
      >
        DEMO
      </a>

      {/* Atajo discreto al panel de staff */}
      <div className="absolute bottom-10">
        <Link
          href="/staff"
          className="text-xs font-semibold tracking-wider text-white/20 transition-colors hover:text-white/60"
        >
          Staff Panel
        </Link>
      </div>

    </main>
  );
}