import type { UniqueIdentifier } from "@dnd-kit/core";

const SHOP_ITEM_PREFIX = "shop-item:";

export const getShopItemDraggableId = (itemId: number) =>
  `${SHOP_ITEM_PREFIX}${itemId}`;

export const parseShopItemId = (id: UniqueIdentifier): number | null => {
  if (typeof id !== "string") return null;
  if (!id.startsWith(SHOP_ITEM_PREFIX)) return null;

  const value = Number(id.slice(SHOP_ITEM_PREFIX.length));
  return Number.isFinite(value) ? value : null;
};
