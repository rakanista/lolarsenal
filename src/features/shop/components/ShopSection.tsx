import { useMemo, type CSSProperties } from "react";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

import type { Item } from "@/models/item";

import { getShopItemDraggableId } from "@/features/shop/utils/shopDndIds";

type ShopItemCellProps = {
  item: Item;
  index: number;
  isHighlighted: boolean;

  onLeftClick: (item: Item) => void;
  onDoubleLeftClick?: (item: Item) => void;
  onRightClick?: (item: Item, index?: number) => void;
};

const ShopItemCell = ({
  item,
  index,
  isHighlighted,
  onLeftClick,
  onDoubleLeftClick,
  onRightClick,
}: ShopItemCellProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: getShopItemDraggableId(item.id),
      data: { kind: "SHOP_ITEM", itemId: item.id },
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0 : undefined,
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
  };

  if (isHighlighted) {
    return (
      <div data-item-id={item.id} className="relative p-[1px]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, #00e5ff, #00d4ff, #00b8e6, #00d4ff, #00e5ff)",
            animation: "rotate-border 1s linear infinite",
            backgroundSize: "200% 200%",
          }}
        />

        <div
          ref={setNodeRef}
          style={{
            ...style,
            boxShadow: "inset 0 -10px 15px -5px rgba(0, 212, 255, 0.6)",
          }}
          className="relative p-1 pt-[6px] cursor-pointer hover:bg-lol-hover bg-lol-bg-dark"
          onClick={() => onLeftClick(item)}
          onContextMenu={(e) => {
            e.preventDefault();
            onRightClick?.(item, index);
          }}
          onDoubleClick={() => onDoubleLeftClick?.(item)}
          {...attributes}
          {...listeners}
        >
          <img
            src={item.icon}
            alt={item.name}
            draggable={false}
            className="w-full h-full object-cover border-2 border-[#565656]"
          />
          {item.shop.prices.total > 0 && (
            <p className="text-[#fffae3] font-shop-item text-center text-base">
              {item.shop.prices.total}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-item-id={item.id}>
      <div
        ref={setNodeRef}
        style={style}
        className="p-1 pt-[6px] cursor-pointer hover:bg-lol-hover hover:border-lol-gold"
        onClick={() => onLeftClick(item)}
        onContextMenu={(e) => {
          e.preventDefault();
          onRightClick?.(item, index);
        }}
        onDoubleClick={() => onDoubleLeftClick?.(item)}
        {...attributes}
        {...listeners}
      >
        <img
          src={item.icon}
          alt={item.name}
          draggable={false}
          className="w-full h-full object-cover border-2 border-gray-600"
        />
        {item.shop.prices.total > 0 && (
          <p className="text-lol-gold font-shop-item text-center text-base">
            {item.shop.prices.total}
          </p>
        )}
      </div>
    </div>
  );
};

type ShopSectionProps = {
  section: string;
  items: Item[];

  onLeftClick: (item: Item) => void;
  onDoubleLeftClick?: (item: Item) => void;
  onRightClick?: (item: Item, index?: number) => void;

  orderByGold?: boolean;
  highlightedItemId?: number;
};

export const ShopSection = ({
  section,
  items,
  onLeftClick,
  onDoubleLeftClick,
  onRightClick,
  orderByGold = true,
  highlightedItemId,
}: ShopSectionProps) => {
  const visibleItems = useMemo(() => {
    const base = items.filter((item) => !item.removed && item.shop.purchasable);

    if (!orderByGold) return base;

    return [...base].sort((a, b) => a.shop.prices.total - b.shop.prices.total);
  }, [items, orderByGold]);

  if (visibleItems.length == 0) return null;

  return (
    <div className="mt-4">
      <h2 className="text-lol-white font-lol text-xl">{section}</h2>

      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(55px, 58px))" }}
      >
        {visibleItems.map((item, index) => {
          const isHighlighted = item.id === highlightedItemId;

          return (
            <ShopItemCell
              key={`${item.id}-${index}`}
              item={item}
              index={index}
              isHighlighted={isHighlighted}
              onLeftClick={onLeftClick}
              onDoubleLeftClick={onDoubleLeftClick}
              onRightClick={onRightClick}
            />
          );
        })}
      </div>
    </div>
  );
};
