import type { UniqueIdentifier } from "@dnd-kit/core";

import type { ArsenalBlock } from "../types";

export const CREATE_BLOCK_DROPPABLE_ID = "create-block";

export const getBlockSortableId = (blockId: number) => `block:${blockId}`;
export const getInstanceSortableId = (instanceId: string) =>
  `instance:${instanceId}`;

export const parseBlockId = (id: UniqueIdentifier) => {
  if (typeof id !== "string") return null;
  if (!id.startsWith("block:")) return null;

  const value = Number(id.slice("block:".length));
  return Number.isFinite(value) ? value : null;
};

export const parseInstanceId = (id: UniqueIdentifier) => {
  if (typeof id !== "string") return null;
  if (!id.startsWith("instance:")) return null;

  return id.slice("instance:".length);
};

export const getContainerSortableIdFromBlocks = (
  blocks: ArsenalBlock[],
  id: UniqueIdentifier,
) => {
  if (typeof id === "string" && id.startsWith("block:")) return id;

  const instanceId = parseInstanceId(id);
  if (instanceId == null) return null;

  const owner = blocks.find((b) =>
    b.items.some((it) => it.instanceId === instanceId),
  );
  return owner ? getBlockSortableId(owner.id) : null;
};
