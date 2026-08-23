export function BarraProgresso({
  valor,
  cor,
}: {
  /** 0 a 100 */
  valor: number;
  /** cor de destaque (ex.: corHex do módulo) */
  cor?: string;
}) {
  const seguro = Math.min(100, Math.max(0, valor));
  return (
    <div
      role="progressbar"
      aria-valuenow={seguro}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${seguro}%`, backgroundColor: cor ?? "#4f46e5" }}
      />
    </div>
  );
}
