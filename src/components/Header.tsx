export default function Header() {
  return (
    <header data-fade className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div
        className="pointer-events-auto flex w-full max-w-4xl items-center justify-between gap-4
                   rounded-full border border-white/10 bg-white/5 px-5 py-3
                   backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-wide text-white/90 md:text-base">
            Táctiles Punto 30
          </p>
          <p className="truncate text-xs text-white/55 md:text-sm">Calle 13, Bogotá, Colombia</p>
        </div>

        <a
          href="https://wa.me/573125820019"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-neon shrink-0 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black
                     transition hover:bg-white/95 active:bg-white/90"
        >
          Haz una reserva
        </a>
      </div>
    </header>
  );
}

