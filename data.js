/* ===========================
   SAKURA CHRONICLES - DATA
   Hero and Enemy Databases
   =========================== */

// ===========================
// HERO DATABASE (50+ Heroes)
// ===========================

const HEROES_DATABASE = [
    // ===== NORMAL (N) =====
    { id: 'h001', name: 'Yuki', rarity: 'N', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 400, atk: 30, def: 25, spd: 40 },
      ultimate: { name: 'Healing Rain', manaReq: 100, desc: 'Heals all allies for 150 HP' }
    },
    { id: 'h002', name: 'Sora', rarity: 'N', element: 'Wind', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 350, atk: 50, def: 20, spd: 60 },
      ultimate: { name: 'Swift Strike', manaReq: 100, desc: 'Deals 200% ATK to one enemy' }
    },
    { id: 'h003', name: 'Haru', rarity: 'N', element: 'Fire', class: 'Tank', gender: 'M',
      baseStats: { hp: 600, atk: 35, def: 50, spd: 30 },
      ultimate: { name: 'Iron Wall', manaReq: 100, desc: 'Increases team DEF by 30% for 3 turns' }
    },
    { id: 'h004', name: 'Mio', rarity: 'N', element: 'Light', class: 'Buffer', gender: 'F',
      baseStats: { hp: 380, atk: 35, def: 25, spd: 45 },
      ultimate: { name: 'Blessing', manaReq: 100, desc: 'Increases team ATK by 25% for 3 turns' }
    },
    { id: 'h005', name: 'Kenji', rarity: 'N', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 370, atk: 48, def: 22, spd: 55 },
      ultimate: { name: 'Shadow Slash', manaReq: 100, desc: 'Deals 180% ATK with 30% crit chance' }
    },
    { id: 'h006', name: 'Nami', rarity: 'N', element: 'Water', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 360, atk: 40, def: 20, spd: 50 },
      ultimate: { name: 'Tidal Wave', manaReq: 100, desc: 'Deals 120% ATK to all enemies' }
    },
    { id: 'h007', name: 'Takeshi', rarity: 'N', element: 'Fire', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 380, atk: 52, def: 24, spd: 48 },
      ultimate: { name: 'Flame Strike', manaReq: 100, desc: 'Deals 190% ATK damage' }
    },
    { id: 'h008', name: 'Emi', rarity: 'N', element: 'Wind', class: 'Healer', gender: 'F',
      baseStats: { hp: 390, atk: 28, def: 26, spd: 52 },
      ultimate: { name: 'Gentle Breeze', manaReq: 100, desc: 'Heals one ally for 300 HP' }
    },
    { id: 'h009', name: 'Daichi', rarity: 'N', element: 'Light', class: 'Tank', gender: 'M',
      baseStats: { hp: 580, atk: 32, def: 48, spd: 32 },
      ultimate: { name: 'Guardian Shield', manaReq: 100, desc: 'Takes 50% less damage for 2 turns' }
    },
    { id: 'h010', name: 'Kana', rarity: 'N', element: 'Dark', class: 'Buffer', gender: 'F',
      baseStats: { hp: 370, atk: 36, def: 24, spd: 46 },
      ultimate: { name: 'Dark Pact', manaReq: 100, desc: 'Increases team SPD by 20%' }
    },

    // ===== RARE (R) =====
    { id: 'h011', name: 'Hikari', rarity: 'R', element: 'Light', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 450, atk: 70, def: 30, spd: 65 },
      ultimate: { name: 'Holy Beam', manaReq: 100, desc: 'Deals 250% ATK light damage' }
    },
    { id: 'h012', name: 'Akira', rarity: 'R', element: 'Fire', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 420, atk: 65, def: 28, spd: 60 },
      ultimate: { name: 'Inferno Burst', manaReq: 100, desc: 'Deals 150% ATK to all enemies' }
    },
    { id: 'h013', name: 'Mizuki', rarity: 'R', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 480, atk: 40, def: 35, spd: 55 },
      ultimate: { name: 'Ocean\'s Embrace', manaReq: 100, desc: 'Heals all allies for 200 HP' }
    },
    { id: 'h014', name: 'Ren', rarity: 'R', element: 'Wind', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 430, atk: 68, def: 32, spd: 70 },
      ultimate: { name: 'Tempest Blade', manaReq: 100, desc: 'Deals 240% ATK with 20% dodge' }
    },
    { id: 'h015', name: 'Yui', rarity: 'R', element: 'Dark', class: 'Buffer', gender: 'F',
      baseStats: { hp: 440, atk: 50, def: 30, spd: 58 },
      ultimate: { name: 'Void Enchantment', manaReq: 100, desc: 'Increases team crit rate by 15%' }
    },
    { id: 'h016', name: 'Kaito', rarity: 'R', element: 'Fire', class: 'Tank', gender: 'M',
      baseStats: { hp: 700, atk: 45, def: 60, spd: 35 },
      ultimate: { name: 'Blazing Fortress', manaReq: 100, desc: 'Absorbs damage for allies' }
    },
    { id: 'h017', name: 'Sakura', rarity: 'R', element: 'Wind', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 410, atk: 62, def: 28, spd: 68 },
      ultimate: { name: 'Cherry Blossom Storm', manaReq: 100, desc: 'Deals 140% ATK to all' }
    },
    { id: 'h018', name: 'Riku', rarity: 'R', element: 'Water', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 440, atk: 66, def: 30, spd: 62 },
      ultimate: { name: 'Riptide Slash', manaReq: 100, desc: 'Deals 230% ATK water damage' }
    },
    { id: 'h019', name: 'Mei', rarity: 'R', element: 'Light', class: 'Healer', gender: 'F',
      baseStats: { hp: 470, atk: 38, def: 36, spd: 54 },
      ultimate: { name: 'Radiant Heal', manaReq: 100, desc: 'Heals and removes debuffs' }
    },
    { id: 'h020', name: 'Shinji', rarity: 'R', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 430, atk: 70, def: 28, spd: 64 },
      ultimate: { name: 'Shadow Execution', manaReq: 100, desc: 'Deals 260% ATK to weakened foes' }
    },

    // ===== SUPER RARE (SR) =====
    { id: 'h021', name: 'Ayame', rarity: 'SR', element: 'Fire', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 550, atk: 95, def: 40, spd: 75 },
      ultimate: { name: 'Phoenix Dance', manaReq: 100, desc: 'Deals 180% ATK to all, burns enemies' }
    },
    { id: 'h022', name: 'Kaori', rarity: 'SR', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 600, atk: 55, def: 50, spd: 65 },
      ultimate: { name: 'Mystic Fountain', manaReq: 100, desc: 'Heals all for 300 HP, cures status' }
    },
    { id: 'h023', name: 'Ryota', rarity: 'SR', element: 'Wind', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 520, atk: 100, def: 38, spd: 85 },
      ultimate: { name: 'Cyclone Fury', manaReq: 100, desc: 'Deals 300% ATK with 40% crit' }
    },
    { id: 'h024', name: 'Hinata', rarity: 'SR', element: 'Light', class: 'Buffer', gender: 'F',
      baseStats: { hp: 540, atk: 65, def: 45, spd: 70 },
      ultimate: { name: 'Divine Blessing', manaReq: 100, desc: 'Boosts all stats by 30% for 3 turns' }
    },
    { id: 'h025', name: 'Kuro', rarity: 'SR', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 530, atk: 98, def: 40, spd: 80 },
      ultimate: { name: 'Void Reaper', manaReq: 100, desc: 'Deals 320% ATK, ignores 30% DEF' }
    },
    { id: 'h026', name: 'Natsuki', rarity: 'SR', element: 'Fire', class: 'Tank', gender: 'F',
      baseStats: { hp: 850, atk: 60, def: 75, spd: 45 },
      ultimate: { name: 'Molten Barrier', manaReq: 100, desc: 'Redirects damage, counters attackers' }
    },
    { id: 'h027', name: 'Haruto', rarity: 'SR', element: 'Water', class: 'DPS (AoE)', gender: 'M',
      baseStats: { hp: 540, atk: 92, def: 42, spd: 72 },
      ultimate: { name: 'Tsunami Crash', manaReq: 100, desc: 'Deals 170% ATK to all, slows enemies' }
    },
    { id: 'h028', name: 'Asuka', rarity: 'SR', element: 'Wind', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 510, atk: 96, def: 38, spd: 88 },
      ultimate: { name: 'Gale Force Strike', manaReq: 100, desc: 'Deals 290% ATK, grants SPD buff' }
    },
    { id: 'h029', name: 'Yuto', rarity: 'SR', element: 'Light', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 530, atk: 94, def: 40, spd: 76 },
      ultimate: { name: 'Judgement Ray', manaReq: 100, desc: 'Deals 310% ATK to dark enemies' }
    },
    { id: 'h030', name: 'Reina', rarity: 'SR', element: 'Dark', class: 'Buffer', gender: 'F',
      baseStats: { hp: 520, atk: 70, def: 42, spd: 74 },
      ultimate: { name: 'Shadow Pact', manaReq: 100, desc: 'Sacrifices HP to boost team ATK 50%' }
    },

    // ===== SUPER SUPER RARE (SSR) =====
    { id: 'h031', name: 'Miyuki', rarity: 'SSR', element: 'Water', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 680, atk: 135, def: 55, spd: 90 },
      ultimate: { name: 'Frozen Eternity', manaReq: 100, desc: 'Deals 220% ATK to all, freezes enemies' }
    },
    { id: 'h032', name: 'Takumi', rarity: 'SSR', element: 'Fire', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 650, atk: 145, def: 50, spd: 95 },
      ultimate: { name: 'Dragon\'s Wrath', manaReq: 100, desc: 'Deals 400% ATK, burns target' }
    },
    { id: 'h033', name: 'Kohana', rarity: 'SSR', element: 'Wind', class: 'Healer', gender: 'F',
      baseStats: { hp: 720, atk: 70, def: 65, spd: 85 },
      ultimate: { name: 'Celestial Sanctuary', manaReq: 100, desc: 'Heals all 450 HP, grants shield' }
    },
    { id: 'h034', name: 'Akane', rarity: 'SSR', element: 'Light', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 660, atk: 140, def: 52, spd: 92 },
      ultimate: { name: 'Divine Punishment', manaReq: 100, desc: 'Deals 420% ATK holy damage' }
    },
    { id: 'h035', name: 'Ryo', rarity: 'SSR', element: 'Dark', class: 'DPS (AoE)', gender: 'M',
      baseStats: { hp: 640, atk: 138, def: 48, spd: 88 },
      ultimate: { name: 'Oblivion Storm', manaReq: 100, desc: 'Deals 200% ATK to all, drains HP' }
    },
    { id: 'h036', name: 'Chiyo', rarity: 'SSR', element: 'Fire', class: 'Buffer', gender: 'F',
      baseStats: { hp: 670, atk: 85, def: 58, spd: 82 },
      ultimate: { name: 'Crimson Empowerment', manaReq: 100, desc: 'Boosts team ATK 60% for 4 turns' }
    },
    { id: 'h037', name: 'Isamu', rarity: 'SSR', element: 'Water', class: 'Tank', gender: 'M',
      baseStats: { hp: 1050, atk: 75, def: 95, spd: 55 },
      ultimate: { name: 'Oceanic Bulwark', manaReq: 100, desc: 'Becomes invincible for 2 turns' }
    },
    { id: 'h038', name: 'Satsuki', rarity: 'SSR', element: 'Wind', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 630, atk: 142, def: 50, spd: 100 },
      ultimate: { name: 'Lightning Flash', manaReq: 100, desc: 'Deals 380% ATK, strikes twice' }
    },
    { id: 'h039', name: 'Kazuki', rarity: 'SSR', element: 'Light', class: 'Buffer', gender: 'M',
      baseStats: { hp: 680, atk: 80, def: 60, spd: 86 },
      ultimate: { name: 'Radiant Aura', manaReq: 100, desc: 'Team becomes immune to debuffs' }
    },
    { id: 'h040', name: 'Yuna', rarity: 'SSR', element: 'Dark', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 650, atk: 148, def: 48, spd: 94 },
      ultimate: { name: 'Soul Shatter', manaReq: 100, desc: 'Deals 440% ATK, steals 20% HP' }
    },

    // ===== ULTRA RARE (UR) =====
    { id: 'h041', name: 'Amaterasu', rarity: 'UR', element: 'Light', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 800, atk: 180, def: 75, spd: 110 },
      ultimate: { name: 'Solar Flare', manaReq: 100, desc: 'Deals 280% ATK to all, blinds enemies' }
    },
    { id: 'h042', name: 'Tsukuyomi', rarity: 'UR', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 750, atk: 195, def: 65, spd: 115 },
      ultimate: { name: 'Lunar Eclipse', manaReq: 100, desc: 'Deals 550% ATK, resets cooldowns' }
    },
    { id: 'h043', name: 'Susanoo', rarity: 'UR', element: 'Wind', class: 'DPS (AoE)', gender: 'M',
      baseStats: { hp: 780, atk: 185, def: 70, spd: 120 },
      ultimate: { name: 'Storm God\'s Fury', manaReq: 100, desc: 'Deals 260% ATK to all, crits always' }
    },
    { id: 'h044', name: 'Izanami', rarity: 'UR', element: 'Dark', class: 'Healer', gender: 'F',
      baseStats: { hp: 900, atk: 95, def: 85, spd: 100 },
      ultimate: { name: 'Resurrection', manaReq: 100, desc: 'Revives dead ally with 50% HP' }
    },
    { id: 'h045', name: 'Raijin', rarity: 'UR', element: 'Wind', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 760, atk: 190, def: 68, spd: 125 },
      ultimate: { name: 'Thunder God Strike', manaReq: 100, desc: 'Deals 600% ATK lightning damage' }
    },
    { id: 'h046', name: 'Fujin', rarity: 'UR', element: 'Wind', class: 'Buffer', gender: 'M',
      baseStats: { hp: 820, atk: 110, def: 75, spd: 105 },
      ultimate: { name: 'Divine Wind', manaReq: 100, desc: 'Team gains 100% SPD and evasion' }
    },
    { id: 'h047', name: 'Kaguya', rarity: 'UR', element: 'Light', class: 'Buffer', gender: 'F',
      baseStats: { hp: 850, atk: 100, def: 80, spd: 95 },
      ultimate: { name: 'Celestial Grace', manaReq: 100, desc: 'Team gains immortality for 1 turn' }
    },
    { id: 'h048', name: 'Orochi', rarity: 'UR', element: 'Water', class: 'DPS (AoE)', gender: 'M',
      baseStats: { hp: 790, atk: 188, def: 72, spd: 108 },
      ultimate: { name: 'Eight-Headed Devastation', manaReq: 100, desc: 'Attacks all enemies 8 times' }
    },
    { id: 'h049', name: 'Inari', rarity: 'UR', element: 'Fire', class: 'Buffer', gender: 'F',
      baseStats: { hp: 840, atk: 105, def: 78, spd: 102 },
      ultimate: { name: 'Fox Fire Blessing', manaReq: 100, desc: 'Team gains 80% crit damage' }
    },
    { id: 'h050', name: 'Benzaiten', rarity: 'UR', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 880, atk: 90, def: 82, spd: 98 },
      ultimate: { name: 'Ocean\'s Blessing', manaReq: 100, desc: 'Heals all to full, grants regen' }
    },

    // ===== ADDITIONAL HEROES (to reach 50+) =====
    { id: 'h051', name: 'Aiko', rarity: 'R', element: 'Fire', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 440, atk: 72, def: 30, spd: 66 },
      ultimate: { name: 'Flame Dancer', manaReq: 100, desc: 'Deals 245% ATK fire damage' }
    },
    { id: 'h052', name: 'Masato', rarity: 'SR', element: 'Light', class: 'Tank', gender: 'M',
      baseStats: { hp: 820, atk: 62, def: 72, spd: 48 },
      ultimate: { name: 'Holy Bastion', manaReq: 100, desc: 'Protects team from fatal damage' }
    },
    { id: 'h053', name: 'Hanako', rarity: 'R', element: 'Water', class: 'Buffer', gender: 'F',
      baseStats: { hp: 460, atk: 48, def: 34, spd: 60 },
      ultimate: { name: 'Tidal Boost', manaReq: 100, desc: 'Increases team crit rate by 20%' }
    },
    { id: 'h054', name: 'Takeshi', rarity: 'SR', element: 'Dark', class: 'DPS (AoE)', gender: 'M',
      baseStats: { hp: 560, atk: 90, def: 44, spd: 78 },
      ultimate: { name: 'Shadow Explosion', manaReq: 100, desc: 'Deals 175% ATK to all' }
    },
    { id: 'h055', name: 'Momoka', rarity: 'SSR', element: 'Fire', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 670, atk: 144, def: 54, spd: 96 },
      ultimate: { name: 'Infernal Strike', manaReq: 100, desc: 'Deals 410% ATK, leaves burn' }
    }
];

