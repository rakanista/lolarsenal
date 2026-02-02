import { useEffect, useMemo, useReducer, useRef } from "react";

import {
  arsenalReducer,
  createDefaultArsenalState,
} from "@/features/arsenal/reducer";

import {
  clearArsenalState,
  loadArsenalState,
  saveArsenalState,
} from "@/features/arsenal/storage/arsenalStorage";

import type { ArsenalState } from "@/features/arsenal/types";
import { createInstanceIdFactory } from "@/features/arsenal/utils/instanceId";

export type ArsenalActions = {
  setActiveBlock: (blockId: number) => void;
  setArsenalName: (name: string) => void;
  renameBlock: (blockId: number, title: string) => void;

  addItemToBlock: (blockId: number, itemId: number, index?: number) => void;
  addItemToActiveBlock: (itemId: number) => void;

  createBlock: (title?: string) => number;
  createBlockWithItem: (itemId: number, title?: string) => number;

  moveBlockUp: (blockId: number) => void;
  moveBlockDown: (blockId: number) => void;
  removeBlock: (blockId: number) => void;

  removeInstanceAt: (blockId: number, index: number) => void;

  moveInstance: (
    instanceId: string,
    toBlockId: number,
    toIndex: number,
  ) => void;
  reorderWithinBlock: (
    blockId: number,
    fromIndex: number,
    toIndex: number,
  ) => void;

  reset: () => void;
};

const getNextBlockId = (state: ArsenalState) =>
  state.blocks.reduce((max, b) => Math.max(max, b.id), -1) + 1;

export const useArsenalState = () => {
  const initializer = () => loadArsenalState() ?? createDefaultArsenalState();
  const [state, dispatch] = useReducer(arsenalReducer, undefined, initializer);

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const instanceIdFactoryRef = useRef<ReturnType<
    typeof createInstanceIdFactory
  > | null>(null);
  if (instanceIdFactoryRef.current == null) {
    instanceIdFactoryRef.current = createInstanceIdFactory();
  }

  // Persistência com debounce (evita escrever a cada movimento do drag)
  const persistTimerRef = useRef<number | null>(null);
  useEffect(() => {
    if (persistTimerRef.current != null) {
      window.clearTimeout(persistTimerRef.current);
    }

    persistTimerRef.current = window.setTimeout(() => {
      saveArsenalState(state);
    }, 300);

    return () => {
      if (persistTimerRef.current != null) {
        window.clearTimeout(persistTimerRef.current);
      }
    };
  }, [state]);

  const actions: ArsenalActions = useMemo(() => {
    const nextInstanceId = () =>
      instanceIdFactoryRef.current?.() ?? String(Date.now());

    return {
      setActiveBlock: (blockId) =>
        dispatch({ type: "SET_ACTIVE_BLOCK", blockId }),

      setArsenalName: (name) => dispatch({ type: "SET_ARSENAL_NAME", name }),

      renameBlock: (blockId, title) =>
        dispatch({ type: "RENAME_BLOCK", blockId, title }),

      addItemToBlock: (blockId, itemId, index) =>
        dispatch({
          type: "ADD_INSTANCE",
          blockId,
          instanceId: nextInstanceId(),
          itemId,
          index,
        }),

      addItemToActiveBlock: (itemId) => {
        const activeBlockId = stateRef.current.activeBlockId;
        dispatch({
          type: "ADD_INSTANCE",
          blockId: activeBlockId,
          instanceId: nextInstanceId(),
          itemId,
        });
      },

      createBlock: (title = "New block") => {
        const nextId = getNextBlockId(stateRef.current);
        dispatch({ type: "ADD_BLOCK", blockId: nextId, title });
        return nextId;
      },

      createBlockWithItem: (itemId, title = "New block") => {
        const nextId = getNextBlockId(stateRef.current);
        dispatch({ type: "ADD_BLOCK", blockId: nextId, title });
        dispatch({
          type: "ADD_INSTANCE",
          blockId: nextId,
          instanceId: nextInstanceId(),
          itemId,
        });
        dispatch({ type: "SET_ACTIVE_BLOCK", blockId: nextId });
        return nextId;
      },

      moveBlockUp: (blockId) =>
        dispatch({ type: "MOVE_BLOCK", blockId, direction: "UP" }),

      moveBlockDown: (blockId) =>
        dispatch({ type: "MOVE_BLOCK", blockId, direction: "DOWN" }),

      removeBlock: (blockId) => dispatch({ type: "REMOVE_BLOCK", blockId }),

      removeInstanceAt: (blockId, index) =>
        dispatch({ type: "REMOVE_INSTANCE_AT", blockId, index }),

      moveInstance: (instanceId, toBlockId, toIndex) =>
        dispatch({ type: "MOVE_INSTANCE", instanceId, toBlockId, toIndex }),

      reorderWithinBlock: (blockId, fromIndex, toIndex) =>
        dispatch({ type: "REORDER_WITHIN_BLOCK", blockId, fromIndex, toIndex }),

      reset: () => {
        clearArsenalState();
        dispatch({ type: "SET_STATE", state: createDefaultArsenalState() });
      },
    };
  }, []);

  return { state, actions };
};
