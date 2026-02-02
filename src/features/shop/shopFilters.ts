import { Stat } from "@/models/common";
import { StatsFilterKey } from "@/utils/itemFilter";
import { getBaseUrl } from "../../utils";

export const SHOP_FILTERS_STORAGE_KEY_V1 = "shopFilters.v1";
export const SHOP_FILTERS_STORAGE_KEY = "shopFilters.v2";

export type ShopFiltersStorageV1 = {
  version: 1;
  activeGamemode: string;
  byGamemode: Record<
    string,
    {
      selectedTags: string[];
      selectedStats: StatsFilterKey[];
    }
  >;
};

export type ShopFiltersStorageV2 = {
  version: 2;
  activeGamemode: string;
  selectedTags: string[];
  selectedStats: StatsFilterKey[];
};

function isValidV2(payload: unknown): payload is ShopFiltersStorageV2 {
  const p = payload as Partial<ShopFiltersStorageV2> | null;
  if (!p) return false;

  return (
    p.version === 2 &&
    typeof p.activeGamemode === "string" &&
    Array.isArray(p.selectedTags) &&
    Array.isArray(p.selectedStats)
  );
}

function isValidV1(payload: unknown): payload is ShopFiltersStorageV1 {
  const p = payload as Partial<ShopFiltersStorageV1> | null;
  if (!p) return false;

  return (
    p.version === 1 &&
    typeof p.activeGamemode === "string" &&
    typeof p.byGamemode === "object" &&
    p.byGamemode !== null
  );
}

export function readShopFiltersFromStorage(): ShopFiltersStorageV2 | null {
  try {
    // Comentário (PT): tenta primeiro o formato novo (filtros universais)
    const rawV2 = localStorage.getItem(SHOP_FILTERS_STORAGE_KEY);
    if (rawV2) {
      const parsedV2 = JSON.parse(rawV2) as unknown;
      if (isValidV2(parsedV2)) return parsedV2;
    }

    // Comentário (PT): fallback/migração do formato antigo (por gamemode)
    const rawV1 = localStorage.getItem(SHOP_FILTERS_STORAGE_KEY_V1);
    if (!rawV1) return null;

    const parsedV1 = JSON.parse(rawV1) as unknown;
    if (!isValidV1(parsedV1)) return null;

    const gamemode = parsedV1.activeGamemode;
    const saved = parsedV1.byGamemode?.[gamemode];

    return {
      version: 2,
      activeGamemode: gamemode,
      selectedTags: saved?.selectedTags ?? [],
      selectedStats: saved?.selectedStats ?? [],
    };
  } catch {
    return null;
  }
}

export function writeShopFiltersToStorage(payload: ShopFiltersStorageV2) {
  try {
    localStorage.setItem(SHOP_FILTERS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Comentário (PT): se der erro de storage (quota, modo privado...), apenas ignora.
  }
}

export function hasStatValue(stat: Stat | undefined): boolean {
  if (!stat) return false;

  return (
    stat.flat > 0 ||
    stat.percent > 0 ||
    stat.perLevel > 0 ||
    stat.percentPerLevel > 0 ||
    stat.percentBase > 0 ||
    stat.percentBonus > 0
  );
}

export function buildTagIconSrc(tag: string): string {
  return `${getBaseUrl()}shop-assets/roles/${encodeURIComponent(tag.toLowerCase())}.png`;
}

export function buildStatIconSrc(statKey: StatsFilterKey): string {
  return `${getBaseUrl()}shop-assets/stats/${encodeURIComponent(String(statKey).toLowerCase())}.png`;
}
