import { Item } from "@/models/item";

export type ItemsData = Record<string, Item>;

import itemsJson from "@/data/items.json";
export const itemsStatic = itemsJson as Item[];

let cachedItems: Item[] | null = null;

export async function getItems(forceReload = false): Promise<Item[]> {
  if (cachedItems && !forceReload) {
    return cachedItems;
  }

  cachedItems = itemsStatic;
  return cachedItems;
}

// ============================================
// FUNÇÕES HELPER
// ============================================

export function getItemByName(name: string, items: Item[]): Item | undefined {
  return items.find((item) => item.name.toLowerCase() === name.toLowerCase());
}

export function getItemsByRank(rank: string, items: Item[]): Item[] {
  return items.filter((item) => item.rank.includes(rank.toUpperCase()));
}

export function getItemsByGamemode(gamemode: string, items: Item[]): Item[] {
  return items.filter((item) =>
    item.gamemodes.includes(gamemode.toUpperCase()),
  );
}

export function getItemsByChampClass(
  champClass: string,
  items: Item[],
): Item[] {
  return items.filter((item) =>
    item.shop.tags.includes(champClass.toUpperCase()),
  );
}

export function getItemsByChampSpecific(
  items: Item[],
  champSpecific: boolean = true,
): Item[] {
  if (champSpecific) {
    return items.filter((item) => item.requiredChampion);
  }

  return items.filter((item) => !item.requiredChampion);
}

export function getPurchasableItems(
  items: Item[],
  isPurchasable: boolean = true,
): Item[] {
  return items.filter((item) => item.shop.purchasable === isPurchasable);
}

export function searchItemsByNickname(items: ItemsData, query: string): Item[] {
  const lowerQuery = query.toLowerCase();
  return Object.values(items).filter(
    (item) =>
      item.nicknames.some((nick) => nick.toLowerCase().includes(lowerQuery)) ||
      item.name.toLowerCase().includes(lowerQuery),
  );
}
