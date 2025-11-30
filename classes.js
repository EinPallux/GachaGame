/* =========================================
   SAKURA CHRONICLES - CORE CLASSES
   Game Logic Models
   ========================================= */

// ===========================
// HERO CLASS
// ===========================

class Hero {
    constructor(heroData) {
        // Identity
        this.id = heroData.id;
        this.name = heroData.name;
        this.rarity = heroData.rarity;
        this.element = heroData.element;
        this.class = heroData.class;
        this.gender = heroData.gender;
        this.ultimate = heroData.ultimate;
        
        // Progression
        this.level = 1;
        this.exp = 0;
        this.stars = 1;
        this.awakeningShards = 0;
        this.bond = 0;
        
        // Base stats from DB
        this.baseStats = { ...heroData.baseStats };
        
        // Equipment Slots (Updated for Forge Update)
        this.equipment = {
            weapon: null,
            artifact: null,
            ring: null,
            cloak: null
        };
        
        // Dynamic Battle Stats
        this.currentHP = 0;
        this.maxHP = 0;
        this.atk = 0;
        this.def = 0;
        this.spd = 0;
        this.crit = 0; // New Stat
        this.mana = 0;
        this.maxMana = 100;
        
        // State
        this.isAlive = true;
        this.buffs = [];
        this.debuffs = [];
        
        this.calculateStats();
        this.fullHeal(); // Initial heal on creation
    }
    
    // Core Stat Calculation
    calculateStats(skillTreeBonuses = {}) {
        const levelMultiplier = 1 + (this.level - 1) * 0.1;
        const starMultiplier = 1 + (this.stars - 1) * 0.15;
        
        // 1. Calculate Base with Multipliers
        let totalHP = Math.floor(this.baseStats.hp * levelMultiplier * starMultiplier);
        let totalATK = Math.floor(this.baseStats.atk * levelMultiplier * starMultiplier);
        let totalDEF = Math.floor(this.baseStats.def * levelMultiplier * starMultiplier);
        let totalSPD = Math.floor(this.baseStats.spd * levelMultiplier * starMultiplier);
        let totalCrit = 5; // Base 5% crit chance
        
        // 2. Add Equipment Stats
        for (const slot in this.equipment) {
            const item = this.equipment[slot];
            if (item && item.stats) {
                if (item.stats.hp) totalHP += item.stats.hp;
                if (item.stats.atk) totalATK += item.stats.atk;
                if (item.stats.def) totalDEF += item.stats.def;
                if (item.stats.spd) totalSPD += item.stats.spd;
                if (item.stats.crit) totalCrit += item.stats.crit;
            }
        }
        
        // 3. Apply Skill Tree Bonuses (Percentages)
        // Global % Boost
        if (skillTreeBonuses.allStatsPercent) {
            const factor = 1 + (skillTreeBonuses.allStatsPercent / 100);
            totalHP = Math.floor(totalHP * factor);
            totalATK = Math.floor(totalATK * factor);
            totalDEF = Math.floor(totalDEF * factor);
        }
        
        // Element Specific Boost
        const elKey = `${this.element.toLowerCase()}Bonus`;
        if (skillTreeBonuses[elKey]) {
            totalATK = Math.floor(totalATK * (1 + skillTreeBonuses[elKey] / 100));
        }

        // Crit Chance Bonus from Tree
        if (skillTreeBonuses.critChance) {
            totalCrit += skillTreeBonuses.critChance;
        }

        // Final Assignment
        this.maxHP = totalHP;
        this.atk = totalATK;
        this.def = totalDEF;
        this.spd = totalSPD;
        this.crit = totalCrit;
        
        // Cap HP if current exceeds max (e.g. removed equipment)
        if (this.currentHP > this.maxHP) this.currentHP = this.maxHP;
        
        // Update alive status based on current HP
        this.isAlive = this.currentHP > 0;
    }
    
    // Equipment Management
    equipItem(slot, item) {
        // Returns the old item if there was one, or null
        const oldItem = this.equipment[slot];
        this.equipment[slot] = item;
        this.calculateStats(window.gameState ? window.gameState.getSkillTreeBonuses() : {});
        return oldItem;
    }

