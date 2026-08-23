export function BadgeModulo({ titulo, corHex }: { titulo: string; corHex: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
      style={{ backgroundColor: corHex }}
    >
      {titulo}
    </span>
  );
}
