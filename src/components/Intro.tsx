import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { strings, useT } from "../lib/i18n";

/** Destinos que as cartas da intro abrem. O App decide o que cada um faz (aba, perfil, login). */
export type IntroTarget = "home" | "teams" | "tierlist" | "collection" | "compare" | "redeem" | "profile" | "settings";

const TARGETS: IntroTarget[] = ["home", "teams", "tierlist", "collection", "compare", "redeem", "profile", "settings"];

type Card = { name: string; desc: string };

// Nomes com mais de 8 letras levam hífen opcional (­) para quebrar em duas linhas na carta.
const S = strings({
  pt: {
    dialog: "Entrada do Cardslock",
    plate: "Dealer",
    tagline: "Cartas da comunidade de Deadlock",
    sketch: "Desenho do dealer de chapéu sentado à mesa, com os braços abertos sobre ela",
    pick: "Escolha uma carta",
    skip: "Pular intro",
    replay: "Rever intro",
    close: "Fechar e ir para o início",
    menu: "Menu do site",
    cards: {
      home: { name: "Página inicial", desc: "Novidades e destaques" },
      teams: { name: "Times", desc: "Os times e seus jogadores" },
      tierlist: { name: "Tier List", desc: "Ranking das cartas" },
      collection: { name: "Coleção", desc: "Todas as cartas, com filtros" },
      compare: { name: "Comparar", desc: "Duas cartas lado a lado" },
      redeem: { name: "Resgatar", desc: "Use um código e ganhe cartas" },
      profile: { name: "Perfil", desc: "Sua carta e suas conquistas" },
      settings: { name: "Configu­rações", desc: "Conta e contas vinculadas" },
    } satisfies Record<IntroTarget, Card>,
  },
  en: {
    dialog: "Cardslock entrance",
    plate: "Dealer",
    tagline: "Deadlock community cards",
    sketch: "Drawing of the dealer in a hat sitting at the table, arms spread across it",
    pick: "Pick a card",
    skip: "Skip intro",
    replay: "Replay intro",
    close: "Close and go to home",
    menu: "Site menu",
    cards: {
      home: { name: "Home", desc: "News and highlights" },
      teams: { name: "Teams", desc: "The teams and their players" },
      tierlist: { name: "Tier List", desc: "Card ranking" },
      collection: { name: "Collec­tion", desc: "Every card, with filters" },
      compare: { name: "Compare", desc: "Two cards side by side" },
      redeem: { name: "Redeem", desc: "Use a code to get cards" },
      profile: { name: "Profile", desc: "Your card and achievements" },
      settings: { name: "Settings", desc: "Account and linked accounts" },
    },
  },
  es: {
    dialog: "Entrada de Cardslock",
    plate: "Dealer",
    tagline: "Cartas de la comunidad de Deadlock",
    sketch: "Dibujo del dealer con sombrero sentado a la mesa, con los brazos abiertos sobre ella",
    pick: "Elige una carta",
    skip: "Saltar intro",
    replay: "Ver intro de nuevo",
    close: "Cerrar e ir al inicio",
    menu: "Menú del sitio",
    cards: {
      home: { name: "Inicio", desc: "Novedades y destacados" },
      teams: { name: "Equipos", desc: "Los equipos y sus jugadores" },
      tierlist: { name: "Tier List", desc: "Ranking de las cartas" },
      collection: { name: "Colec­ción", desc: "Todas las cartas, con filtros" },
      compare: { name: "Comparar", desc: "Dos cartas lado a lado" },
      redeem: { name: "Canjear", desc: "Usa un código y gana cartas" },
      profile: { name: "Perfil", desc: "Tu carta y tus logros" },
      settings: { name: "Configu­ración", desc: "Cuenta y cuentas vinculadas" },
    },
  },
});

const ICONS: Record<IntroTarget, ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /><path d="M10 20v-6h4v6" /></>,
  teams: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.6-3.4 3-5 6-5s5.4 1.6 6 5" /><path d="M15.5 14.2c2.6-.3 4.8 1.2 5.5 4.3" /></>,
  tierlist: <><path d="M3 21v-6h5v6" /><path d="M9.5 21V9h5v12" /><path d="M16 21V3h5v18" /><path d="M2 21h20" /></>,
  collection: <><rect x="6.5" y="4" width="11" height="15" rx="1.5" transform="rotate(10 12 11.5)" /><rect x="6.5" y="5" width="11" height="15" rx="1.5" transform="rotate(-10 12 12.5)" /></>,
  compare: <><rect x="2.5" y="5" width="7.5" height="12" rx="1" /><rect x="14" y="5" width="7.5" height="12" rx="1" /><path d="m11 9.5 2 1.5-2 1.5" /><path d="M8 20.5h8" /></>,
  redeem: <><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M3 9h18V6.5H3z" /><path d="M12 6.5V20" /><path d="M12 6.5C9.5 3 6.5 4.5 8.2 6.5M12 6.5c2.5-3.5 5.5-2 3.8 0" /></>,
  profile: <><path d="M8.5 9.5 9.5 5h5l1 4.5" /><path d="M4 10.5c5 2.2 11 2.2 16 0" /><path d="M9 13.5V15c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5v-1.5" /><path d="M5 21.5c.6-2.6 3.2-4 7-4s6.4 1.4 7 4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="6.5" /><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M4.9 4.9l2.5 2.5M16.6 16.6l2.5 2.5M19.1 4.9l-2.5 2.5M7.4 16.6l-2.5 2.5" /></>,
};

