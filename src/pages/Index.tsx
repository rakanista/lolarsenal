import { useEffect, useMemo, useState } from "react";

import { DndContext, DragOverlay } from "@dnd-kit/core";

import { type Item, type Stats } from "@/models/item";

import { useItemsStatic } from "@/hooks/useItems";
import { getItemsByGamemode, getItemsByRank } from "@/hooks/itemsLoader";
import {
  ItemFilters,
  manageItemFilters,
  type StatsFilterKey,
} from "@/utils/itemFilter";

import { ShopSection } from "@/features/shop/components/ShopSection";
import { ArsenalPanel } from "@/features/arsenal/components/ArsenalPanel";
import { useArsenalState } from "@/features/arsenal/hooks/useArsenalState";
import { useArsenalDnd } from "@/features/arsenal/hooks/useArsenalDnd";

import {
  buildStatIconSrc,
  buildTagIconSrc,
  hasStatValue,
  readShopFiltersFromStorage,
  ShopFiltersStorageV2,
  writeShopFiltersToStorage,
} from "@/features/shop/shopFilters";
import { getBaseUrl } from "@/utils";

const GAMEMODES = ["SUMMONER'S RIFT", "ARAM", "ARENA"] as const;

const TAG_ORDER = [
  "FIGHTER",
  "MARKSMAN",
  "ASSASSIN",
  "MAGE",
  "TANK",
  "SUPPORT",
] as const;

const STAT_ORDER: StatsFilterKey[] = [
  "attackDamage",
  "criticalStrikeChance",
  "attackSpeed",
  "ONHIT_EFFECTS",
  "armorPenetration",

  "abilityPower",
  "mana",
  "magicPenetration",

  "health",
  "armor",
  "magicResistance",

  "movespeed",
  "abilityHaste",
  "lifesteal",
];

type HoverDescriptionKey = (typeof TAG_ORDER)[number] | StatsFilterKey;

const HOVER_DESCRIPTION: Partial<Record<HoverDescriptionKey, string>> = {
  FIGHTER: "Fighter",
  MARKSMAN: "ADC",
  ASSASSIN: "Assassin",
  MAGE: "Mage",
  TANK: "Tank",
  SUPPORT: "Support",
  attackDamage: "Attack damage",
  criticalStrikeChance: "Critical strike chance",
  attackSpeed: "Attack speed",
  ONHIT_EFFECTS: "On-hit effects",
  armorPenetration: "Armor penetration or Lethality",
  abilityPower: "Ability power",
  mana: "Mana or Mana regen",
  magicPenetration: "Magic penetration",
  health: "Health",
  armor: "Armor",
  magicResistance: "Magic resistance",
  movespeed: "Movspeed",
  abilityHaste: "Ability haste",
  lifesteal: "Lifesteal or Omnivamp",
} as const;

