import {
  ArmorPenetration,
  Health,
  HealthRegen,
  Mana,
  ManaRegen,
  Armor,
  MagicResistance,
  AttackDamage,
  AbilityPower,
  AttackSpeed,
  Movespeed,
  CriticalStrikeChance,
  Lethality,
  CooldownReduction,
  GoldPer10,
  HealAndShieldPower,
  Lifesteal,
  MagicPenetration,
  AbilityHaste,
  OmniVamp,
  Tenacity,
  CriticalStrikeDamage,
} from "./common";

export enum ItemAttributes {
  TANK = "TANK",
  SUPPORT = "SUPPORT",
  MAGE = "MAGE",
  MOVEMENT = "MOVEMENT",
  ATTACK_SPEED = "ATTACK_SPEED",
  ONHIT_EFFECTS = "ONHIT_EFFECTS",
  FIGHTER = "FIGHTER",
  MARKSMAN = "MARKSMAN",
  ASSASSIN = "ASSASSIN",
  ARMOR_PEN = "ARMOR_PEN",
  MANA_AND_REG = "MANA_AND_REG",
  HEALTH_AND_REG = "HEALTH_AND_REG",
  LIFESTEAL_VAMP = "LIFESTEAL_VAMP",
  MAGIC_PEN = "MAGIC_PEN",
  ABILITY_POWER = "ABILITY_POWER",
  ATTACK_DAMAGE = "ATTACK_DAMAGE",
  CRITICAL_STRIKE = "CRITICAL_STRIKE",
  ABILITY_HASTE = "ABILITY_HASTE",
}

export enum ItemRanks {
  MYTHIC = "MYTHIC",
  LEGENDARY = "LEGENDARY",
  EPIC = "EPIC",
  BASIC = "BASIC",
  STARTER = "STARTER",
  CONSUMABLE = "CONSUMABLE",
  POTION = "POTION",
  BOOTS = "BOOTS",
  TRINKET = "TRINKET",
  DISTRIBUTED = "DISTRIBUTED",
  MINION = "MINION",
  TURRET = "TURRET",
  SPECIAL = "SPECIAL",
}

export interface Stats {
  abilityPower: AbilityPower;
  armor: Armor;
  armorPenetration: ArmorPenetration;
  attackDamage: AttackDamage;
  attackSpeed: AttackSpeed;
  cooldownReduction: CooldownReduction;
  criticalStrikeChance: CriticalStrikeChance;
  goldPer10: GoldPer10;
  healAndShieldPower: HealAndShieldPower;
  health: Health;
  healthRegen: HealthRegen;
  lethality: Lethality;
  lifesteal: Lifesteal;
  magicPenetration: MagicPenetration;
  magicResistance: MagicResistance;
  mana: Mana;
  manaRegen: ManaRegen;
  movespeed: Movespeed;
  abilityHaste: AbilityHaste;
  omnivamp: OmniVamp;
  tenacity: Tenacity;
  criticalStrikeDamage: CriticalStrikeDamage;
}

export interface Prices {
  total: number;
  combined: number;
  sell: number;
}

export interface Shop {
  prices: Prices;
  purchasable: boolean;
  tags: string[];
}

export interface Passive {
  unique: boolean;
  name: string;
  mythic?: boolean | null;
  effects?: string | null;
  range?: number | null;
  cooldown?: string | null;
  stats?: Stats | null;
}

export interface Active {
  unique: boolean;
  name: string;
  effects: string;
  range: number;
  cooldown: number;
}

export interface Item {
  name: string;
  id: number;
  tier: number;
  rank: string[];
  buildsFrom: number[];
  buildsInto: number[];
  specialRecipe: number;
  noEffects: boolean;
  removed: boolean;
  requiredChampion: string;
  requiredAlly: string;
  icon: string;
  nicknames: string[];
  passives: Passive[];
  active: Active[];
  stats: Stats;
  shop: Shop;
  iconOverlay: boolean;
  simpleDescription?: string | null;
  gamemodes: string[];
}
