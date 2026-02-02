import { Item } from "@/models/item";

export interface ItemBlock {
  id: number;
  count: number;
}

export interface Block {
  id: number;
  items: Item[];
  type: string;
}

export interface Arsenal {
  title: string;
  associatedMaps: number[];
  associatedChampions: number[];
  blocks: Block[];
}
