import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { strings, useT } from "../lib/i18n";
import { MENU, MENU_ICONS, MENU_TARGETS, plainName, type MenuTarget } from "../lib/menu";

const S = strings({
  pt: {
    dialog: "Entrada do Cardslock",
    plate: "Dealer",
    tagline: "Cartas da comunidade de Deadlock",
    sketch: "Desenho do dealer de chapéu sentado à mesa, com os braços abertos sobre ela",
    pick: "Escolha uma carta",
    skip: "Pular intro",
    replay: "Rever intro",
    close: "Fechar",
    menu: "Menu do site",
  },
  en: {
    dialog: "Cardslock entrance",
    plate: "Dealer",
    tagline: "Deadlock community cards",
    sketch: "Drawing of the dealer in a hat sitting at the table, arms spread across it",
    pick: "Pick a card",
    skip: "Skip intro",
    replay: "Replay intro",
    close: "Close",
    menu: "Site menu",
  },
  es: {
    dialog: "Entrada de Cardslock",
    plate: "Dealer",
    tagline: "Cartas de la comunidad de Deadlock",
    sketch: "Dibujo del dealer con sombrero sentado a la mesa, con los brazos abiertos sobre ella",
    pick: "Elige una carta",
    skip: "Saltar intro",
    replay: "Ver intro de nuevo",
    close: "Cerrar",
    menu: "Menú del sitio",
  },
});

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

/** Saída ao escolher uma carta: ela cresce até cobrir a tela e a intro some revelando a tela escolhida. */
const ZOOM_MS = 750;   // duração do zoom da carta
const SWAP_MS = 300;   // quando a tela escolhida é montada por baixo da intro
const DONE_MS = 850;   // quando a intro sai da página (o fade no CSS acaba em 0,35 s + 0,45 s)

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

/** Frente da carta da intro (também usada na carta que dá o zoom). */
function Front({ id, name }: { id: MenuTarget; name: string }) {
  return (
    <span className="intro-front">
      <span className="intro-art">
        <svg viewBox="0 0 24 24" aria-hidden="true">{MENU_ICONS[id]}</svg>
      </span>
      <span className="intro-rule" />
      <span className="intro-name">{name}</span>
    </span>
  );
}

type Zoom = { id: MenuTarget; x: number; y: number; w: number; h: number; rotate: string };

/**
 * Intro do site. `start="full"` toca a porta e a distribuição; `start="menu"` abre direto nas cartas
 * (quando a pessoa volta para a intro pelo menu lateral).
 * `onPick` troca a tela por baixo durante a saída; `onClose` tira a intro da página.
 */
