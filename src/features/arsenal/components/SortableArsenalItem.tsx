import type { CSSProperties } from "react";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import type { Item } from "@/models/item";

import { getInstanceSortableId } from "../utils/dndIds";

type SortableArsenalItemProps = {
  instanceId: string;
  item: Item;
  blockId: number;
  index: number;

  onLeftClick: (item: Item) => void;
  onDoubleLeftClick?: (item: Item) => void;
  onRightClick?: (index: number, blockId: number) => void;
};

export const SortableArsenalItem = ({
  instanceId,
  item,
  blockId,
  index,
  onLeftClick,
  onDoubleLeftClick,
  onRightClick,
}: SortableArsenalItemProps) => {
  const sortableId = getInstanceSortableId(instanceId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-instance-id={instanceId}
      {...attributes}
      {...listeners}
    >
      <div
        className="rounded p-2 cursor-pointer transition-all hover:brightness-125"
        onClick={() => onLeftClick(item)}
        onContextMenu={(e) => {
          e.preventDefault();
          onRightClick?.(index, blockId);
        }}
        onDoubleClick={() => onDoubleLeftClick?.(item)}
      >
        <img
          src={item.icon}
          alt={item.name}
          draggable={false}
          className="w-full h-full object-cover border-1"
          style={{
            borderColor: "#3C3732",
            boxShadow: "0 0 8px rgba(60, 55, 50, 0.6)",
          }}
        />
        {item.shop.prices.total > 0 && (
          <p className="text-lol-gold font-lol font-bold text-center text-sm mt-1">
            {item.shop.prices.total}
          </p>
        )}
      </div>
    </div>
  );
};
