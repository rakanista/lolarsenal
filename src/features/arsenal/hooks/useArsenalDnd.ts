import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

import {
  closestCenter,
  pointerWithin,
  rectIntersection,
  PointerSensor,
  type CollisionDetection,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import type { ArsenalActions } from "./useArsenalState";
import type { ArsenalState } from "../types";
import {
  CREATE_BLOCK_DROPPABLE_ID,
  getContainerSortableIdFromBlocks,
  parseBlockId,
  parseInstanceId,
} from "../utils/dndIds";

import { parseShopItemId } from "@/features/shop/utils/shopDndIds";

export const useArsenalDnd = (state: ArsenalState, actions: ArsenalActions) => {
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  }, [state]);

  const [activeSortableId, setActiveSortableId] = useState<string | null>(null);

  type PendingCrossMove = { toBlockId: number; toIndex: number } | null;

  const pendingCrossMoveRef = useRef<PendingCrossMove>(null);
  const lastOverBlockIdRef = useRef<number | null>(null);
  const lastMoveSignatureRef = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 3 },
    }),
  );

  const handleDragStart = useCallback(({ active }: DragStartEvent) => {
    setActiveSortableId(String(active.id));

    pendingCrossMoveRef.current = null;
    lastOverBlockIdRef.current = null;
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveSortableId(null);

    pendingCrossMoveRef.current = null;
    lastOverBlockIdRef.current = null;
  }, []);

  const handleDragOver = useCallback(
    ({ active, over }: DragOverEvent) => {
      if (!over) return;

      const current = stateRef.current;

      const shopItemId = parseShopItemId(active.id);
      const isShopDrag = shopItemId != null;

      // Comentário (PT): arrastando da Shop: só precisamos descobrir o bloco/alvo e guardar destino
      if (isShopDrag) {
        if (String(over.id) === CREATE_BLOCK_DROPPABLE_ID) {
          pendingCrossMoveRef.current = null;
          lastOverBlockIdRef.current = null;
          return;
        }

        const overContainer = getContainerSortableIdFromBlocks(
          current.blocks,
          over.id,
        );
        if (!overContainer) return;

        const toBlockId = parseBlockId(overContainer);
        if (toBlockId == null) return;

        if (lastOverBlockIdRef.current !== toBlockId) {
          lastOverBlockIdRef.current = toBlockId;
          actions.setActiveBlock(toBlockId);
        }

        const toBlock = current.blocks.find((b) => b.id === toBlockId);
        if (!toBlock) return;

        const overInstanceId = parseInstanceId(over.id);
        const overIndex =
          overInstanceId == null
            ? toBlock.items.length
            : toBlock.items.findIndex((it) => it.instanceId === overInstanceId);

        const toIndex = overIndex === -1 ? toBlock.items.length : overIndex;

        pendingCrossMoveRef.current = { toBlockId, toIndex };
        return;
      }

      // Comentário (PT): comportamento atual (arrasto de instâncias do Arsenal) permanece igual
      const activeContainer = getContainerSortableIdFromBlocks(
        current.blocks,
        active.id,
      );
      const overContainer = getContainerSortableIdFromBlocks(
        current.blocks,
        over.id,
      );

      if (!activeContainer || !overContainer) return;

      const toBlockId = parseBlockId(overContainer);
      if (toBlockId == null) return;

      if (lastOverBlockIdRef.current !== toBlockId) {
        lastOverBlockIdRef.current = toBlockId;
        actions.setActiveBlock(toBlockId);
      }

      const toBlock = current.blocks.find((b) => b.id === toBlockId);
      if (!toBlock) return;

      const overInstanceId = parseInstanceId(over.id);
      const overIndex =
        overInstanceId == null
          ? toBlock.items.length
          : toBlock.items.findIndex((it) => it.instanceId === overInstanceId);

      const toIndex = overIndex === -1 ? toBlock.items.length : overIndex;

      pendingCrossMoveRef.current = { toBlockId, toIndex };
    },
    [actions],
  );

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      setActiveSortableId(null);

      const current = stateRef.current;

      const pending = pendingCrossMoveRef.current;
      pendingCrossMoveRef.current = null;
      lastOverBlockIdRef.current = null;

      if (!over) return;

      const shopItemId = parseShopItemId(active.id);
      const activeInstanceId = parseInstanceId(active.id);

      // Comentário (PT): Drop vindo da Shop
      if (shopItemId != null) {
        // Drop no create-block dropzone
        if (String(over.id) === CREATE_BLOCK_DROPPABLE_ID) {
          const newBlockId = actions.createBlock("New block");
          actions.addItemToBlock(newBlockId, shopItemId, 0);
          return;
        }

        const overContainer = getContainerSortableIdFromBlocks(
          current.blocks,
          over.id,
        );
        if (!overContainer) return;

        const toBlockId = parseBlockId(overContainer);
        if (toBlockId == null) return;

        let toIndex: number | undefined;

        if (pending?.toBlockId === toBlockId) {
          toIndex = pending.toIndex;
        } else {
          const toBlock = current.blocks.find((b) => b.id === toBlockId);
          if (!toBlock) return;

          const overInstanceId = parseInstanceId(over.id);
          const overIndex =
            overInstanceId == null
              ? toBlock.items.length
              : toBlock.items.findIndex(
                  (it) => it.instanceId === overInstanceId,
                );

          toIndex = overIndex === -1 ? toBlock.items.length : overIndex;
        }

        actions.addItemToBlock(toBlockId, shopItemId, toIndex);
        return;
      }

      // Comentário (PT): comportamento atual (instâncias do Arsenal)
      if (activeInstanceId == null) return;

      // Drop no create-block dropzone
      if (String(over.id) === CREATE_BLOCK_DROPPABLE_ID) {
        const newBlockId = actions.createBlock("New block");
        actions.moveInstance(activeInstanceId, newBlockId, 0);
        return;
      }

      const activeContainer = getContainerSortableIdFromBlocks(
        current.blocks,
        active.id,
      );
      const overContainer = getContainerSortableIdFromBlocks(
        current.blocks,
        over.id,
      );

      if (!activeContainer || !overContainer) return;

      // Se mudou de container, move só aqui (1 dispatch)
      if (activeContainer !== overContainer) {
        const toBlockId = parseBlockId(overContainer);
        if (toBlockId == null) return;

        const toIndex =
          pending?.toBlockId === toBlockId ? pending.toIndex : undefined;

        actions.moveInstance(activeInstanceId, toBlockId, toIndex ?? 999999);
        return;
      }

      // Mesmo container -> reorder (como já estava)
      const blockId = parseBlockId(activeContainer);
      if (blockId == null) return;

      const overInstanceId = parseInstanceId(over.id);
      if (overInstanceId == null) return;

      const block = current.blocks.find((b) => b.id === blockId);
      if (!block) return;

      const fromIndex = block.items.findIndex(
        (it) => it.instanceId === activeInstanceId,
      );
      const toIndex = block.items.findIndex(
        (it) => it.instanceId === overInstanceId,
      );

      if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;

      actions.reorderWithinBlock(blockId, fromIndex, toIndex);
    },
    [actions],
  );

  const collisionDetection = useMemo<CollisionDetection>(() => {
    return (args) => {
      const pointerCollisions = pointerWithin(args);
      if (pointerCollisions.length > 0) return pointerCollisions;

      const rectCollisions = rectIntersection(args);
      if (rectCollisions.length > 0) return rectCollisions;

      return closestCenter(args);
    };
  }, []);

  const activeInstanceId = useMemo(() => {
    if (!activeSortableId) return null;
    return parseInstanceId(activeSortableId);
  }, [activeSortableId]);

  const activeShopItemId = useMemo(() => {
    if (!activeSortableId) return null;
    return parseShopItemId(activeSortableId);
  }, [activeSortableId]);

  return {
    sensors,
    collisionDetection,
    activeShopItemId,
    activeInstanceId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  };
};