export default function Index() {
  const { items, loading, error } = useItemsStatic();

  const { state: arsenalState, actions: arsenalActions } = useArsenalState();

  const {
    sensors,
    collisionDetection,
    activeShopItemId,
    activeInstanceId,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
  } = useArsenalDnd(arsenalState, arsenalActions);

  const [itemInfo, setItemInfo] = useState<Item | null>(null);

  const [activeFilters, setActiveFilters] = useState<ItemFilters>(() => {
    const stored = readShopFiltersFromStorage();

    return {
      gamemode: stored?.activeGamemode ?? "SUMMONER'S RIFT",
      selectedTags: new Set((stored?.selectedTags ?? []).slice(0, 1)),
      selectedStats: new Set(stored?.selectedStats ?? []),
      champClass: "ALL",
      champSpecific: false,
      isPurchasable: true,
    };
  });

  const [isTierOrderReversed, setIsTierOrderReversed] = useState(false);

  const gamemodeItems = useMemo(
    () => getItemsByGamemode(activeFilters.gamemode, items),
    [activeFilters.gamemode, items],
  );

  const availableTags = useMemo(() => {
    return [...TAG_ORDER];
  }, []);

  const availableStatFilters = useMemo(() => {
    if (gamemodeItems.length === 0) return [];

    const available = new Set<StatsFilterKey>();

    for (const item of gamemodeItems) {
      for (const key of STAT_ORDER) {
        if (key === "ONHIT_EFFECTS") {
          if (item.shop.tags.includes("ONHIT_EFFECTS")) available.add(key);
          continue;
        }

        if (key === "movespeed") {
          if (
            hasStatValue(item.stats.movespeed) ||
            item.shop.tags.includes("MOVESPEED")
          ) {
            available.add(key);
          }
          continue;
        }

        // Comentário (PT): stats normais (stat > 0)
        const statKey = key as keyof Stats;
        if (hasStatValue(item.stats[statKey])) available.add(statKey);
      }
    }

    // Comentário (PT): garante que stats já selecionados apareçam (mesmo que indisponíveis no gamemode atual)
    for (const key of activeFilters.selectedStats) {
      available.add(key);
    }

    // Comentário (PT): mantém a ordem EXATA definida em STAT_ORDER (incluindo ONHIT_EFFECTS)
    return STAT_ORDER.filter((k) => available.has(k));
  }, [gamemodeItems, activeFilters.selectedStats]);

  useEffect(() => {
    const next: ShopFiltersStorageV2 = {
      version: 2,
      activeGamemode: activeFilters.gamemode,
      selectedTags: Array.from(activeFilters.selectedTags),
      selectedStats: Array.from(activeFilters.selectedStats),
    };

    writeShopFiltersToStorage(next);
  }, [
    activeFilters.gamemode,
    activeFilters.selectedTags,
    activeFilters.selectedStats,
  ]);

  useEffect(() => {
    const tagsSet = new Set<string>(availableTags);
    const statsSet = new Set<StatsFilterKey>(availableStatFilters); // <-- MUDOU AQUI

    setActiveFilters((prev) => {
      const prunedTags = new Set(
        Array.from(prev.selectedTags).filter((t) => tagsSet.has(t)),
      );
      const prunedStats = new Set(
        Array.from(prev.selectedStats).filter((s) => statsSet.has(s)),
      );

      const unchanged =
        prunedTags.size === prev.selectedTags.size &&
        prunedStats.size === prev.selectedStats.size;

      if (unchanged) return prev;

      return { ...prev, selectedTags: prunedTags, selectedStats: prunedStats };
    });
  }, [availableTags, availableStatFilters]);

  const toggleTag = (tag: string) => {
    setActiveFilters((prev) => {
      if (prev.selectedTags.has(tag)) return prev;

      return {
        ...prev,
        selectedTags: new Set([tag]),
      };
    });
  };

  const toggleStat = (statKey: StatsFilterKey) => {
    setActiveFilters((prev) => {
      const next = new Set(prev.selectedStats);
      if (next.has(statKey)) next.delete(statKey);
      else next.add(statKey);

      return { ...prev, selectedStats: next };
    });
  };

  const clearTagFilters = () => {
    setActiveFilters((prev) => ({
      ...prev,
      selectedTags: new Set(),
    }));
  };

  const filteredItems = useMemo(
    () => manageItemFilters(activeFilters, items),
    [activeFilters, items],
  );

  const itemsById = useMemo(
    () => new Map(items.map((it) => [it.id, it])),
    [items],
  );

  const activeDragItem = useMemo(() => {
    if (activeShopItemId != null)
      return itemsById.get(activeShopItemId) ?? null;

    if (!activeInstanceId) return null;

    for (const block of arsenalState.blocks) {
      const instance = block.items.find(
        (it) => it.instanceId === activeInstanceId,
      );
      if (!instance) continue;
      return itemsById.get(instance.itemId) ?? null;
    }

    return null;
  }, [activeShopItemId, activeInstanceId, itemsById, arsenalState.blocks]);

  const handleAddToArsenal = (item: Item) => {
    arsenalActions.addItemToActiveBlock(item.id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error m-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="stroke-current shrink-0 h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Error loading items!</h3>
          <div className="text-xs">{error.message}</div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="alert alert-warning m-4">
        <span>No items found</span>
      </div>
    );
  }

  const itemInfoRender = () => {
    if (!itemInfo) return null;

    return (
      <div className="sticky top-0 bg-lol-bg-dark z-50 border-b-2 border-lol-gold shadow-xl text-white p-4 pt-10 pl-10">
        <div className="flex gap-4 items-start">
          <button
            className="absolute top-5 right-5 w-5 h-5 flex items-center justify-center hover:brightness-150 transition-opacity"
            onClick={() => setItemInfo(null)}
          >
            <img
              src={`${getBaseUrl()}shop-assets/close-shop.png`}
              alt="Close"
              className="w-full h-full"
            />
          </button>

          <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
            <img
              src={itemInfo.icon}
              alt={itemInfo.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold">{itemInfo.name}</h2>
            <p className="text-sm text-gray-500">ID: {itemInfo.id}</p>

            {itemInfo.simpleDescription && (
              <p className="mt-2">{itemInfo.simpleDescription}</p>
            )}

            {itemInfo.passives.map((p, index) => (
              <div key={index} className="mb-3">
                <p className="font-bold text-primary">{p.name}</p>
                <div className="ml-4 space-y-1">
                  {p.effects && <p className="text-sm">{p.effects}</p>}
                </div>
              </div>
            ))}

            {itemInfo.shop.prices.total > 0 && (
              <div className="mt-2">
                <span className="font-semibold">Price:</span>{" "}
                {itemInfo.shop.prices.total} gold
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderGamemodeButtons = () => {
    return (
      <div className="flex gap-4 bg-lol-bg-medium p-4 pl-10">
        {GAMEMODES.map((gamemode) => (
          <button
            key={gamemode}
            className={
              activeFilters.gamemode === gamemode
                ? "text-lol-cyan font-lol text-lg border-b-2 border-lol-cyan"
                : "text-lol-text font-lol text-lg hover:text-lol-white"
            }
            onClick={() => {
              setActiveFilters((prev) => ({
                ...prev,
                gamemode,
              }));
            }}
          >
            {gamemode}
          </button>
        ))}
      </div>
    );
  };

  const renderGamemodeItems = () => {
    switch (activeFilters.gamemode) {
      case "SUMMONER'S RIFT":
      case "ARAM": {
        const ranksAvailableAsc = [
          "STARTER",
          "BOOTS",
          "BASIC",
          "EPIC",
          "LEGENDARY",
        ] as const;
        const ranksAvailable = isTierOrderReversed
          ? [...ranksAvailableAsc].reverse()
          : [...ranksAvailableAsc];

        return (
          <>
            {ranksAvailable.map((rank) => (
              <ShopSection
                key={rank}
                section={rank}
                items={getItemsByRank(rank, filteredItems)}
                highlightedItemId={itemInfo?.id}
                onLeftClick={setItemInfo}
                onDoubleLeftClick={handleAddToArsenal}
                onRightClick={handleAddToArsenal}
              />
            ))}
          </>
        );
      }

      case "ARENA": {
        const ranksAvailableArenaAsc: Array<[string, string]> = [
          ["STARTER", "STARTER"],
          ["BOOTS", "BOOTS"],
          ["LEGENDARY", "LEGENDARY"],
          ["DISTRIBUTED", "PRISMATIC"],
        ];

        const ranksAvailableArena = isTierOrderReversed
          ? [...ranksAvailableArenaAsc].reverse()
          : ranksAvailableArenaAsc;
        return (
          <>
            {ranksAvailableArena.map(([key, value]) => (
              <ShopSection
                key={key}
                section={value}
                items={getItemsByRank(key, filteredItems)}
                highlightedItemId={itemInfo?.id}
                onLeftClick={setItemInfo}
                onDoubleLeftClick={handleAddToArsenal}
                onRightClick={handleAddToArsenal}
              />
            ))}
          </>
        );
      }

      default:
        return <div>Select a tab</div>;
    }
  };

  const renderShop = () => {
    const buttonsTags = (
      <div className="flex flex-wrap gap-4">
        <button
          className={[
            "w-9 h-9 p-1 transition",
            "hover:brightness-125",
            activeFilters.selectedTags.size === 0
              ? "border-b-2 border-yellow-500 brightness-125"
              : "",
          ].join(" ")}
          title="All items"
          onClick={clearTagFilters}
        >
          <img
            src={buildTagIconSrc("ALL")}
            alt={"All items"}
            className="w-full h-full object-contain transition"
            draggable={false}
          />
        </button>

        {availableTags.map((tag) => {
          const isActive = activeFilters.selectedTags.has(tag);

          return (
            <button
              key={tag}
              className={[
                "w-9 h-9 p-1 transition",
                "hover:brightness-125",
                isActive ? "border-b-2 border-yellow-500 brightness-125" : "",
              ].join(" ")}
              title={HOVER_DESCRIPTION[tag] ?? tag}
              onClick={() => toggleTag(tag)}
            >
              <img
                src={buildTagIconSrc(tag)}
                alt={tag}
                className={["w-full h-full object-contain transition"].join(
                  " ",
                )}
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    );

    const buttonOrderItems = (
      <button
        className={[
          "w-9 h-9 rounded border transition",
          "hover:brightness-125 active:scale-95",
          "border-transparent",
          "ml-4",
        ].join(" ")}
        title="Change items order"
        onClick={() => {
          setIsTierOrderReversed((prev) => !prev);
        }}
      >
        <img
          src={`${getBaseUrl()}shop-assets/order-items.png`}
          alt="Change items order"
          className="w-full h-full object-contain"
          draggable={false}
        />
      </button>
    );

    const buttonsStats = (
      <div className="p-2 border-r-2 border-b-2 border-l-2 border-lol-shop-border flex flex-col gap-2.5">
        <button
          className={[
            "w-9 h-9 transition",
            "hover:brightness-125 hover:scale-105",
          ].join(" ")}
          title="Reset stats"
          onClick={() => {
            setActiveFilters((prev) => {
              if (prev.selectedStats.size === 0) return prev;

              return { ...prev, selectedStats: new Set() };
            });
          }}
        >
          <img
            src={`${getBaseUrl()}shop-assets/clear-stats.png`}
            alt="Reset stats"
            className="w-full h-full object-contain"
            draggable={false}
          />
        </button>
        {availableStatFilters.map((statKey) => {
          const isActive = activeFilters.selectedStats.has(statKey);

          return (
            <button
              key={String(statKey)}
              className={[
                "w-9 h-9 p-2 transition",
                "hover:brightness-150 hover:scale-110",
                isActive ? "border-lol-cyan border-r-3" : "",
              ].join(" ")}
              title={HOVER_DESCRIPTION[statKey] ?? String(statKey)}
              onClick={() => toggleStat(statKey)}
            >
              <img
                src={buildStatIconSrc(statKey)}
                alt={String(statKey)}
                className={[
                  "w-full h-full object-contain transition text-white",
                  isActive ? "icon-filter-active" : "",
                ].join(" ")}
                draggable={false}
              />
            </button>
          );
        })}
      </div>
    );

    return (
      <>
        <div className="flex justify-between p-2 border-t-2 border-b-2 border-l-2 border-lol-shop-border">
          {buttonsTags}
          {buttonOrderItems}
        </div>

        <div className="flex">
          <div>{buttonsStats}</div>
          <div className="flex-1 pl-5  ">{renderGamemodeItems()}</div>
        </div>
      </>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div
        className="bg-lol-bg-dark min-h-screen flex flex-col"
        onContextMenu={(e) => {
          e.preventDefault();
        }}
      >
        {itemInfoRender()}
        {renderGamemodeButtons()}

        <div className="flex flex-1 pb-10">
          <div className="w-[70%]">{renderShop()}</div>

          <div className="w-[30%]">
            <ArsenalPanel
              state={arsenalState}
              actions={arsenalActions}
              itemsById={itemsById}
              onShowItemInfo={(item) => setItemInfo(item)}
            />
          </div>
        </div>
        <DragOverlay>
          {activeDragItem ? (
            <div className="rounded p-2 cursor-pointer transition-all">
              <img
                src={activeDragItem.icon}
                alt={activeDragItem.name}
                className="w-full h-full object-cover border-1"
                style={{
                  borderColor: "#3C3732",
                  boxShadow: "0 0 8px rgba(60, 55, 50, 0.6)",
                }}
              />
              {activeDragItem.shop.prices.total > 0 && (
                <p className="text-lol-gold font-lol font-bold text-center text-sm mt-1">
                  {activeDragItem.shop.prices.total}
                </p>
              )}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
