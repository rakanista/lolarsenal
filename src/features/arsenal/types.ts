export const ARSENAL_STATE_VERSION = 1 as const;

export type ArsenalItemInstance = {
  instanceId: string;
  itemId: number;
};

export type ArsenalBlock = {
  id: number;
  title: string;
  items: ArsenalItemInstance[];
};

export type ArsenalState = {
  version: typeof ARSENAL_STATE_VERSION;
  arsenalName: string;
  activeBlockId: number;
  blocks: ArsenalBlock[];
};
