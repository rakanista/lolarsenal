import {
  ARSENAL_STATE_VERSION,
  type ArsenalBlock,
  type ArsenalItemInstance,
  type ArsenalState,
} from "../types";

const STORAGE_KEY = "lol-arsenal.state.v1";

const isArsenalItemInstance = (
  value: unknown,
): value is ArsenalItemInstance => {
  if (!value || typeof value !== "object") return false;

  const v = value as Record<string, unknown>;
  return (
    typeof v.instanceId === "string" &&
    typeof v.itemId === "number" &&
    Number.isFinite(v.itemId)
  );
};

const isArsenalBlock = (value: unknown): value is ArsenalBlock => {
  if (!value || typeof value !== "object") return false;

  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "number" &&
    Number.isFinite(v.id) &&
    typeof v.title === "string" &&
    Array.isArray(v.items) &&
    v.items.every(isArsenalItemInstance)
  );
};

const isArsenalState = (value: unknown): value is ArsenalState => {
  if (!value || typeof value !== "object") return false;

  const v = value as Record<string, unknown>;
  return (
    v.version === ARSENAL_STATE_VERSION &&
    typeof v.arsenalName === "string" &&
    typeof v.activeBlockId === "number" &&
    Number.isFinite(v.activeBlockId) &&
    Array.isArray(v.blocks) &&
    v.blocks.every(isArsenalBlock)
  );
};

export const loadArsenalState = (): ArsenalState | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;
    if (!isArsenalState(parsed)) return null;

    return parsed;
  } catch {
    return null;
  }
};

export const saveArsenalState = (state: ArsenalState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Comentário (PT): storage cheio/indisponível -> ignora
  }
};

export const clearArsenalState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
};
