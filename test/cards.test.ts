import { describe, expect, it } from "vitest";
import { activeRoster } from "../src/lib/cards";
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
});