    unequipItem(slot) {
        const item = this.equipment[slot];
        this.equipment[slot] = null;
        this.calculateStats(window.gameState ? window.gameState.getSkillTreeBonuses() : {});
        return item;
    }

    // Combat Power for Sorting
    getPower() {
        return Math.floor((this.maxHP / 10) + this.atk + this.def + (this.spd * 2) + (this.crit * 10));
    }
    
    // Leveling Logic
    getUpgradeCost() {
        return Math.floor(100 * Math.pow(1.08, this.level - 1));
    }
    
    levelUp(goldSpent) {
        this.level++;
        this.calculateStats(window.gameState ? window.gameState.getSkillTreeBonuses() : {});
        return true;
    }
    
    // --- BATTLE METHODS ---

    fullHeal(startingManaBonus = 0) {
        this.currentHP = this.maxHP;
        this.isAlive = true;
        // Start fresh run with 0 mana + any skill tree bonus
        this.mana = startingManaBonus; 
    }

    // Called at start of WAVE
    resetForBattle(skillTreeBonuses = {}) {
        this.calculateStats(skillTreeBonuses);
        
        this.buffs = [];
        this.debuffs = [];
        
        // Validating life state
        if (this.currentHP <= 0) {
            this.currentHP = 0;
            this.isAlive = false;
        } else {
            this.isAlive = true;
        }
    }
    
    takeDamage(amount) {
        this.currentHP = Math.max(0, this.currentHP - amount);
        if (this.currentHP <= 0) this.isAlive = false;
        return amount;
    }
    
    heal(amount) {
        if (!this.isAlive) return 0;
        const missing = this.maxHP - this.currentHP;
        const actual = Math.min(amount, missing);
        this.currentHP += actual;
        return actual;
    }
    
    gainMana(amount) {
        if (!this.isAlive) return;
        this.mana = Math.min(this.maxMana, this.mana + amount);
    }
    
    canUseUltimate() {
        return this.isAlive && this.mana >= this.ultimate.manaReq;
    }
    
    useUltimate() {
        if (this.canUseUltimate()) {
            this.mana = 0; // Reset only on use
            return true;
        }
        return false;
    }
    
    // UI Helpers
    getHPPercent() { 
        if (this.maxHP === 0) return 0;
        return Math.max(0, Math.min(100, (this.currentHP / this.maxHP) * 100)); 
    }
    
    getManaPercent() { 
        return Math.max(0, Math.min(100, (this.mana / this.maxMana) * 100)); 
    }
    
    // Serialization
    toJSON() {
        return {
            id: this.id,
            level: this.level,
            exp: this.exp,
            stars: this.stars,
            awakeningShards: this.awakeningShards,
            bond: this.bond,
            equipment: this.equipment,
            currentHP: this.currentHP,
            mana: this.mana
        };
    }
    
    static fromJSON(data) {
        const template = HEROES_DATABASE.find(h => h.id === data.id);
        if (!template) return null;
        
        const hero = new Hero(template);
        hero.level = data.level || 1;
        hero.exp = data.exp || 0;
        hero.stars = data.stars || 1;
        hero.awakeningShards = data.awakeningShards || 0;
        hero.bond = data.bond || 0;
        
        // Load Equipment safely
        if(data.equipment) {
            hero.equipment = {
                weapon: data.equipment.weapon || null,
                artifact: data.equipment.artifact || null,
                ring: data.equipment.ring || null,
                cloak: data.equipment.cloak || null
            };
        }
        
        hero.calculateStats();
        
        if (data.currentHP !== undefined) {
            hero.currentHP = data.currentHP;
            hero.isAlive = hero.currentHP > 0;
        }
        if (data.mana !== undefined) {
            hero.mana = data.mana;
        }
        
        return hero;
    }
}

// ===========================
// ENEMY CLASS
// ===========================

