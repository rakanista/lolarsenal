export type Number = number;

export enum DamageType {
  PHYSICAL_DAMAGE = "PHYSICAL_DAMAGE",
  MAGIC_DAMAGE = "MAGIC_DAMAGE",
  TRUE_DAMAGE = "TRUE_DAMAGE",
  PURE_DAMAGE = "PURE_DAMAGE",
  MIXED_DAMAGE = "MIXED_DAMAGE",
  OTHER_DAMAGE = "OTHER_DAMAGE",
}

export interface Stat {
  flat: Number;
  percent: Number;
  perLevel: Number;
  percentPerLevel: Number;
  percentBase: Number;
  percentBonus: Number;
}

export class StatImpl implements Stat {
  flat: Number = 0.0;
  percent: Number = 0.0;
  perLevel: Number = 0.0;
  percentPerLevel: Number = 0.0;
  percentBase: Number = 0.0;
  percentBonus: Number = 0.0;

  constructor(data?: Partial<Stat>) {
    if (data) {
      this.flat = data.flat ?? 0.0;
      this.percent = data.percent ?? 0.0;
      this.perLevel = data.perLevel ?? 0.0;
      this.percentPerLevel = data.percentPerLevel ?? 0.0;
      this.percentBase = data.percentBase ?? 0.0;
      this.percentBonus = data.percentBonus ?? 0.0;
    }
  }

  private static growStat(
    base: number,
    perLevel: number,
    level: number
  ): number {
    return base + perLevel * (level - 1) * (0.7025 + 0.0175 * (level - 1));
  }

  total(level: number): number {
    const base = StatImpl.growStat(this.flat, this.perLevel, level);
    let total =
      (base * (1.0 + this.percentBase) + this.flat + this.perLevel * level) *
      (1.0 + this.percent + this.percentPerLevel * level);
    const bonus = total - base;
    total += this.percentBonus * bonus;
    return total;
  }

  add(other: Stat): StatImpl {
    return new StatImpl({
      flat: this.flat + other.flat,
      percent: this.percent + other.percent,
      perLevel: this.perLevel + other.perLevel,
      percentPerLevel: this.percentPerLevel + other.percentPerLevel,
      percentBase: this.percentBase + other.percentBase,
      percentBonus: this.percentBonus + other.percentBonus,
    });
  }

  subtract(other: Stat): StatImpl {
    return new StatImpl({
      flat: this.flat - other.flat,
      percent: this.percent - other.percent,
      perLevel: this.perLevel - other.perLevel,
      percentPerLevel: this.percentPerLevel - other.percentPerLevel,
      percentBase: this.percentBase - other.percentBase,
      percentBonus: this.percentBonus - other.percentBonus,
    });
  }
}

// Specific stat types
export type Health = Stat;
export type HealthRegen = Stat;
export type Mana = Stat;
export type ManaRegen = Stat;
export type Armor = Stat;
export type MagicResistance = Stat;
export type AttackDamage = Stat;
export type AbilityPower = Stat;
export type Movespeed = Stat;
export type CriticalStrikeChance = Stat;
export type AttackSpeed = Stat;
export type Lethality = Stat;
export type AttackRange = Stat;
export type CooldownReduction = Stat;
export type GoldPer10 = Stat;
export type HealAndShieldPower = Stat;
export type Lifesteal = Stat;
export type MagicPenetration = Stat;
export type ArmorPenetration = Stat;
export type AbilityHaste = Stat;
export type OmniVamp = Stat;
export type Tenacity = Stat;
export type CriticalStrikeDamage = Stat;
