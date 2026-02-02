import {
  ARSENAL_STATE_VERSION,
  type ArsenalState,
} from "@/features/arsenal/types";

export type ArsenalAction =
  | { type: "SET_STATE"; state: ArsenalState }
  | { type: "SET_ACTIVE_BLOCK"; blockId: number }
  | { type: "SET_ARSENAL_NAME"; name: string }
  | { type: "RENAME_BLOCK"; blockId: number; title: string }
  | { type: "ADD_BLOCK"; blockId: number; title: string }
  | { type: "MOVE_BLOCK"; blockId: number; direction: "UP" | "DOWN" }
  | { type: "REMOVE_BLOCK"; blockId: number }
  | {
      type: "ADD_INSTANCE";
      blockId: number;
      instanceId: string;
      itemId: number;
      index?: number;
    }
  | { type: "REMOVE_INSTANCE_AT"; blockId: number; index: number }
  | {
      type: "MOVE_INSTANCE";
      instanceId: string;
      toBlockId: number;
      toIndex: number;
    }
  | {
      type: "REORDER_WITHIN_BLOCK";
      blockId: number;
      fromIndex: number;
      toIndex: number;
    };

const ensureValidActiveBlock = (state: ArsenalState): ArsenalState => {
  const hasActive = state.blocks.some((b) => b.id === state.activeBlockId);
  if (hasActive) return state;

  const fallbackId = state.blocks[0]?.id ?? 0;
  return { ...state, activeBlockId: fallbackId };
};

export const createDefaultArsenalState = (): ArsenalState => ({
  version: ARSENAL_STATE_VERSION,
  arsenalName: "ARSENAL",
  activeBlockId: 0,
  blocks: [{ id: 0, title: "New block", items: [] }],
});

const findInstanceLocation = (
  state: ArsenalState,
  instanceId: string,
): { blockId: number; index: number } | null => {
  for (const block of state.blocks) {
    const index = block.items.findIndex((it) => it.instanceId === instanceId);
    if (index >= 0) return { blockId: block.id, index };
  }
  return null;
};

export const arsenalReducer = (
  state: ArsenalState,
  action: ArsenalAction,
): ArsenalState => {
  switch (action.type) {
    case "SET_STATE": {
      const next = action.state.blocks.length
        ? action.state
        : createDefaultArsenalState();
      return ensureValidActiveBlock(next);
    }

    case "SET_ACTIVE_BLOCK": {
      const exists = state.blocks.some((b) => b.id === action.blockId);
      return exists ? { ...state, activeBlockId: action.blockId } : state;
    }

    case "SET_ARSENAL_NAME": {
      return { ...state, arsenalName: action.name };
    }

    case "RENAME_BLOCK": {
      return {
        ...state,
        blocks: state.blocks.map((b) =>
          b.id === action.blockId ? { ...b, title: action.title } : b,
        ),
      };
    }

    case "ADD_BLOCK": {
      if (state.blocks.some((b) => b.id === action.blockId)) return state;

      const next = {
        ...state,
        activeBlockId: action.blockId,
        blocks: [
          ...state.blocks,
          { id: action.blockId, title: action.title, items: [] },
        ],
      };

      return ensureValidActiveBlock(next);
    }

    case "MOVE_BLOCK": {
      const fromIndex = state.blocks.findIndex((b) => b.id === action.blockId);
      if (fromIndex < 0) return state;

      const toIndex = action.direction === "UP" ? fromIndex - 1 : fromIndex + 1;

      if (toIndex < 0 || toIndex >= state.blocks.length) return state;

      const nextBlocks = [...state.blocks];
      const tmp = nextBlocks[fromIndex];
      nextBlocks[fromIndex] = nextBlocks[toIndex];
      nextBlocks[toIndex] = tmp;

      return { ...state, blocks: nextBlocks };
    }

    case "REMOVE_BLOCK": {
      if (state.blocks.length <= 1) return state;

      const index = state.blocks.findIndex((b) => b.id === action.blockId);
      if (index < 0) return state;

      const nextBlocks = state.blocks.filter((b) => b.id !== action.blockId);

      const nextActiveBlockId =
        state.activeBlockId === action.blockId
          ? (nextBlocks[Math.min(index, nextBlocks.length - 1)]?.id ??
            nextBlocks[0]?.id ??
            0)
          : state.activeBlockId;

      return ensureValidActiveBlock({
        ...state,
        blocks: nextBlocks,
        activeBlockId: nextActiveBlockId,
      });
    }

    case "ADD_INSTANCE": {
      return {
        ...state,
        blocks: state.blocks.map((b) => {
          if (b.id !== action.blockId) return b;

          const nextItems = [...b.items];
          const index = action.index ?? nextItems.length;

          nextItems.splice(index, 0, {
            instanceId: action.instanceId,
            itemId: action.itemId,
          });
          return { ...b, items: nextItems };
        }),
      };
    }

    case "REMOVE_INSTANCE_AT": {
      return {
        ...state,
        blocks: state.blocks.map((b) => {
          if (b.id !== action.blockId) return b;
          if (action.index < 0 || action.index >= b.items.length) return b;

          const nextItems = [...b.items];
          nextItems.splice(action.index, 1);
          return { ...b, items: nextItems };
        }),
      };
    }

    case "MOVE_INSTANCE": {
      const location = findInstanceLocation(state, action.instanceId);
      if (!location) return state;

      const fromBlockId = location.blockId;
      const fromIndex = location.index;

      if (!state.blocks.some((b) => b.id === action.toBlockId)) return state;

      const moving = state.blocks.find((b) => b.id === fromBlockId)?.items[
        fromIndex
      ];
      if (!moving) return state;

      const nextBlocks = state.blocks.map((b) => {
        if (b.id === fromBlockId) {
          const nextItems = [...b.items];
          nextItems.splice(fromIndex, 1);
          return { ...b, items: nextItems };
        }

        if (b.id === action.toBlockId) {
          const nextItems = [...b.items];
          const toIndex = Math.max(
            0,
            Math.min(action.toIndex, nextItems.length),
          );
          nextItems.splice(toIndex, 0, moving);
          return { ...b, items: nextItems };
        }

        return b;
      });

      return { ...state, blocks: nextBlocks };
    }

    case "REORDER_WITHIN_BLOCK": {
      return {
        ...state,
        blocks: state.blocks.map((b) => {
          if (b.id !== action.blockId) return b;

          const { fromIndex, toIndex } = action;
          if (fromIndex === toIndex) return b;
          if (fromIndex < 0 || fromIndex >= b.items.length) return b;
          if (toIndex < 0 || toIndex >= b.items.length) return b;

          const nextItems = [...b.items];
          const [moved] = nextItems.splice(fromIndex, 1);
          nextItems.splice(toIndex, 0, moved);

          return { ...b, items: nextItems };
        }),
      };
    }

    default:
      return state;
  }
};