// ===========================
// ENEMY DATABASE (20+ Enemies)
// ===========================

const ENEMIES_DATABASE = [
    // Basic Enemies (Waves 1-10)
    { id: 'e001', name: 'Slime', element: 'Water', 
      baseStats: { hp: 100, atk: 15, def: 5, spd: 20 }
    },
    { id: 'e002', name: 'Fire Imp', element: 'Fire', 
      baseStats: { hp: 120, atk: 20, def: 8, spd: 25 }
    },
    { id: 'e003', name: 'Wind Wisp', element: 'Wind', 
      baseStats: { hp: 90, atk: 18, def: 5, spd: 35 }
    },
    { id: 'e004', name: 'Shadow Bat', element: 'Dark', 
      baseStats: { hp: 110, atk: 22, def: 6, spd: 40 }
    },
    { id: 'e005', name: 'Light Fairy', element: 'Light', 
      baseStats: { hp: 95, atk: 16, def: 7, spd: 30 }
    },

    // Intermediate Enemies (Waves 11-30)
    { id: 'e006', name: 'Oni Warrior', element: 'Fire', 
      baseStats: { hp: 250, atk: 40, def: 20, spd: 35 }
    },
    { id: 'e007', name: 'Ice Golem', element: 'Water', 
      baseStats: { hp: 400, atk: 30, def: 35, spd: 20 }
    },
    { id: 'e008', name: 'Storm Eagle', element: 'Wind', 
      baseStats: { hp: 200, atk: 45, def: 15, spd: 60 }
    },
    { id: 'e009', name: 'Void Wraith', element: 'Dark', 
      baseStats: { hp: 220, atk: 48, def: 18, spd: 50 }
    },
    { id: 'e010', name: 'Radiant Knight', element: 'Light', 
      baseStats: { hp: 280, atk: 42, def: 28, spd: 38 }
    },

    // Advanced Enemies (Waves 31-50)
    { id: 'e011', name: 'Demon Samurai', element: 'Dark', 
      baseStats: { hp: 500, atk: 80, def: 40, spd: 55 }
    },
    { id: 'e012', name: 'Flame Dragon', element: 'Fire', 
      baseStats: { hp: 600, atk: 90, def: 50, spd: 45 }
    },
    { id: 'e013', name: 'Kraken', element: 'Water', 
      baseStats: { hp: 700, atk: 75, def: 55, spd: 40 }
    },
    { id: 'e014', name: 'Tempest Titan', element: 'Wind', 
      baseStats: { hp: 550, atk: 85, def: 45, spd: 70 }
    },
    { id: 'e015', name: 'Archangel', element: 'Light', 
      baseStats: { hp: 580, atk: 88, def: 48, spd: 60 }
    },

    // Elite/Boss Enemies (Waves 51+)
    { id: 'e016', name: 'Infernal Overlord', element: 'Fire', 
      baseStats: { hp: 1000, atk: 120, def: 70, spd: 60 }
    },
    { id: 'e017', name: 'Leviathan', element: 'Water', 
      baseStats: { hp: 1200, atk: 110, def: 80, spd: 50 }
    },
    { id: 'e018', name: 'Cyclone Sovereign', element: 'Wind', 
      baseStats: { hp: 950, atk: 130, def: 65, spd: 85 }
    },
    { id: 'e019', name: 'Void Emperor', element: 'Dark', 
      baseStats: { hp: 1100, atk: 135, def: 75, spd: 70 }
    },
    { id: 'e020', name: 'Celestial Seraph', element: 'Light', 
      baseStats: { hp: 1050, atk: 125, def: 78, spd: 75 }
    },

    // Legendary Bosses
    { id: 'e021', name: 'Ancient Phoenix', element: 'Fire', 
      baseStats: { hp: 1500, atk: 150, def: 85, spd: 90 }
    },
    { id: 'e022', name: 'Primordial Hydra', element: 'Water', 
      baseStats: { hp: 1800, atk: 140, def: 95, spd: 65 }
    },
    { id: 'e023', name: 'Storm Deity', element: 'Wind', 
      baseStats: { hp: 1400, atk: 160, def: 80, spd: 100 }
    },
    { id: 'e024', name: 'Abyssal Demon Lord', element: 'Dark', 
      baseStats: { hp: 1600, atk: 170, def: 90, spd: 85 }
    },
    { id: 'e025', name: 'Divine Guardian', element: 'Light', 
      baseStats: { hp: 1550, atk: 155, def: 92, spd: 88 }
    }
];

