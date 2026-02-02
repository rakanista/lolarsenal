import { useMemo, useState, type DragEvent as ReactDragEvent } from "react";

import { useDroppable } from "@dnd-kit/core";
import { rectSortingStrategy, SortableContext } from "@dnd-kit/sortable";

import type { Item } from "@/models/item";

import {
  getBlockSortableId,
  getInstanceSortableId,
} from "@/features/arsenal/utils/dndIds";
import { SortableArsenalItem } from "@/features/arsenal/components/SortableArsenalItem";

import { EditableTitle } from "@/components/EditableTitle";

export type ArsenalBlockItemResolved = {
  instanceId: string;
  item: Item;
};

type ArsenalBlockProps = {
  id: number;
  title: string;
  isActive: boolean;

  items: ArsenalBlockItemResolved[];

  onActivate: (blockId: number) => void;
  onRenameTitle: (blockId: number, nextTitle: string) => void;

  onLeftClick: (item: Item) => void;
  onDoubleLeftClick?: (item: Item) => void;
  onRightClick?: (index: number, blockId: number) => void;

  onNativeDropItem: (
    blockId: number,
    itemId: number,
    overInstanceId: string | null,
  ) => void;

  canMoveUp: boolean;
  canMoveDown: boolean;
  canDelete: boolean;

  onMoveUp: (blockId: number) => void;
  onMoveDown: (blockId: number) => void;
  onDelete: (blockId: number) => void;
};

export const ArsenalBlock = ({
  id,
  title,
  isActive,
  items,
  onActivate,
  onRenameTitle,
  onLeftClick,
  onDoubleLeftClick,
  onRightClick,
  onNativeDropItem,
  canMoveUp,
  onMoveUp,
  canMoveDown,
  onMoveDown,
  canDelete,
  onDelete,
}: ArsenalBlockProps) => {
  const containerId = getBlockSortableId(id);

  const sortableItemIds = useMemo(
    () => items.map((it) => getInstanceSortableId(it.instanceId)),
    [items],
  );

  const { setNodeRef, isOver } = useDroppable({ id: containerId });

  const [isNativeOver, setIsNativeOver] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex items-center gap-2">
        <EditableTitle
          value={title}
          onCommit={(next) => onRenameTitle(id, next)}
          className="text-lol-white font-lol text-xl inline-flex items-center gap-2 cursor-text select-none hover:underline hover:underline-offset-4 hover:decoration-dotted hover:decoration-white/60 group w-fit max-w-[50%] min-w-0 truncate"
          inputClassName="text-lol-white font-lol text-xl bg-transparent border border-white/40 rounded px-2 py-1 w-full"
        />

        <div className="ml-auto flex items-center gap-1 text-[#cebc94]">
          <button
            type="button"
            className={[
              "px-2 py-1 transition",
              "hover:brightness-125 active:scale-95",
              canMoveUp
                ? ""
                : "border-transparent opacity-30 cursor-not-allowed",
            ].join(" ")}
            title="Move block up"
            disabled={!canMoveUp}
            onClick={() => onMoveUp(id)}
          >
            ▲
          </button>

          <button
            type="button"
            className={[
              "px-2 py-1 transition",
              "hover:brightness-125 active:scale-95",
              canMoveDown ? "" : "opacity-30 cursor-not-allowed",
            ].join(" ")}
            title="Move block down"
            disabled={!canMoveDown}
            onClick={() => onMoveDown(id)}
          >
            ▼
          </button>

          <button
            type="button"
            className={[
              "font-bold px-2 py-1 transition",
              "hover:brightness-125 hove:scale-105",
              canDelete ? "" : "opacity-30 cursor-not-allowed",
            ].join(" ")}
            title="Delete block"
            disabled={!canDelete}
            onClick={() => onDelete(id)}
          >
            ✕
          </button>
        </div>
      </div>

      <SortableContext
        id={containerId}
        items={sortableItemIds}
        strategy={rectSortingStrategy}
      >
        <div
          ref={setNodeRef}
          className={`grid gap-1 min-h-[86px]  ${
            isOver || isNativeOver ? "outline outline-2 outline-lol-cyan" : ""
          } ${
            isActive
              ? "border-l-4 border-lol-cyan shadow-[0_0_0_1px_rgba(0,255,255,0.25)]"
              : "border-1 border-gray-500/50"
          }`}
          onClick={(e) => {
            const clickedItem = (e.target as HTMLElement | null)?.closest?.(
              "[data-instance-id]",
            );
            if (clickedItem) return;

            onActivate(id);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
            if (!isNativeOver) setIsNativeOver(true);
          }}
          onDragLeave={() => setIsNativeOver(false)}
          onDrop={(e: ReactDragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsNativeOver(false);

            const rawItemId = e.dataTransfer.getData("text/plain");
            const itemId = Number(rawItemId);
            if (!Number.isFinite(itemId)) return;

            const dropTargetEl = (e.target as HTMLElement | null)?.closest?.(
              "[data-instance-id]",
            );
            const overInstanceId =
              dropTargetEl?.getAttribute("data-instance-id") ?? null;

            onNativeDropItem(id, itemId, overInstanceId);
          }}
          style={{
            gridTemplateColumns: "repeat(auto-fit, minmax(55px, 62px))",
          }}
        >
          {items.map((entry, index) => (
            <SortableArsenalItem
              key={getInstanceSortableId(entry.instanceId)}
              instanceId={entry.instanceId}
              item={entry.item}
              blockId={id}
              index={index}
              onLeftClick={onLeftClick}
              onDoubleLeftClick={onDoubleLeftClick}
              onRightClick={onRightClick}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};