export function Intro({ start = "full", onPick, onClose }: { start?: "full" | "menu"; onPick: (target: MenuTarget) => void; onClose: () => void }) {
  const t = useT(S);
  const m = useT(MENU);
  const wheelId = `intro-wheel-${useId().replace(/[^\w-]/g, "")}`;
  const [phase, setPhase] = useState<Phase>(() => (start === "menu" || prefersReduced() ? Phase.Ready : Phase.Closed));
  const [run, setRun] = useState(0);
  const [instant, setInstant] = useState(false);
  const [hover, setHover] = useState<MenuTarget | null>(null);
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const zoomRef = useRef<HTMLDivElement>(null);
  const skipRef = useRef<HTMLButtonElement>(null);

  // Linha do tempo: agenda as fases até a distribuição das cartas.
  useEffect(() => {
    if (prefersReduced() || (run === 0 && start === "menu")) return;
    const timers: number[] = [];
    let at = 0;
    for (const [p, wait] of SCRIPT) {
      at += wait;
      timers.push(window.setTimeout(() => setPhase((cur) => (cur < p ? p : cur)), at));
    }
    return () => timers.forEach(clearTimeout);
  }, [run, start]);

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

  // Os callbacks do App mudam a cada render; os refs evitam reinscrever listeners e timers.
  const pickRef = useRef(onPick);
  const closeRef = useRef(onClose);
  useEffect(() => { pickRef.current = onPick; closeRef.current = onClose; }, [onPick, onClose]);

  // Saída: a carta escolhida vai para o centro e cresce até cobrir a tela; a tela escolhida
  // é montada por baixo e a intro some (classe is-leaving no CSS).
  useLayoutEffect(() => {
    if (!zoom) return;
    const el = zoomRef.current;
    const scale = Math.max(innerWidth / zoom.w, innerHeight / zoom.h) * 1.15;
    const dx = innerWidth / 2 - (zoom.x + zoom.w / 2);
    const dy = innerHeight / 2 - (zoom.y + zoom.h / 2);
    const anim = el?.animate(
      [
        { translate: "0px 0px", rotate: zoom.rotate, scale: "1" },
        { translate: `${dx}px ${dy}px`, rotate: "0deg", scale: String(scale) },
      ],
      { duration: ZOOM_MS, easing: "cubic-bezier(.6,0,.35,1)", fill: "forwards" },
    );
    const swap = window.setTimeout(() => pickRef.current(zoom.id), SWAP_MS);
    const done = window.setTimeout(() => closeRef.current(), DONE_MS);
    return () => { anim?.cancel(); clearTimeout(swap); clearTimeout(done); };
  }, [zoom]);

  // Enquanto a intro está aberta: foco no primeiro controle, sem rolagem no site por trás e Esc fecha.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeRef.current(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", onKey); };
  }, []);

  const ready = phase === Phase.Ready;
  const skip = () => { setInstant(true); setPhase(Phase.Ready); };
  const replay = () => {
    setInstant(true);
    setHover(null);
    if (prefersReduced()) return;
    setPhase(Phase.Closed);
    setRun((r) => r + 1);
  };
  const pick = (id: MenuTarget, i: number) => {
    if (!ready || zoom) return;
    const card = cardRefs.current[i];
    if (!card || prefersReduced()) { onPick(id); onClose(); return; }
    // Medidas da carta como está na tela agora (já crescida pelo hover).
    const cs = getComputedStyle(card);
    const s = cs.scale === "none" ? 1 : parseFloat(cs.scale) || 1;
    const r = card.getBoundingClientRect();
    const w = card.offsetWidth * s;
    const h = card.offsetHeight * s;
    setZoom({ id, x: r.left + r.width / 2 - w / 2, y: r.top + r.height / 2 - h / 2, w, h, rotate: cs.rotate === "none" ? "0deg" : cs.rotate });
  };

  const caption = hover ? `${plainName(m[hover].name)} · ${m[hover].desc}` : t.pick;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.dialog}
      className={cx(
        "intro",
        start === "menu" && run === 0 && "is-menu",
        phase >= Phase.Unlock && "is-unlock",
        phase >= Phase.Open && "is-open",
        phase >= Phase.Lit && "is-lit",
        phase >= Phase.Deck && "is-deck",
        phase >= Phase.Deck && "is-gone",
        phase >= Phase.Dealt && "is-dealt",
        ready && "is-ready",
        instant && "is-instant",
        !!zoom && "is-leaving",
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
          {MENU_TARGETS.map((id, i) => (
            <button
              key={id}
              ref={(el) => { cardRefs.current[i] = el; }}
              type="button"
              tabIndex={ready ? 0 : -1}
              aria-label={`${plainName(m[id].name)}: ${m[id].desc}`}
              className={cx("intro-card", zoom?.id === id && "is-zooming", !!zoom && zoom.id !== id && "is-dim")}
              style={{ "--o": i - (MENU_TARGETS.length - 1) / 2 } as CSSProperties}
              onClick={() => pick(id, i)}
              onMouseEnter={() => ready && setHover(id)}
              onFocus={() => ready && setHover(id)}
              onMouseLeave={() => setHover(null)}
              onBlur={() => setHover(null)}
            >
              <span className="intro-faces">
                <span className="intro-rev" />
                <Front id={id} name={m[id].name} />
              </span>
            </button>
          ))}
        </nav>

        <p className={cx("intro-caption", !!hover && "is-hot")} aria-live="polite">{caption}</p>
      </div>

      {zoom && (
        <div
          ref={zoomRef}
          className="intro-zoom"
          aria-hidden="true"
          style={{ left: zoom.x, top: zoom.y, width: zoom.w, height: zoom.h, "--cw": `${zoom.w}px` } as CSSProperties}
        >
          <Front id={zoom.id} name={m[zoom.id].name} />
        </div>
      )}

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