// ===========================
// ELEMENT ADVANTAGE SYSTEM
// ===========================

const ELEMENT_ADVANTAGE = {
    'Fire': { strong: 'Wind', weak: 'Water' },
    'Water': { strong: 'Fire', weak: 'Wind' },
    'Wind': { strong: 'Water', weak: 'Fire' },
    'Light': { strong: 'Dark', weak: 'Dark' },
    'Dark': { strong: 'Light', weak: 'Light' }
};

// ===========================
// GACHA RATES
// ===========================

const GACHA_RATES = {
    'N': 60.0,
    'R': 25.0,
    'SR': 10.0,
    'SSR': 4.5,
    'UR': 0.5
};

// ===========================
// EQUIPMENT DATABASE
// ===========================

const EQUIPMENT_DATABASE = {
    weapons: [
        { id: 'w001', name: 'Iron Sword', rarity: 'N', stats: { atk: 10 } },
        { id: 'w002', name: 'Flame Blade', rarity: 'R', stats: { atk: 25 }, element: 'Fire' },
        { id: 'w003', name: 'Aqua Staff', rarity: 'R', stats: { atk: 20 }, element: 'Water' },
        { id: 'w004', name: 'Wind Spear', rarity: 'SR', stats: { atk: 40 }, element: 'Wind' },
        { id: 'w005', name: 'Divine Sword', rarity: 'SSR', stats: { atk: 60 }, element: 'Light' },
        { id: 'w006', name: 'Shadow Scythe', rarity: 'SSR', stats: { atk: 65 }, element: 'Dark' },
        { id: 'w007', name: 'Legendary Katana', rarity: 'UR', stats: { atk: 100 } }
    ],
    armor: [
        { id: 'a001', name: 'Cloth Armor', rarity: 'N', stats: { def: 8, hp: 50 } },
        { id: 'a002', name: 'Steel Plate', rarity: 'R', stats: { def: 20, hp: 100 } },
        { id: 'a003', name: 'Dragon Scale', rarity: 'SR', stats: { def: 35, hp: 200 } },
        { id: 'a004', name: 'Holy Vestment', rarity: 'SSR', stats: { def: 50, hp: 300 } },
        { id: 'a005', name: 'Celestial Armor', rarity: 'UR', stats: { def: 80, hp: 500 } }
    ],
    accessories: [
        { id: 'c001', name: 'Bronze Ring', rarity: 'N', stats: { spd: 5 } },
        { id: 'c002', name: 'Silver Pendant', rarity: 'R', stats: { spd: 10, atk: 5 } },
        { id: 'c003', name: 'Gold Bracelet', rarity: 'SR', stats: { spd: 15, atk: 10, def: 10 } },
        { id: 'c004', name: 'Phoenix Feather', rarity: 'SSR', stats: { spd: 25, atk: 20, hp: 100 } },
        { id: 'c005', name: 'Cosmic Orb', rarity: 'UR', stats: { spd: 40, atk: 30, def: 20, hp: 200 } }
    ]
};
