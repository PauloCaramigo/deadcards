import type { ReactNode } from "react";
import { strings } from "./i18n";

/** Destinos do menu de cartas (intro e menu lateral). O App decide o que cada um faz (aba, perfil, login). */
export type MenuTarget = "home" | "teams" | "tierlist" | "collection" | "compare" | "redeem" | "profile" | "settings" | "editor";

/** Ordem das cartas. O Editor só entra no menu lateral, para admins. */
export const MENU_TARGETS: Exclude<MenuTarget, "editor">[] = ["home", "teams", "tierlist", "collection", "compare", "redeem", "profile", "settings"];

type Entry = { name: string; desc: string };

// Nomes com mais de 8 letras levam hífen opcional (­) para quebrar em duas linhas na carta.
export const MENU = strings({
  pt: {
    home: { name: "Página inicial", desc: "Novidades e destaques" },
    teams: { name: "Times", desc: "Os times e seus jogadores" },
    tierlist: { name: "Tier List", desc: "Ranking das cartas" },
    collection: { name: "Coleção", desc: "Todas as cartas, com filtros" },
    compare: { name: "Comparar", desc: "Duas cartas lado a lado" },
    redeem: { name: "Resgatar", desc: "Use um código e ganhe cartas" },
    profile: { name: "Perfil", desc: "Sua carta e suas conquistas" },
    settings: { name: "Configu­rações", desc: "Conta e contas vinculadas" },
    editor: { name: "Editor", desc: "Editar cartas e times" },
  } satisfies Record<MenuTarget, Entry>,
  en: {
    home: { name: "Home", desc: "News and highlights" },
    teams: { name: "Teams", desc: "The teams and their players" },
    tierlist: { name: "Tier List", desc: "Card ranking" },
    collection: { name: "Collec­tion", desc: "Every card, with filters" },
    compare: { name: "Compare", desc: "Two cards side by side" },
    redeem: { name: "Redeem", desc: "Use a code to get cards" },
    profile: { name: "Profile", desc: "Your card and achievements" },
    settings: { name: "Settings", desc: "Account and linked accounts" },
    editor: { name: "Editor", desc: "Edit cards and teams" },
  },
  es: {
    home: { name: "Inicio", desc: "Novedades y destacados" },
    teams: { name: "Equipos", desc: "Los equipos y sus jugadores" },
    tierlist: { name: "Tier List", desc: "Ranking de las cartas" },
    collection: { name: "Colec­ción", desc: "Todas las cartas, con filtros" },
    compare: { name: "Comparar", desc: "Dos cartas lado a lado" },
    redeem: { name: "Canjear", desc: "Usa un código y gana cartas" },
    profile: { name: "Perfil", desc: "Tu carta y tus logros" },
    settings: { name: "Configu­ración", desc: "Cuenta y cuentas vinculadas" },
    editor: { name: "Editor", desc: "Editar cartas y equipos" },
  },
});

/** Nome sem o hífen opcional, para legendas e rótulos de acessibilidade. */
export const plainName = (name: string) => name.replace(/­/g, "");

/** Ícones das cartas (SVG 24×24, traço). */
export const MENU_ICONS: Record<MenuTarget, ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5" /><path d="M5.5 10v10h13V10" /><path d="M10 20v-6h4v6" /></>,
  teams: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20c.6-3.4 3-5 6-5s5.4 1.6 6 5" /><path d="M15.5 14.2c2.6-.3 4.8 1.2 5.5 4.3" /></>,
  tierlist: <><path d="M3 21v-6h5v6" /><path d="M9.5 21V9h5v12" /><path d="M16 21V3h5v18" /><path d="M2 21h20" /></>,
  collection: <><rect x="6.5" y="4" width="11" height="15" rx="1.5" transform="rotate(10 12 11.5)" /><rect x="6.5" y="5" width="11" height="15" rx="1.5" transform="rotate(-10 12 12.5)" /></>,
  compare: <><rect x="2.5" y="5" width="7.5" height="12" rx="1" /><rect x="14" y="5" width="7.5" height="12" rx="1" /><path d="m11 9.5 2 1.5-2 1.5" /><path d="M8 20.5h8" /></>,
  redeem: <><rect x="4" y="9" width="16" height="11" rx="1" /><path d="M3 9h18V6.5H3z" /><path d="M12 6.5V20" /><path d="M12 6.5C9.5 3 6.5 4.5 8.2 6.5M12 6.5c2.5-3.5 5.5-2 3.8 0" /></>,
  profile: <><path d="M8.5 9.5 9.5 5h5l1 4.5" /><path d="M4 10.5c5 2.2 11 2.2 16 0" /><path d="M9 13.5V15c0 1.5 1.3 2.5 3 2.5s3-1 3-2.5v-1.5" /><path d="M5 21.5c.6-2.6 3.2-4 7-4s6.4 1.4 7 4" /></>,
  settings: <><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="6.5" /><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22M4.9 4.9l2.5 2.5M16.6 16.6l2.5 2.5M19.1 4.9l-2.5 2.5M7.4 16.6l-2.5 2.5" /></>,
  editor: <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="m13.5 6.5 4 4" /></>,
};