/** Fases da coreografia, em ordem; cada uma liga uma classe no .intro (ver src/styles/intro.css). */
const Phase = { Closed: 0, Unlock: 1, Open: 2, Lit: 3, Deck: 4, Dealt: 5, Ready: 6 } as const;
type Phase = (typeof Phase)[keyof typeof Phase];

/** [fase, espera em ms antes de entrar nela]. A fase Dealt termina sozinha quando as cartas acabam de virar. */
const SCRIPT: [Phase, number][] = [
  [Phase.Unlock, 500],
  [Phase.Open, 1100],
  [Phase.Lit, 1500],
  [Phase.Deck, 800],
  [Phase.Dealt, 1300],
];

const cx = (...c: (string | false)[]) => c.filter(Boolean).join(" ");
const prefersReduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Roda dourada da porta: desenhada inteira nas duas folhas, cada folha mostra a sua metade. */
function Wheel({ id }: { id: string }) {
  return (
    <g id={id} fill="none" stroke="#d8a640" strokeLinecap="round">
      <circle r="48.6" strokeWidth=".35" strokeDasharray=".5 3.55" opacity=".7" />
      <circle r="45" strokeWidth=".8" />
      <circle r="43.8" strokeWidth=".2" opacity=".6" />
      <circle r="29" strokeWidth="1" />
      <path strokeWidth=".7" d="M0 -9V-45M0 9V45M-9 0H-45M9 0H45M6.36 -6.36L31.82 -31.82M-6.36 -6.36L-31.82 -31.82M6.36 6.36L31.82 31.82M-6.36 6.36L-31.82 31.82" />
      <circle r="9" fill="#0d0e12" strokeWidth=".9" />
      <circle r="5" strokeWidth=".6" />
      <circle r="1.6" fill="#d8a640" stroke="none" />
    </g>
  );
}

