/* =========================================
   SAKURA CHRONICLES - DATABASE
   Game Assets & Configuration
   ========================================= */

// ===========================
// HERO DATABASE
// ===========================

const HEROES_DATABASE = [
    // ===== NORMAL (N) =====
    { id: 'h001', name: 'Yuki', rarity: 'N', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 450, atk: 35, def: 25, spd: 105 },
      ultimate: { name: 'Healing Rain', manaReq: 100, desc: 'Restores moderate HP to all allies.' }
    },
    { id: 'h002', name: 'Sora', rarity: 'N', element: 'Wind', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 400, atk: 55, def: 20, spd: 115 },
      ultimate: { name: 'Swift Strike', manaReq: 100, desc: 'Deals heavy damage to a single target.' }
    },
    { id: 'h003', name: 'Haru', rarity: 'N', element: 'Fire', class: 'Tank', gender: 'M',
      baseStats: { hp: 650, atk: 40, def: 55, spd: 95 },
      ultimate: { name: 'Iron Wall', manaReq: 100, desc: 'Increases own Defense by 50%.' }
    },
    { id: 'h004', name: 'Mio', rarity: 'N', element: 'Light', class: 'Buffer', gender: 'F',
      baseStats: { hp: 420, atk: 40, def: 25, spd: 110 },
      ultimate: { name: 'Blessing', manaReq: 100, desc: 'Increases Attack of all allies.' }
    },
    { id: 'h005', name: 'Kenji', rarity: 'N', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 410, atk: 58, def: 22, spd: 108 },
      ultimate: { name: 'Shadow Slash', manaReq: 100, desc: 'High crit chance attack.' }
    },

    // ===== RARE (R) =====
    { id: 'h011', name: 'Hikari', rarity: 'R', element: 'Light', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 500, atk: 75, def: 35, spd: 112 },
      ultimate: { name: 'Holy Beam', manaReq: 100, desc: 'Deals massive Light damage to one foe.' }
    },
    { id: 'h012', name: 'Akira', rarity: 'R', element: 'Fire', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 480, atk: 70, def: 30, spd: 108 },
      ultimate: { name: 'Inferno Burst', manaReq: 100, desc: 'Deals Fire damage to all enemies.' }
    },
    { id: 'h013', name: 'Mizuki', rarity: 'R', element: 'Water', class: 'Healer', gender: 'F',
      baseStats: { hp: 550, atk: 45, def: 40, spd: 105 },
      ultimate: { name: 'Ocean Embrace', manaReq: 100, desc: 'Heals all allies and removes debuffs.' }
    },
    { id: 'h014', name: 'Ren', rarity: 'R', element: 'Wind', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 490, atk: 78, def: 35, spd: 120 },
      ultimate: { name: 'Tempest Blade', manaReq: 100, desc: 'Attacks twice with high speed.' }
    },
    { id: 'h016', name: 'Kaito', rarity: 'R', element: 'Fire', class: 'Tank', gender: 'M',
      baseStats: { hp: 800, atk: 50, def: 65, spd: 90 },
      ultimate: { name: 'Magma Shield', manaReq: 100, desc: 'Taunts enemies and raises Defense.' }
    },

    // ===== SUPER RARE (SR) =====
    { id: 'h021', name: 'Ayame', rarity: 'SR', element: 'Fire', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 650, atk: 105, def: 45, spd: 115 },
      ultimate: { name: 'Phoenix Dance', manaReq: 100, desc: 'Massive Fire damage + Burn effect.' }
    },
    { id: 'h023', name: 'Ryota', rarity: 'SR', element: 'Wind', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 600, atk: 115, def: 42, spd: 125 },
      ultimate: { name: 'Cyclone Fury', manaReq: 100, desc: 'Wind damage that ignores 50% Defense.' }
    },
    { id: 'h024', name: 'Hinata', rarity: 'SR', element: 'Light', class: 'Buffer', gender: 'F',
      baseStats: { hp: 620, atk: 70, def: 50, spd: 110 },
      ultimate: { name: 'Divine Aura', manaReq: 100, desc: 'Greatly boosts ATK and DEF of team.' }
    },
    { id: 'h025', name: 'Kuro', rarity: 'SR', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 610, atk: 112, def: 45, spd: 118 },
      ultimate: { name: 'Void Reaper', manaReq: 100, desc: 'Executes enemies below 30% HP.' }
    },
    { id: 'h026', name: 'Natsuki', rarity: 'SR', element: 'Fire', class: 'Tank', gender: 'F',
      baseStats: { hp: 950, atk: 65, def: 85, spd: 95 },
      ultimate: { name: 'Molten Core', manaReq: 100, desc: 'Becomes invincible for 1 turn.' }
    },

    // ===== SSR =====
    { id: 'h031', name: 'Miyuki', rarity: 'SSR', element: 'Water', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 800, atk: 145, def: 60, spd: 120 },
      ultimate: { name: 'Frozen Eternity', manaReq: 100, desc: 'Freezes all enemies for 1 turn.' }
    },
    { id: 'h032', name: 'Takumi', rarity: 'SSR', element: 'Fire', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 780, atk: 155, def: 55, spd: 122 },
      ultimate: { name: 'Dragon Wrath', manaReq: 100, desc: 'Extreme Fire damage to one target.' }
    },
    { id: 'h033', name: 'Kohana', rarity: 'SSR', element: 'Wind', class: 'Healer', gender: 'F',
      baseStats: { hp: 850, atk: 80, def: 70, spd: 115 },
      ultimate: { name: 'Nature\'s Breath', manaReq: 100, desc: 'Fully heals team and adds Regen.' }
    },
    { id: 'h037', name: 'Isami', rarity: 'SSR', element: 'Water', class: 'Tank', gender: 'F',
      baseStats: { hp: 1200, atk: 85, def: 105, spd: 98 },
      ultimate: { name: 'Tidal Fortress', manaReq: 100, desc: 'Absorbs all team damage for 2 turns.' }
    },
    { id: 'h040', name: 'Yuna', rarity: 'SSR', element: 'Dark', class: 'DPS (Single)', gender: 'F',
      baseStats: { hp: 760, atk: 160, def: 52, spd: 128 },
      ultimate: { name: 'Soul Shatter', manaReq: 100, desc: 'Damage scales with enemy missing HP.' }
    },

    // ===== ULTRA RARE (UR) =====
    { id: 'h041', name: 'Amaterasu', rarity: 'UR', element: 'Light', class: 'DPS (AoE)', gender: 'F',
      baseStats: { hp: 1000, atk: 200, def: 85, spd: 135 },
      ultimate: { name: 'Solar Flare', manaReq: 100, desc: 'Apocalyptic Light damage to all foes.' }
    },
    { id: 'h042', name: 'Tsukuyomi', rarity: 'UR', element: 'Dark', class: 'DPS (Single)', gender: 'M',
      baseStats: { hp: 950, atk: 215, def: 75, spd: 140 },
      ultimate: { name: 'Lunar Eclipse', manaReq: 100, desc: 'Stops time (Enemy skips turn).' }
    },
    { id: 'h043', name: 'Susanoo', rarity: 'UR', element: 'Wind', class: 'DPS (AoE)', gender: 'M',
      baseStats: { hp: 980, atk: 205, def: 80, spd: 138 },
      ultimate: { name: 'Storm God', manaReq: 100, desc: 'Massive Wind dmg + 100% Crit Rate.' }
    }
];

