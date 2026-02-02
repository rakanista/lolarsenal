import {
  DamageType,
  Health,
  HealthRegen,
  Mana,
  ManaRegen,
  Armor,
  MagicResistance,
  AttackDamage,
  Movespeed,
  AttackSpeed,
  AttackRange,
  Stat,
} from './common';

export enum Resource {
  NO_COST = "NO_COST",
  MANA = "MANA",
  ENERGY = "ENERGY",
  RAGE = "RAGE",
  FURY = "FURY",
  FEROCITY = "FEROCITY",
  HEALTH = "HEALTH",
  MAXIMUM_HEALTH = "MAXIMUM_HEALTH",
  CURRENT_HEALTH = "CURRENT_HEALTH",
  HEALTH_PER_SECOND = "HEALTH_PER_SECOND",
  MANA_PER_SECOND = "MANA_PER_SECOND",
  CHARGE = "CHARGE",
  COURAGE = "COURAGE",
  HEAT = "HEAT",
  GRIT = "GRIT",
  FLOW = "FLOW",
  SHIELD = "SHIELD",
  OTHER = "OTHER",
  NONE = "NONE",
  SOUL_UNBOUND = "SOUL_UNBOUND",
  BLOOD_WELL = "BLOOD_WELL",
  CRIMSON_RUSH = "CRIMSON_RUSH",
  FRENZY = "FRENZY",
}

export enum AttackType {
  MELEE = "MELEE",
  RANGED = "RANGED",
}

export enum Position {
  TOP = "TOP",
  JUNGLE = "JUNGLE",
  MIDDLE = "MIDDLE",
  BOTTOM = "BOTTOM",
  SUPPORT = "SUPPORT",
}

export enum Role {
  TANK = "TANK",
  FIGHTER = "FIGHTER",
  MAGE = "MAGE",
  MARKSMAN = "MARKSMAN",
  SUPPORT = "SUPPORT",
  WARDEN = "WARDEN",
  VANGUARD = "VANGUARD",
  JUGGERNAUT = "JUGGERNAUT",
  CONTROLLER = "CONTROLLER",
  SKIRMISHER = "SKIRMISHER",
  DIVER = "DIVER",
  SLAYER = "SLAYER",
  BURST = "BURST",
  BATTLEMAGE = "BATTLEMAGE",
  ENCHANTER = "ENCHANTER",
  CATCHER = "CATCHER",
  ASSASSIN = "ASSASSIN",
  SPECIALIST = "SPECIALIST",
  ARTILLERY = "ARTILLERY",
}

export interface Stats {
  health: Health;
  healthRegen: HealthRegen;
  mana: Mana;
  manaRegen: ManaRegen;
  armor: Armor;
  magicResistance: MagicResistance;
  attackDamage: AttackDamage;
  movespeed: Movespeed;
  acquisitionRadius: Stat;
  selectionRadius: Stat;
  pathingRadius: Stat;
  gameplayRadius: Stat;
  criticalStrikeDamage: Stat;
  criticalStrikeDamageModifier: Stat;
  attackSpeed: AttackSpeed;
  attackSpeedRatio: Stat;
  attackCastTime: Stat;
  attackTotalTime: Stat;
  attackDelayOffset: Stat;
  attackRange: AttackRange;
  aramDamageTaken: Stat;
  aramDamageDealt: Stat;
  aramHealing: Stat;
  aramShielding: Stat;
  aramTenacity: Stat;
  aramAbilityHaste: Stat;
  aramAttackSpeed: Stat;
  aramEnergyRegen: Stat;
  urfDamageTaken: Stat;
  urfDamageDealt: Stat;
  urfHealing: Stat;
  urfShielding: Stat;
}

export interface AttributeRatings {
  damage: number;
  toughness: number;
  control: number;
  mobility: number;
  utility: number;
  abilityReliance: number;
  difficulty: number;
}

export interface Modifier {
  values: (number | number)[];
  units: string[];
}

export interface Cooldown {
  modifiers: Modifier[];
  affectedByCdr: boolean;
}

export interface Cost {
  modifiers: Modifier[];
}

export interface Leveling {
  attribute: string;
  modifiers: Modifier[];
}

export interface Effect {
  description: string;
  leveling: Leveling[];
}

export interface Ability {
  name: string;
  icon: string;
  effects: Effect[];
  cost: Cost;
  cooldown: Cooldown;
  targeting: string;
  affects: string;
  spellshieldable: string;
  resource: Resource;
  damageType: DamageType;
  spellEffects: string;
  projectile: string;
  onHitEffects: string;
  occurrence: string;
  notes: string;
  blurb: string;
  missileSpeed: string;
  rechargeRate: string;
  collisionRadius: string;
  tetherRadius: string;
  onTargetCdStatic: string;
  innerRadius: string;
  speed: string;
  width: string;
  angle: string;
  castTime: string;
  effectRadius: string;
  targetRange: string;
}

export interface Price {
  blueEssence: number;
  rp: number;
  saleRp: number;
}

export interface Description {
  description: string;
  region: string;
}

export interface Rarities {
  rarity: number;
  region: string;
}

export interface Chroma {
  name: string;
  id: string | number;
  chromaPath: string;
  colors: any[];
  descriptions: Description[];
  rarities: Rarities[];
}

export interface Skin {
  name: string;
  id: number;
  isBase: boolean;
  availability: string;
  formatName: string;
  lootEligible: boolean;
  cost: string;
  sale: number;
  distribution: string;
  rarity: string;
  chromas: Chroma[];
  lore: string;
  release: number;
  set: any[];
  splashPath: string;
  uncenteredSplashPath: string;
  tilePath: string;
  loadScreenPath: string;
  loadScreenVintagePath: string;
  newEffects: boolean;
  newAnimations: boolean;
  newRecall: boolean;
  newVoice: boolean;
  newQuotes: boolean;
  voiceActor: any[];
  splashArtist: any[];
}

export interface Champion {
  id: number;
  key: string;
  name: string;
  title: string;
  fullName: string;
  icon: string;
  resource: Resource;
  attackType: AttackType;
  adaptiveType: DamageType;
  stats: Stats;
  positions: Position[];
  roles: Role[];
  attributeRatings: AttributeRatings;
  abilities: Record<string, Ability[]>;
  releaseDate: string;
  releasePatch: string;
  patchLastChanged: string;
  price: Price;
  lore: string;
  faction: string;
  skins: Skin[];
}
