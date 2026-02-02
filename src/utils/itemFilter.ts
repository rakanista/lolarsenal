import {
  getItemsByChampClass,
  getItemsByChampSpecific,
  getItemsByGamemode,
  getPurchasableItems,
} from "@/hooks/itemsLoader";

import { Stat } from "@/models/common";
import type { Item, Stats } from "@/models/item";

export type StatsFilterKey = keyof Stats | "ONHIT_EFFECTS";

export interface ItemFilters {
  gamemode: string;
  selectedTags: Set<string>;
  selectedStats: Set<StatsFilterKey>;
  champClass: string;
  champSpecific?: boolean;
  isPurchasable?: boolean;
}

export function manageItemFilters(filters: ItemFilters, items: Item[]): Item[] {
  const itemsGamemode = getItemsByGamemode(filters.gamemode, items);

  const itemsTagsFiltered = manageTagFilter(filters, itemsGamemode);
  const itemsStatsFiltered = manageStatFilter(filters, itemsTagsFiltered);

  const hasToFilterChampClass = filters.champClass != "ALL";

  const itemsByChampClass = hasToFilterChampClass
    ? getItemsByChampClass(filters.champClass, itemsStatsFiltered)
    : itemsStatsFiltered;

  const itemsByChampSpecific = filters.champSpecific
    ? getItemsByChampSpecific(itemsByChampClass)
    : getItemsByChampSpecific(itemsByChampClass, false);

  const itemsPurchasable = filters.isPurchasable
    ? getPurchasableItems(itemsByChampSpecific)
    : getPurchasableItems(itemsByChampSpecific, false);

  return itemsPurchasable;
}

function manageTagFilter(filters: ItemFilters, items: Item[]): Item[] {
  const selectedTags = Array.from(filters.selectedTags);

  if (selectedTags.length === 0) return items;

  return items.filter(
    (item) =>
      item.shop.tags.includes("ALL_ROLES") ||
      selectedTags.every((tag) => item.shop.tags.includes(tag)),
  );
}

function manageStatFilter(filters: ItemFilters, items: Item[]): Item[] {
  const selectedStats = Array.from(filters.selectedStats);

  if (selectedStats.length === 0) return items;

  return items.filter((item) => {
    return selectedStats.every((statName) => {
      // Comentário (PT): filtro especial via tag da shop
      if (statName === "ONHIT_EFFECTS") {
        return item.shop.tags.includes("ONHIT_EFFECTS");
      }

      const statKey = statName as keyof Stats;

      // Comentário (PT): movespeed considera stat > 0 OU tag MOVESPEED
      if (statKey === "movespeed") {
        return (
          hasStatValue(item.stats.movespeed) ||
          item.shop.tags.includes("MOVESPEED")
        );
      }

      if (statKey === "armorPenetration") {
        return (
          hasStatValue(item.stats.armorPenetration) ||
          hasStatValue(item.stats.lethality)
        );
      }

      if (statKey === "mana") {
        return (
          hasStatValue(item.stats.mana) || hasStatValue(item.stats.manaRegen)
        );
      }

      if (statKey === "health") {
        return (
          hasStatValue(item.stats.health) ||
          hasStatValue(item.stats.healthRegen)
        );
      }

      if (statKey === "lifesteal") {
        return (
          hasStatValue(item.stats.lifesteal) ||
          hasStatValue(item.stats.omnivamp)
        );
      }

      const stat = item.stats[statKey];
      return hasStatValue(stat);
    });
  });
}

function hasStatValue(stat: Stat | undefined): boolean {
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
