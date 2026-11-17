import { strings, useT } from "../lib/i18n";
import { MENU, MENU_ICONS, MENU_TARGETS, plainName, type MenuTarget } from "../lib/menu";

const S = strings({
  pt: { nav: "Navegação principal", intro: "Voltar ao dealer" },
  en: { nav: "Main navigation", intro: "Back to the dealer" },
  es: { nav: "Navegación principal", intro: "Volver al dealer" },
});

/**
 * Menu lateral: uma coluna de cartas meio escondidas na borda esquerda.
 * Cada carta mostra só a faixa da direita, com o ícone no canto (como o índice de uma carta de baralho);
 * no hover ou no foco ela sai inteira e mostra o nome. O deck no topo volta para a intro.
 * O botão é uma faixa fixa por carta (área de clique); o desenho (.rail-visual) desliza por cima sem
 * roubar o mouse, então dá para descer de uma carta para a próxima sem pular nenhuma.
 * Visual em src/styles/rail.css.
 */
export function Rail({ active, admin, onPick, onIntro }: { active: string; admin: boolean; onPick: (target: MenuTarget) => void; onIntro: () => void }) {
  const t = useT(S);
  const m = useT(MENU);
  const items: MenuTarget[] = admin ? [...MENU_TARGETS, "editor"] : MENU_TARGETS;

  return (
    <nav className="rail" aria-label={t.nav}>
      <div className="rail-slot">
        <button type="button" className="rail-card rail-deck" onClick={onIntro} aria-label={t.intro}>
          <span className="rail-visual">
            <span className="rail-back" />
            <span className="rail-back" />
            <span className="rail-back" />
          </span>
          <span className="rail-tip" aria-hidden="true">{t.intro}</span>
        </button>
      </div>
      {items.map((id) => (
        <div key={id} className="rail-slot">
          <button
            type="button"
            className="rail-card"
            aria-current={active === id ? "page" : undefined}
            aria-label={plainName(m[id].name)}
            onClick={() => onPick(id)}
          >
            <span className="rail-visual">
              <span className="rail-front">
                <svg className="rail-index" viewBox="0 0 24 24" aria-hidden="true">{MENU_ICONS[id]}</svg>
                <svg className="rail-art" viewBox="0 0 24 24" aria-hidden="true">{MENU_ICONS[id]}</svg>
                <span className="rail-name">{m[id].name}</span>
              </span>
            </span>
            <span className="rail-tip" aria-hidden="true">{m[id].desc}</span>
          </button>
        </div>
      ))}
    </nav>
  );
}