// ===========================
// ENEMY DATABASE
// ===========================

const ENEMIES_DATABASE = [
    // Tier 1 (Waves 1-10)
    { id: 'e001', name: 'Slime', element: 'Water', baseStats: { hp: 150, atk: 20, def: 10, spd: 90 } },
    { id: 'e002', name: 'Fire Imp', element: 'Fire', baseStats: { hp: 180, atk: 25, def: 12, spd: 95 } },
    { id: 'e003', name: 'Wind Wisp', element: 'Wind', baseStats: { hp: 140, atk: 22, def: 8, spd: 110 } },
    { id: 'e004', name: 'Shadow Bat', element: 'Dark', baseStats: { hp: 160, atk: 28, def: 10, spd: 115 } },
    
    // Tier 2 (Waves 11-25)
    { id: 'e006', name: 'Oni Warrior', element: 'Fire', baseStats: { hp: 400, atk: 55, def: 30, spd: 100 } },
    { id: 'e007', name: 'Ice Golem', element: 'Water', baseStats: { hp: 600, atk: 40, def: 50, spd: 80 } },
    { id: 'e009', name: 'Void Wraith', element: 'Dark', baseStats: { hp: 350, atk: 65, def: 25, spd: 120 } },
    
    // Tier 3 (Waves 26-40)
    { id: 'e011', name: 'Demon Samurai', element: 'Dark', baseStats: { hp: 800, atk: 110, def: 60, spd: 125 } },
    { id: 'e012', name: 'Flame Dragon', element: 'Fire', baseStats: { hp: 1200, atk: 130, def: 80, spd: 110 } },
    
    // Bosses
    { id: 'e016', name: 'Infernal Overlord', element: 'Fire', baseStats: { hp: 2500, atk: 180, def: 100, spd: 130 } },
    { id: 'e017', name: 'Leviathan', element: 'Water', baseStats: { hp: 3000, atk: 160, def: 120, spd: 115 } }
];

