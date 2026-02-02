import { useState, useEffect, useMemo } from "react";
import { Item } from "@/models/item";
import { ItemsData, itemsStatic } from "./itemsLoader";

export function useItemsStatic() {
  const [items] = useState<Item[]>(itemsStatic);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    items,
    loading,
    error,
  };
}