export function Intro({ onPick, onClose }: { onPick: (target: IntroTarget) => void; onClose: () => void }) {
  const t = useT(S);
  const wheelId = `intro-wheel-${useId().replace(/[^\w-]/g, "")}`;
  const [phase, setPhase] = useState<Phase>(() => (prefersReduced() ? Phase.Ready : Phase.Closed));
  const [run, setRun] = useState(0);
  const [instant, setInstant] = useState(false);
  const [hover, setHover] = useState<IntroTarget | null>(null);
  const [chosen, setChosen] = useState<IntroTarget | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const skipRef = useRef<HTMLButtonElement>(null);
  const pickTimer = useRef<number>(undefined);

  // Linha do tempo: agenda as fases até a distribuição das cartas.
  useEffect(() => {
    if (prefersReduced()) return;
    const timers: number[] = [];
    let at = 0;
    for (const [p, wait] of SCRIPT) {
      at += wait;
      timers.push(window.setTimeout(() => setPhase((cur) => (cur < p ? p : cur)), at));
    }
    return () => timers.forEach(clearTimeout);
  }, [run]);

  // Pular / Rever trocam de estado sem transição; ela volta dois quadros depois.
  useEffect(() => {
    if (!instant) return;
    let id = requestAnimationFrame(() => { id = requestAnimationFrame(() => setInstant(false)); });
    return () => cancelAnimationFrame(id);
  }, [instant]);

  // Distribuição: cada carta sai do deck com o verso para cima, vai para o leque e vira.
  // Em layout effect para a animação começar antes do primeiro quadro com as cartas visíveis.
  useLayoutEffect(() => {
    if (phase !== Phase.Dealt) return;
    const deck = deckRef.current?.getBoundingClientRect();
    if (!deck) return;
    const ox = deck.left + deck.width / 2;
    const oy = deck.top + deck.height / 2;
    const anims: Animation[] = [];
    cardRefs.current.forEach((card, i) => {
      if (!card) return;
      const cs = getComputedStyle(card);
      const r = card.getBoundingClientRect();
      anims.push(card.animate(
        [
          { translate: `${ox - (r.left + r.width / 2)}px ${oy - (r.top + r.height / 2)}px`, rotate: "0deg", scale: "0.88", opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { translate: cs.translate, rotate: cs.rotate, scale: cs.scale === "none" ? "1" : cs.scale, opacity: 1 },
        ],
        { duration: 950, delay: i * 90, easing: "cubic-bezier(.2,.9,.25,1)", fill: "backwards" },
      ));
      const faces = card.querySelector<HTMLElement>(".intro-faces");
      if (faces) {
        anims.push(faces.animate(
          [{ transform: "rotateY(180deg)" }, { transform: "rotateY(0deg)" }],
          { duration: 650, delay: i * 90 + 750, easing: "cubic-bezier(.45,0,.2,1)", fill: "backwards" },
        ));
      }
    });
    let live = true;
    void Promise.all(anims.map((a) => a.finished)).then(() => { if (live) setPhase(Phase.Ready); }, () => {});
    return () => { live = false; anims.forEach((a) => a.cancel()); };
  }, [phase]);

  // Esc fecha. O ref evita reinscrever o listener a cada render do App.
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  // Enquanto a intro está aberta: foco no primeiro controle e sem rolagem no site por trás.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, []);

  useEffect(() => () => window.clearTimeout(pickTimer.current), []);

  const ready = phase === Phase.Ready;
  const skip = () => { setInstant(true); setPhase(Phase.Ready); };
  const replay = () => {
    setInstant(true);
    setHover(null);
    setChosen(null);
    if (prefersReduced()) return;
    setPhase(Phase.Closed);
    setRun((r) => r + 1);
  };
  const pick = (target: IntroTarget) => {
    if (!ready || chosen) return;
    setChosen(target);
    pickTimer.current = window.setTimeout(() => onPick(target), 220);
  };

  const caption = hover ? `${t.cards[hover].name.replace(/­/g, "")} · ${t.cards[hover].desc}` : t.pick;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.dialog}
      className={cx(
        "intro",
        phase >= Phase.Unlock && "is-unlock",
        phase >= Phase.Open && "is-open",
        phase >= Phase.Lit && "is-lit",
        phase >= Phase.Deck && "is-deck",
        phase >= Phase.Deck && "is-gone",
        phase >= Phase.Dealt && "is-dealt",
        ready && "is-ready",
        instant && "is-instant",
      )}
    >
      <div className="intro-stage">
        <img className="intro-sketch" src="/intro/sketch.png" alt={t.sketch} width={1232} height={762} />

        <header className="intro-brand">
          <h1 className="intro-title">Cards<span className="intro-title-accent">lock</span></h1>
          <p className="intro-tagline">{t.tagline}</p>
        </header>

        <nav className="intro-cards" aria-label={t.menu}>
          <div className="intro-pool" aria-hidden="true" />
          <div ref={deckRef} className="intro-deck" aria-hidden="true">
            <i className="intro-back" />
            <i className="intro-back" />
            <i className="intro-back" />
          </div>
          {TARGETS.map((id, i) => (
            <button
              key={id}
              ref={(el) => { cardRefs.current[i] = el; }}
              type="button"
              tabIndex={ready ? 0 : -1}
              aria-label={`${t.cards[id].name.replace(/­/g, "")}: ${t.cards[id].desc}`}
              className={cx("intro-card", chosen === id && "is-chosen", !!chosen && chosen !== id && "is-dim")}
              style={{ "--o": i - (TARGETS.length - 1) / 2 } as CSSProperties}
              onClick={() => pick(id)}
              onMouseEnter={() => ready && setHover(id)}
              onFocus={() => ready && setHover(id)}
              onMouseLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
            >
              <span className="intro-faces">
                <span className="intro-rev" />
                <span className="intro-front">
                  <span className="intro-art">
                    <svg viewBox="0 0 24 24" aria-hidden="true">{ICONS[id]}</svg>
                  </span>
                  <span className="intro-rule" />
                  <span className="intro-name">{t.cards[id].name}</span>
                </span>
              </span>
            </button>
          ))}
        </nav>

        <p className={cx("intro-caption", !!hover && "is-hot")} aria-live="polite">{caption}</p>
      </div>

      <div className="intro-door" aria-hidden="true">
        <div className="intro-glow" />
        <div className="intro-leaf is-left">
          <svg className="intro-wheel" viewBox="-50 -50 100 100"><Wheel id={wheelId} /></svg>
        </div>
        <div className="intro-leaf is-right">
          <svg className="intro-wheel" viewBox="-50 -50 100 100"><use href={`#${wheelId}`} /></svg>
        </div>
        <div className="intro-plate">{t.plate}</div>
      </div>

      <div className="intro-controls">
        <button ref={skipRef} type="button" className="intro-btn" onClick={ready ? replay : skip}>
          {ready ? t.replay : t.skip}
        </button>
        <button type="button" className="intro-btn" onClick={onClose} aria-label={t.close} title={t.close}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
    </div>
  );
}
