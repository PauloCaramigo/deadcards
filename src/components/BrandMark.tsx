/** Marca do Cardslock: a roda dourada da porta da intro, em versão pequena. Usa a cor do texto (currentColor). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} fill="none" stroke="currentColor" strokeLinecap="round" aria-hidden="true">
      <circle r="45" strokeWidth="6" />
      <circle r="28" strokeWidth="5" />
      <path strokeWidth="4.5" d="M0 -11V-45M0 11V45M-11 0H-45M11 0H45M7.8 -7.8L31.8 -31.8M-7.8 -7.8L-31.8 -31.8M7.8 7.8L31.8 31.8M-7.8 7.8L-31.8 31.8" />
      <circle r="11" strokeWidth="5" />
      <circle r="4" fill="currentColor" stroke="none" />
    </svg>
  );
}
