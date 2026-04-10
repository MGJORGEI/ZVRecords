export default function AboutLoading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background"
      role="status"
      aria-label="Cargando página Nuestra Historia"
    >
      <div className="flex flex-col items-center gap-5">
        {/* Spinner — borde sólido border-accent, sin neon */}
        <div className="relative w-14 h-14" aria-hidden="true">
          {/* Anillo estático */}
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          {/* Arco giratorio */}
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
        </div>

        {/* Label */}
        <div className="flex flex-col items-center gap-1">
          <p className="text-sm text-muted tracking-[0.3em] uppercase font-semibold">
            Cargando
          </p>
        </div>
      </div>
    </div>
  );
}