// ===========================
// ITEM DATABASES
// ===========================

const GARDEN_ITEMS_DATABASE = {
    seeds: [
        { id: 's001', name: 'Sakura Seed', emoji: '🌸', growthTime: 10000, resultId: 't001', desc: 'Fast growing healing herb.' },
        { id: 's002', name: 'Matcha Seed', emoji: '🍵', growthTime: 30000, resultId: 't002', desc: 'Takes time, yields power.' },
        { id: 's003', name: 'Dragon Seed', emoji: '🐲', growthTime: 60000, resultId: 't003', desc: 'Rare seed with potent magic.' }
    ],
    teas: [
        { id: 't001', name: 'Sakura Tea', emoji: '🌸', desc: 'Heal 30% HP', effectType: 'heal', effectValue: 0.3 },
        { id: 't002', name: 'Matcha Brew', emoji: '🍵', desc: '+20% ATK Buff', effectType: 'buff_atk', effectValue: 0.2 },
        { id: 't003', name: 'Dragon Elixir', emoji: '🧪', desc: 'Execute low HP enemies', effectType: 'execute', effectValue: 0.3 }
    ]
};

// NEW: FORGE DATA (For Future Implementation)
const FORGE_DATABASE = {
    materials: [
        { id: 'm001', name: 'Iron Ore', rarity: 'N', desc: 'Common crafting metal.' },
        { id: 'm002', name: 'Spirit Dust', rarity: 'R', desc: 'Glowing magical powder.' },
        { id: 'm003', name: 'Mithril', rarity: 'SR', desc: 'Incredibly light and strong.' },
        { id: 'm004', name: 'Star Fragment', rarity: 'SSR', desc: 'Fallen from the cosmos.' }
    ],
    recipes: [
        { id: 'r001', resultId: 'w002', name: 'Flame Blade', cost: 1000, materials: { 'm001': 10, 'm002': 2 } },
        { id: 'r002', resultId: 'a003', name: 'Dragon Scale', cost: 5000, materials: { 'm001': 50, 'm003': 5 } }
    ]
};

// ===========================
// CONFIGURATION
// ===========================

const ELEMENT_ADVANTAGE = {
    'Fire': { strong: 'Wind', weak: 'Water' },
    'Water': { strong: 'Fire', weak: 'Wind' },
    'Wind': { strong: 'Water', weak: 'Fire' },
    'Light': { strong: 'Dark', weak: 'Dark' },
    'Dark': { strong: 'Light', weak: 'Light' }
};