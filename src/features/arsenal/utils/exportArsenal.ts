import type { ArsenalState } from "../types";

export const buildArsenalExportString = (state: ArsenalState) => {
  const blocks = state.blocks.map((block) => ({
    type: block.title,
    items: block.items.map((it) => ({
      id: String(it.itemId),
      count: 1,
    })),
  }));

  const payload = {
    title: state.arsenalName,
    blocks,
  };

  return JSON.stringify(payload, null, 2);
};