class Enemy {
    constructor(template, waveNumber) {
        this.id = template.id;
        this.name = template.name;
        this.element = template.element;
        this.instanceId = `${template.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Scaling Logic: +12% stats per wave (Slightly harder now that we have gear)
        const multiplier = 1 + (waveNumber - 1) * 0.12;
        
        this.maxHP = Math.floor(template.baseStats.hp * multiplier);
        this.currentHP = this.maxHP;
        this.atk = Math.floor(template.baseStats.atk * multiplier);
        this.def = Math.floor(template.baseStats.def * multiplier);
        this.spd = Math.floor(template.baseStats.spd * multiplier);
        
        this.maxMana = 100;
        this.mana = 0;
        this.isAlive = true;
        this.isBoss = (waveNumber % 10 === 0);
    }
    
    takeDamage(amount) {
        this.currentHP = Math.max(0, this.currentHP - amount);
        if (this.currentHP <= 0) this.isAlive = false;
        return amount;
    }
    
    gainMana(amount) {
        if (!this.isAlive) return;
        this.mana = Math.min(this.maxMana, this.mana + amount);
    }
    
    getHPPercent() { 
        if (this.maxHP === 0) return 0;
        return Math.max(0, Math.min(100, (this.currentHP / this.maxHP) * 100)); 
    }
}

// ===========================
// GARDEN CLASS
// ===========================

class Garden {
    constructor() {
        this.plots = Array(6).fill(null).map((_, i) => ({
            id: i,
            unlocked: i < 2,
            plant: null
        }));
    }
    
    unlockPlot(id) {
        const plot = this.plots.find(p => p.id === id);
        if (plot && !plot.unlocked) {
            plot.unlocked = true;
            return true;
        }
        return false;
    }
    
    plantSeed(plotId, seedId) {
        const plot = this.plots.find(p => p.id === plotId);
        const seed = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === seedId);
        
        if (plot && plot.unlocked && !plot.plant && seed) {
            plot.plant = {
                seedId: seedId,
                plantedAt: Date.now(),
                growthTime: seed.growthTime,
                ready: false
            };
            return true;
        }
        return false;
    }
    
    checkGrowth() {
        let changed = false;
        const now = Date.now();
        this.plots.forEach(p => {
            if (p.plant && !p.plant.ready) {
                if (now - p.plant.plantedAt >= p.plant.growthTime) {
                    p.plant.ready = true;
                    changed = true;
                }
            }
        });
        return changed;
    }
    
    harvest(plotId) {
        const plot = this.plots.find(p => p.id === plotId);
        if (plot && plot.plant && plot.plant.ready) {
            const seed = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === plot.plant.seedId);
            plot.plant = null;
            return seed.resultId;
        }
        return null;
    }
    
    toJSON() { return { plots: this.plots }; }
    static fromJSON(data) {
        const g = new Garden();
        if(data && data.plots) g.plots = data.plots;
        return g;
    }
}

// ===========================
// GAME STATE
// ===========================

class GameState {
    constructor() {
        this.username = "Traveler";
        this.gold = 500;
        this.petals = 150;
        this.spiritOrbs = 0;
        this.roster = [];
        this.team = [null, null, null, null, null];
        
        // Inventory System
        this.inventory = { 
            seeds: { 's001': 2 }, 
            teas: {}, 
            materials: {}, // Forge Materials
            equipment: []  // Crafted/Unequipped Gear List
        };
        
        this.garden = new Garden();
        this.skillTree = this.initSkillTree();
        this.currentWave = 1;
        this.highestWave = 0;
        this.enemiesDefeated = 0;
        this.isBattleActive = false;
        this.autoCast = false;
        this.pityCounter = 0;
        this.totalPulls = 0;
        this.stats = { totalBattles: 0, totalPulls: 0, playTime: 0 };
        this.quests = [];
        this.lastQuestReset = 0;
        this.expedition = { isActive: true, startTime: Date.now(), lastClaimTime: Date.now() };
    }
    
    addHero(id) {
        const existing = this.roster.find(h => h.id === id);
        if (existing) {
            const shards = { 'N': 5, 'R': 10, 'SR': 15, 'SSR': 25, 'UR': 50 }[existing.rarity] || 5;
            existing.awakeningShards += shards;
            return { isDuplicate: true, hero: existing, shards };
        }
        const template = HEROES_DATABASE.find(h => h.id === id);
        if (template) {
            const newHero = new Hero(template);
            this.roster.push(newHero);
            return { isDuplicate: false, hero: newHero, shards: 0 };
        }
        return { isDuplicate: false, hero: null };
    }
    
    getTeamHeroes() {
        return this.team.map(id => this.roster.find(h => h.id === id)).filter(h => h !== undefined);
    }
    
    setTeamMember(slotIndex, heroId) {
        if (slotIndex >= 0 && slotIndex < 5) this.team[slotIndex] = heroId;
    }
    
    recoverTeam() {
        const bonuses = this.getSkillTreeBonuses();
        const startMana = bonuses.startingMana || 0;
        this.roster.forEach(h => h.fullHeal(startMana));
    }

    addItem(type, id, amt=1) {
        if (!this.inventory[type]) this.inventory[type] = {};
        this.inventory[type][id] = (this.inventory[type][id] || 0) + amt;
    }
    
    removeItem(type, id, amt=1) {
        if (!this.inventory[type] || !this.inventory[type][id]) return false;
        if (this.inventory[type][id] < amt) return false;
        this.inventory[type][id] -= amt;
        if (this.inventory[type][id] <= 0) delete this.inventory[type][id];
        return true;
    }
    
    getItemCount(type, id) {
        return (this.inventory[type] && this.inventory[type][id]) || 0;
    }
    
    // Equipment Specific Inventory Helpers
    addEquipment(item) {
        // Assign a unique ID to every gear piece instance so we can track it
        item.instanceId = 'eq_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        if (!this.inventory.equipment) this.inventory.equipment = [];
        this.inventory.equipment.push(item);
        return item;
    }

    removeEquipment(instanceId) {
        if (!this.inventory.equipment) return false;
        const idx = this.inventory.equipment.findIndex(i => i.instanceId === instanceId);
        if (idx !== -1) {
            this.inventory.equipment.splice(idx, 1);
            return true;
        }
        return false;
    }

    initSkillTree() {
        return [
            { id: 'st01', name: 'ATK Boost I', icon: '⚔️', desc: '+5% ATK', cost: 10, maxLevel: 5, level: 0, bonus: 'allStatsPercent', value: 5 },
            { id: 'st02', name: 'HP Boost I', icon: '❤️', desc: '+5% HP', cost: 10, maxLevel: 5, level: 0, bonus: 'allStatsPercent', value: 5 },
            { id: 'st03', name: 'Starting Mana', icon: '⚡', desc: '+20 Start Mana', cost: 25, maxLevel: 3, level: 0, bonus: 'startingMana', value: 20 },
            { id: 'st04', name: 'Gold Rush', icon: '💰', desc: '+10% Gold', cost: 15, maxLevel: 5, level: 0, bonus: 'goldBonus', value: 10 },
            { id: 'st08', name: 'Crit Chance', icon: '🎯', desc: '+2% Crit Rate', cost: 30, maxLevel: 5, level: 0, bonus: 'critChance', value: 2 },
            { id: 'st05', name: 'Fire Mastery', icon: '🔥', desc: '+10% Fire ATK', cost: 20, maxLevel: 3, level: 0, bonus: 'fireBonus', value: 10 },
            { id: 'st06', name: 'Water Mastery', icon: '💧', desc: '+10% Water ATK', cost: 20, maxLevel: 3, level: 0, bonus: 'waterBonus', value: 10 },
            { id: 'st07', name: 'Wind Mastery', icon: '🌪️', desc: '+10% Wind ATK', cost: 20, maxLevel: 3, level: 0, bonus: 'windBonus', value: 10 },
        ];
    }
    
    getSkillTreeBonuses() {
        const bonuses = {};
        this.skillTree.forEach(node => {
            if (node.level > 0) bonuses[node.bonus] = (bonuses[node.bonus] || 0) + (node.value * node.level);
        });
        return bonuses;
    }
    
    upgradeSkillNode(id) {
        const node = this.skillTree.find(n => n.id === id);
        if (!node || node.level >= node.maxLevel) return false;
        const cost = node.cost * (node.level + 1);
        if (this.spiritOrbs >= cost) {
            this.spiritOrbs -= cost;
            node.level++;
            return true;
        }
        return false;
    }
    
    checkQuestReset() {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        const QUEST_POOL = [
            // EASY
            { id: 'q_e1', desc: 'Defeat 10 Enemies', target: 10, current: 0, reward: { gold: 200, petals: 5 }, type: 'killEnemies', difficulty: 'Easy' },
            { id: 'q_e2', desc: 'Summon 1 Hero', target: 1, current: 0, reward: { petals: 10, gold: 100 }, type: 'summon', difficulty: 'Easy' },
            { id: 'q_e3', desc: 'Use 3 Ultimates', target: 3, current: 0, reward: { spiritOrbs: 1, gold: 150 }, type: 'useUltimates', difficulty: 'Easy' },
            { id: 'q_e4', desc: 'Level Up a Hero', target: 1, current: 0, reward: { gold: 300 }, type: 'levelUp', difficulty: 'Easy' },
            { id: 'q_e5', desc: 'Clear 1 Wave', target: 1, current: 0, reward: { gold: 200 }, type: 'clearWaves', difficulty: 'Easy' },
            
            // MEDIUM
            { id: 'q_m1', desc: 'Defeat 30 Enemies', target: 30, current: 0, reward: { gold: 500, petals: 20 }, type: 'killEnemies', difficulty: 'Medium' },
            { id: 'q_m2', desc: 'Clear 5 Waves', target: 5, current: 0, reward: { gold: 600, spiritOrbs: 2 }, type: 'clearWaves', difficulty: 'Medium' },
            { id: 'q_m3', desc: 'Use 10 Ultimates', target: 10, current: 0, reward: { petals: 30, gold: 300 }, type: 'useUltimates', difficulty: 'Medium' },
            { id: 'q_m4', desc: 'Summon 5 Heroes', target: 5, current: 0, reward: { petals: 20, spiritOrbs: 1 }, type: 'summon', difficulty: 'Medium' },
            { id: 'q_m5', desc: 'Craft 1 Item', target: 1, current: 0, reward: { gold: 1000 }, type: 'craft', difficulty: 'Medium' },
            
            // HARD
            { id: 'q_h1', desc: 'Defeat 100 Enemies', target: 100, current: 0, reward: { gold: 1500, petals: 50, spiritOrbs: 5 }, type: 'killEnemies', difficulty: 'Hard' },
            { id: 'q_h2', desc: 'Clear 15 Waves', target: 15, current: 0, reward: { gold: 1200, spiritOrbs: 5 }, type: 'clearWaves', difficulty: 'Hard' },
            { id: 'q_h3', desc: 'Perform 20 Summons', target: 20, current: 0, reward: { petals: 100, gold: 1000 }, type: 'summon', difficulty: 'Hard' },
            { id: 'q_h4', desc: 'Harvest 5 Plants', target: 5, current: 0, reward: { seeds: { 's003': 1 }, gold: 500 }, type: 'harvest', difficulty: 'Hard' },
            
            // INSANE
            { id: 'q_i1', desc: 'Defeat 300 Enemies', target: 300, current: 0, reward: { gold: 5000, petals: 200, spiritOrbs: 20 }, type: 'killEnemies', difficulty: 'Insane' },
            { id: 'q_i2', desc: 'Clear 30 Waves', target: 30, current: 0, reward: { gold: 4000, spiritOrbs: 25 }, type: 'clearWaves', difficulty: 'Insane' },
            { id: 'q_i3', desc: 'Use 50 Ultimates', target: 50, current: 0, reward: { spiritOrbs: 10, petals: 50 }, type: 'useUltimates', difficulty: 'Insane' }
        ];

        if (now - this.lastQuestReset > oneDay || this.quests.length === 0) {
            // Pick 4 random quests from the pool
            this.quests = [];
            const shuffled = [...QUEST_POOL].sort(() => 0.5 - Math.random());
            
            // Try to ensure at least one easy and one medium for balance
            const easy = shuffled.find(q => q.difficulty === 'Easy');
            const medium = shuffled.find(q => q.difficulty === 'Medium');
            
            if(easy) this.quests.push({...easy});
            if(medium) this.quests.push({...medium});
            
            // Fill remaining slots
            for(let q of shuffled) {
                if(this.quests.length >= 4) break;
                if(!this.quests.some(existing => existing.id === q.id)) {
                    this.quests.push({...q});
                }
            }
            
            this.lastQuestReset = now;
        }
    }
    
    updateQuest(type, amt=1) {
        this.quests.forEach(q => {
            if (q.type === type && !q.completed) {
                q.current += amt;
                if (q.current >= q.target) q.completed = true;
            }
        });
    }
    
    claimQuest(id) {
        const q = this.quests.find(q => q.id === id);
        if (q && q.completed && !q.claimed) {
            q.claimed = true;
            if (q.reward.gold) this.gold += q.reward.gold;
            if (q.reward.petals) this.petals += q.reward.petals;
            if (q.reward.spiritOrbs) this.spiritOrbs += q.reward.spiritOrbs;
            if (q.reward.seeds) {
                for (const [sid, qty] of Object.entries(q.reward.seeds)) {
                    this.addItem('seeds', sid, qty);
                }
            }
            return q.reward;
        }
        return null;
    }
    
    calculateExpeditionRewards() {
        const now = Date.now();
        const hours = (now - this.expedition.lastClaimTime) / (1000 * 60 * 60);
        
        // Minimal threshold to claim
        if (hours < 0.1) return { gold: 0, petals: 0, materials: [], hours: hours.toFixed(2) };
        
        // Base Rewards
        const gold = Math.floor(hours * 100);
        const petals = Math.floor(hours * 5);
        
        // Forge Material Roll (chance per hour)
        const materials = [];
        const rollCount = Math.floor(hours); // 1 roll per hour
        const allMats = FORGE_DATABASE.materials;
        
        for(let i=0; i<rollCount; i++) {
            // 30% chance per hour to find a material
            if(Math.random() < 0.3) {
                const mat = allMats[Math.floor(Math.random() * allMats.length)];
                materials.push({ id: mat.id, name: mat.name, qty: 1 });
            }
        }

        return { gold, petals, materials, hours: hours.toFixed(2) };
    }
    
    claimExpeditionRewards() {
        const r = this.calculateExpeditionRewards();
        if (r.gold > 0) {
            this.gold += r.gold;
            this.petals += r.petals;
            
            // Add Materials
            r.materials.forEach(m => {
                this.addItem('materials', m.id, m.qty);
            });
            
            this.expedition.lastClaimTime = Date.now();
            return r;
        }
        return null;
    }
    
    toJSON() {
        return {
            username: this.username,
            gold: this.gold,
            petals: this.petals,
            spiritOrbs: this.spiritOrbs,
            roster: this.roster.map(h => h.toJSON()),
            team: this.team,
            inventory: this.inventory,
            garden: this.garden.toJSON(),
            skillTree: this.skillTree,
            stats: this.stats,
            pityCounter: this.pityCounter,
            highestWave: this.highestWave,
            expedition: this.expedition,
            quests: this.quests,
            lastQuestReset: this.lastQuestReset
        };
    }
    
    static fromJSON(data) {
        const s = new GameState();
        s.username = data.username || "Traveler";
        s.gold = data.gold || 0;
        s.petals = data.petals || 0;
        s.spiritOrbs = data.spiritOrbs || 0;
        if (data.roster) s.roster = data.roster.map(h => Hero.fromJSON(h)).filter(h => h);
        if (data.team) s.team = data.team;
        
        if (data.inventory) {
            s.inventory = data.inventory;
            // Ensure new categories exist if loading old save
            if (!s.inventory.materials) s.inventory.materials = {};
            if (!s.inventory.equipment) s.inventory.equipment = [];
        }
        
        if (data.garden) s.garden = Garden.fromJSON(data.garden);
        if (data.skillTree) data.skillTree.forEach(savedNode => { const node = s.skillTree.find(n => n.id === savedNode.id); if (node) node.level = savedNode.level; });
        if (data.stats) s.stats = data.stats;
        s.pityCounter = data.pityCounter || 0;
        s.highestWave = data.highestWave || 0;
        if (data.expedition) s.expedition = data.expedition;
        if (data.quests) { s.quests = data.quests; s.lastQuestReset = data.lastQuestReset; }
        return s;
    }
}