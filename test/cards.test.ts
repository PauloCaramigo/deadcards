import { describe, expect, it } from "vitest";
import { activeRoster, cardVersions, isRosterCard } from "../src/lib/cards";
import type { Player } from "../src/lib/types";

const card = (id: string, teamId: string, extra: Partial<Player> = {}) =>
  ({ id, teamId, name: id, position: "Flex", hero: "Abrams", stats: {}, c1: "#000", c2: "#000", history: [], ...extra }) as Player;

describe("Elenco do time", () => {
  it("tira versão do mesmo time e mantém versão em outro time", () => {
    const players = [
      card("main", "bra"),
      card("special", "bra", { variantOf: "main" }),
      card("club", "lev"),
      card("national", "bra", { variantOf: "club" }),
      card("old", "bra", { inactive: true }),
    ];
    expect(activeRoster(players, "bra").map((p) => p.id)).toEqual(["main", "national"]);
    expect(activeRoster(players, "lev").map((p) => p.id)).toEqual(["club"]);
  });

  it("isRosterCard separa versões do mesmo time, inativas e principais", () => {
    const players = [
      card("main", "bra"),
      card("special", "bra", { variantOf: "main" }),
      card("club", "lev"),
      card("national", "bra", { variantOf: "club" }),
      card("old", "bra", { inactive: true }),
    ];
    const roster = (id: string) => isRosterCard(players, players.find((p) => p.id === id)!);
    expect(roster("main")).toBe(true);
    expect(roster("special")).toBe(false);
    expect(roster("national")).toBe(true);
    expect(roster("old")).toBe(false);
  });
});

describe("cardVersions", () => {
  const players = [
    card("sp", "bra", { variantOf: "main" }),
    card("main", "bra"),
    card("other", "lev"),
    card("otherVersion", "lev", { variantOf: "other" }),
  ];
  const ids = (id: string) => cardVersions(players, players.find((p) => p.id === id)!).map((p) => p.id);

  it("põe a principal primeiro e não mistura outro jogador", () => {
    expect(ids("main")).toEqual(["main", "sp"]);
  });

  it("chamada por uma versão devolve o mesmo grupo", () => {
    expect(ids("sp")).toEqual(["main", "sp"]);
  });
});
