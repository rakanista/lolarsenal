import { useEffect, useMemo, useState } from "react";

import type { Item } from "@/models/item";

import { EditableTitle } from "@/components/EditableTitle";

import type { ArsenalActions } from "@/features/arsenal/hooks/useArsenalState";
import { useArsenalDnd } from "@/features/arsenal/hooks/useArsenalDnd";
import type { ArsenalState } from "@/features/arsenal/types";
import { buildArsenalExportString } from "@/features/arsenal/utils/exportArsenal";
import {
  ArsenalBlock,
  type ArsenalBlockItemResolved,
} from "@/features/arsenal/components/ArsenalBlock";
import { CreateBlockDropzone } from "@/features/arsenal/components/CreateBlockDropzone";

type ArsenalPanelProps = {
  state: ArsenalState;
  actions: ArsenalActions;

  itemsById: Map<number, Item>;
  onShowItemInfo: (item: Item) => void;
};

export const ArsenalPanel = ({
  state,
  actions,
  itemsById,
  onShowItemInfo,
}: ArsenalPanelProps) => {
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  const [pendingDelete, setPendingDelete] = useState<{
    blockId: number;
    title: string;
  } | null>(null);

  useEffect(() => {
    if (!pendingDelete) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPendingDelete(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [pendingDelete]);

  const requestDeleteBlock = (blockId: number) => {
    if (state.blocks.length <= 1) return;

    const block = state.blocks.find((b) => b.id === blockId);
    setPendingDelete({
      blockId,
      title: block?.title ?? "Block",
    });
  };

  const cancelDeleteBlock = () => setPendingDelete(null);

  const confirmDeleteBlock = () => {
    if (!pendingDelete) return;

    actions.removeBlock(pendingDelete.blockId);
    setPendingDelete(null);
  };

  const resolvedBlocks = useMemo(() => {
    return state.blocks.map((block) => {
      const resolved: ArsenalBlockItemResolved[] = block.items
        .map((it) => {
          const item = itemsById.get(it.itemId);
          if (!item) return null;
          return { instanceId: it.instanceId, item };
        })
        .filter(Boolean) as ArsenalBlockItemResolved[];

      return { ...block, resolvedItems: resolved };
    });
  }, [itemsById, state.blocks]);

  const copyArsenalToClipboard = async () => {
    try {
      const payload = buildArsenalExportString(state);
      await navigator.clipboard.writeText(payload);

      setCopyFeedback("Copied!");
      window.setTimeout(() => setCopyFeedback(null), 1200);
    } catch {
      setCopyFeedback("Copy failed");
      window.setTimeout(() => setCopyFeedback(null), 1500);
    }
  };

  return (
    <div className="p-4 border-2 border-lol-shop-border min-h-[134px] flex flex-col gap-2">
      <div className="max-h-40">
        <button
          className="text-white"
          title="Copy item set"
          onClick={copyArsenalToClipboard}
        >
          <img
            src="ui-icons/export-white.png"
            alt="Export"
            className="w-full h-full object-cover"
          />
        </button>
        {copyFeedback ? (
          <div className="text-xs text-lol-cyan mt-1">{copyFeedback}</div>
        ) : null}
      </div>

      <EditableTitle
        value={state.arsenalName}
        onCommit={actions.setArsenalName}
        className="font-shop-section font-bold text-2xl text-lol-gold inline-flex items-center gap-2 cursor-text select-none hover:underline hover:underline-offset-4 hover:decoration-dotted hover:decoration-lol-gold/70 group"
        inputClassName="font-shop-section font-bold text-xl text-lol-gold bg-transparent border border-lol-gold/40 rounded px-2 py-1 w-full"
      />

      {resolvedBlocks.map((block, index) => {
        const totalGold = block.resolvedItems.reduce(
          (sum, instance) => sum + instance.item.shop.prices.total,
          0,
        );

        const canMoveUp = index > 0;
        const canMoveDown = index < resolvedBlocks.length - 1;

        return (
          <div key={block.id}>
            <ArsenalBlock
              id={block.id}
              title={block.title}
              isActive={block.id === state.activeBlockId}
              canMoveUp={canMoveUp}
              canMoveDown={canMoveDown}
              canDelete={resolvedBlocks.length > 1}
              items={block.resolvedItems}
              onActivate={actions.setActiveBlock}
              onRenameTitle={actions.renameBlock}
              onMoveUp={actions.moveBlockUp}
              onMoveDown={actions.moveBlockDown}
              onDelete={requestDeleteBlock}
              onLeftClick={onShowItemInfo}
              onDoubleLeftClick={(item) =>
                actions.addItemToActiveBlock(item.id)
              }
              onRightClick={(index, blockId) => {
                if (index == null) return;
                actions.removeInstanceAt(blockId, index);
              }}
              onNativeDropItem={(blockId, itemId, overInstanceId) => {
                if (!itemsById.has(itemId)) return;

                actions.setActiveBlock(blockId);

                const blockState = state.blocks.find((b) => b.id === blockId);
                const insertIndex =
                  overInstanceId && blockState
                    ? blockState.items.findIndex(
                        (it) => it.instanceId === overInstanceId,
                      )
                    : -1;

                actions.addItemToBlock(
                  blockId,
                  itemId,
                  insertIndex >= 0 ? insertIndex : undefined,
                );
              }}
            />

            {totalGold > 0 && (
              <p className="text-lol-gold font-lol font-bold text-right text-sm pr-1">
                {totalGold}
              </p>
            )}
          </div>
        );
      })}

      <CreateBlockDropzone
        onDropItem={(itemId) => {
          if (!itemsById.has(itemId)) return;
          actions.createBlockWithItem(itemId, "New block");
        }}
      />
      {pendingDelete ? (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 p-4"
          onMouseDown={cancelDeleteBlock}
        >
          <div
            className="w-full max-w-md rounded border border-lol-gold/40 bg-lol-bg-dark shadow-xl p-4"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <h3 className="font-lol text-lol-gold text-lg">Delete block?</h3>

            <p className="text-lol-text mt-2">
              This will remove{" "}
              <span className="text-white font-semibold">
                "{pendingDelete.title}"
              </span>{" "}
              and all its items.
            </p>

            <div className="mt-4 flex justify-end gap-2 text-white">
              <button
                type="button"
                className="px-3 py-2 rounded border border-green-500/60 hover:brightness-125 active:scale-95"
                onClick={cancelDeleteBlock}
              >
                Cancel
              </button>

              <button
                type="button"
                className="px-3 py-2 rounded border border-red-500/60 hover:border-red-500 hover:brightness-125 active:scale-95"
                onClick={confirmDeleteBlock}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
