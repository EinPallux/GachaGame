/* ===========================
   SAKURA CHRONICLES - CLASSES
   Core Game Classes
   =========================== */

// ===========================
// HERO CLASS
// ===========================

class Hero {
    constructor(heroData) {
        // Base data from database
        this.id = heroData.id;
        this.name = heroData.name;
        this.rarity = heroData.rarity;
        this.element = heroData.element;
        this.class = heroData.class;
        this.gender = heroData.gender;
        this.ultimate = heroData.ultimate;
        
        // Progression stats
        this.level = 1;
        this.exp = 0;
        this.stars = 1;
        this.awakeningShards = 0;
        this.bond = 0;
        
        // Base stats
        this.baseStats = { ...heroData.baseStats };
        
        // Equipment
        this.equipment = {
            weapon: null,
            armor: null,
            accessory: null
        };
        
        // Battle stats (calculated)
        this.currentHP = 0;
        this.maxHP = 0;
        this.atk = 0;
        this.def = 0;
        this.spd = 0;
        this.mana = 0;
        this.maxMana = 100;
        
        // Status flags
        this.isAlive = true;
        this.buffs = [];
        this.debuffs = [];
        
        this.calculateStats();
    }
    
    // Calculate total stats based on level, stars, equipment, and bonuses
    calculateStats(skillTreeBonuses = {}) {
        const levelMultiplier = 1 + (this.level - 1) * 0.1;
        const starMultiplier = 1 + (this.stars - 1) * 0.15;
        
        // Base stats with level and star scaling
        let totalHP = Math.floor(this.baseStats.hp * levelMultiplier * starMultiplier);
        let totalATK = Math.floor(this.baseStats.atk * levelMultiplier * starMultiplier);
        let totalDEF = Math.floor(this.baseStats.def * levelMultiplier * starMultiplier);
        let totalSPD = Math.floor(this.baseStats.spd * levelMultiplier * starMultiplier);
        
        // Add equipment bonuses
        if (this.equipment.weapon) {
            totalATK += this.equipment.weapon.stats.atk || 0;
        }
        if (this.equipment.armor) {
            totalDEF += this.equipment.armor.stats.def || 0;
            totalHP += this.equipment.armor.stats.hp || 0;
        }
        if (this.equipment.accessory) {
            totalATK += this.equipment.accessory.stats.atk || 0;
            totalDEF += this.equipment.accessory.stats.def || 0;
            totalSPD += this.equipment.accessory.stats.spd || 0;
            totalHP += this.equipment.accessory.stats.hp || 0;
        }
        
        // Add bond bonuses (up to 10% at max bond)
        const bondBonus = 1 + (this.bond / 1000) * 0.1;
        totalATK = Math.floor(totalATK * bondBonus);
        totalDEF = Math.floor(totalDEF * bondBonus);
        
        // Apply skill tree bonuses
        if (skillTreeBonuses.allStatsPercent) {
            const bonus = 1 + skillTreeBonuses.allStatsPercent / 100;
            totalHP = Math.floor(totalHP * bonus);
            totalATK = Math.floor(totalATK * bonus);
            totalDEF = Math.floor(totalDEF * bonus);
            totalSPD = Math.floor(totalSPD * bonus);
        }
        
        // Element-specific bonuses
        const elementKey = `${this.element.toLowerCase()}Bonus`;
        if (skillTreeBonuses[elementKey]) {
            const bonus = 1 + skillTreeBonuses[elementKey] / 100;
            totalATK = Math.floor(totalATK * bonus);
        }
        
        // Class-specific bonuses
        const classKey = `${this.class.replace(/\s/g, '').toLowerCase()}Bonus`;
        if (skillTreeBonuses[classKey]) {
            const bonus = 1 + skillTreeBonuses[classKey] / 100;
            totalHP = Math.floor(totalHP * bonus);
        }
        
        // Set calculated stats
        this.maxHP = totalHP;
        this.atk = totalATK;
        this.def = totalDEF;
        this.spd = totalSPD;
        
        // Set current HP if not in battle
        if (this.currentHP === 0 || this.currentHP > this.maxHP) {
            this.currentHP = this.maxHP;
        }
    }
    
    // Level up the hero
    levelUp(goldSpent) {
        const goldRequired = this.getUpgradeCost();
        if (goldSpent >= goldRequired) {
            this.level++;
            this.calculateStats();
            return true;
        }
        return false;
    }
    
    // Get cost to level up
    getUpgradeCost() {
        return Math.floor(100 * Math.pow(1.09, this.level - 1));
    }
    
    // Awaken hero with shards
    awaken() {
        const shardsRequired = this.stars * 10;
        if (this.awakeningShards >= shardsRequired && this.stars < 5) {
            this.awakeningShards -= shardsRequired;
            this.stars++;
            this.calculateStats();
            return true;
        }
        return false;
    }
    
    // Add awakening shards (from duplicate pulls)
    addShards(amount) {
        this.awakeningShards += amount;
    }
    
    // Increase bond level
    addBond(amount) {
        this.bond = Math.min(1000, this.bond + amount);
    }
    
    // Reset for new battle
    resetForBattle(skillTreeBonuses = {}) {
        this.calculateStats(skillTreeBonuses);
        this.currentHP = this.maxHP;
        this.mana = 0;
        this.isAlive = true;
        this.buffs = [];
        this.debuffs = [];
    }
    
    // Take damage
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.def);
        this.currentHP = Math.max(0, this.currentHP - actualDamage);
        
        if (this.currentHP <= 0) {
            this.isAlive = false;
        }
        
        return actualDamage;
    }
    
    // Heal HP
    heal(amount) {
        const actualHeal = Math.min(amount, this.maxHP - this.currentHP);
        this.currentHP = Math.min(this.maxHP, this.currentHP + actualHeal);
        return actualHeal;
    }
    
    // Gain mana
    gainMana(amount) {
        this.mana = Math.min(this.maxMana, this.mana + amount);
    }
    
    // Check if ultimate is ready
    canUseUltimate() {
        return this.isAlive && this.mana >= this.ultimate.manaReq;
    }
    
    // Use ultimate (resets mana)
    useUltimate() {
        if (this.canUseUltimate()) {
            this.mana = 0;
            return true;
        }
        return false;
    }
    
    // Get HP percentage
    getHPPercent() {
        return (this.currentHP / this.maxHP) * 100;
    }
    
    // Get mana percentage
    getManaPercent() {
        return (this.mana / this.maxMana) * 100;
    }
    
    // Export for save
    toJSON() {
        return {
            id: this.id,
            level: this.level,
            exp: this.exp,
            stars: this.stars,
            awakeningShards: this.awakeningShards,
            bond: this.bond,
            equipment: this.equipment
        };
    }
    
    // Load from save
    static fromJSON(savedHero) {
        const heroData = HEROES_DATABASE.find(h => h.id === savedHero.id);
        if (!heroData) return null;
        
        const hero = new Hero(heroData);
        hero.level = savedHero.level;
        hero.exp = savedHero.exp;
        hero.stars = savedHero.stars;
        hero.awakeningShards = savedHero.awakeningShards;
        hero.bond = savedHero.bond;
        hero.equipment = savedHero.equipment;
        hero.calculateStats();
        
        return hero;
    }
}

// ===========================
// ENEMY CLASS
// ===========================

class Enemy {
    constructor(enemyData, waveNumber) {
        this.id = enemyData.id;
        this.name = enemyData.name;
        this.element = enemyData.element;
        
        // Scaling
        const waveScale = 1 + (waveNumber - 1) * 0.05; 
        const bossMultiplier = (waveNumber % 10 === 0) ? 1.5 : 1; 
        const totalScale = waveScale * bossMultiplier;
        
        this.maxHP = Math.floor(enemyData.baseStats.hp * totalScale);
        this.currentHP = this.maxHP;
        this.atk = Math.floor(enemyData.baseStats.atk * totalScale);
        this.def = Math.floor(enemyData.baseStats.def * totalScale);
        this.spd = Math.floor(enemyData.baseStats.spd * totalScale);
        
        this.isAlive = true;
        this.isBoss = (waveNumber % 10 === 0);
    }
    
    // Take damage
    takeDamage(damage) {
        const actualDamage = Math.max(1, damage - this.def);
        this.currentHP = Math.max(0, this.currentHP - actualDamage);
        
        if (this.currentHP <= 0) {
            this.isAlive = false;
        }
        
        return actualDamage;
    }
    
    // Get HP percentage
    getHPPercent() {
        return (this.currentHP / this.maxHP) * 100;
    }
}

// ===========================
// GARDEN CLASS (NEW)
// ===========================

class Garden {
    constructor() {
        // Initialize 6 plots
        this.plots = [
            { id: 0, unlocked: true, plant: null },  // First 2 free
            { id: 1, unlocked: true, plant: null },
            { id: 2, unlocked: false, plant: null }, // Unlockable
            { id: 3, unlocked: false, plant: null },
            { id: 4, unlocked: false, plant: null },
            { id: 5, unlocked: false, plant: null }
        ];
    }

    // Unlock a plot
    unlockPlot(plotId) {
        const plot = this.plots.find(p => p.id === plotId);
        if (plot && !plot.unlocked) {
            plot.unlocked = true;
            return true;
        }
        return false;
    }

    // Plant a seed
    plantSeed(plotId, seedId) {
        const plot = this.plots.find(p => p.id === plotId);
        const seedData = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === seedId);
        
        if (plot && plot.unlocked && !plot.plant && seedData) {
            plot.plant = {
                seedId: seedId,
                plantedAt: Date.now(),
                growthTime: seedData.growthTime,
                ready: false
            };
            return true;
        }
        return false;
    }

    // Check growth progress
    checkGrowth() {
        const now = Date.now();
        let changed = false;
        
        this.plots.forEach(plot => {
            if (plot.plant && !plot.plant.ready) {
                const elapsedTime = now - plot.plant.plantedAt;
                if (elapsedTime >= plot.plant.growthTime) {
                    plot.plant.ready = true;
                    changed = true;
                }
            }
        });
        
        return changed;
    }

    // Harvest a plant
    harvest(plotId) {
        const plot = this.plots.find(p => p.id === plotId);
        if (plot && plot.plant && plot.plant.ready) {
            const seedData = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === plot.plant.seedId);
            const rewardId = seedData.resultId;
            
            // Reset plot
            plot.plant = null;
            
            return rewardId;
        }
        return null;
    }
    
    toJSON() {
        return {
            plots: this.plots
        };
    }
    
    static fromJSON(data) {
        const garden = new Garden();
        if (data && data.plots) {
            garden.plots = data.plots;
        }
        return garden;
    }
}

// ===========================
// GAME STATE CLASS
// ===========================

class GameState {
    constructor() {
        // Currencies
        this.gold = 100;
        this.petals = 150; 
        this.spiritOrbs = 0;
        
        // Hero collection
        this.roster = [];
        this.team = [null, null, null, null, null]; 
        
        // Roguelike Battle state (UPDATED)
        this.currentWave = 0; // Current run wave
        this.highestWave = 0; // Best record
        this.enemiesDefeated = 0;
        this.isBattleActive = false;
        this.autoCast = false;
        
        // Inventory (NEW)
        this.inventory = {
            seeds: {}, // { 's001': 5, ... }
            teas: {}   // { 't001': 2, ... }
        };
        
        // Garden (NEW)
        this.garden = new Garden();
        
        // Gacha state
        this.pityCounter = 0;
        this.totalPulls = 0;
        
        // Skill tree state
        this.skillTree = this.initializeSkillTree();
        
        // Expedition state
        this.expedition = {
            isActive: false,
            startTime: null,
            lastClaimTime: Date.now()
        };
        
        // Quests state
        this.quests = this.generateDailyQuests();
        this.lastQuestReset = Date.now();
        
        // Statistics
        this.stats = {
            totalBattles: 0,
            totalPulls: 0,
            totalGoldEarned: 0,
            playTime: 0
        };
        
        // Give starter heroes
        this.giveStarterHeroes();
        
        // Give starter seeds (NEW)
        this.addItem('seeds', 's001', 2);
    }
    
    // Inventory Management (NEW)
    addItem(type, id, amount = 1) {
        if (!this.inventory[type]) this.inventory[type] = {};
        if (!this.inventory[type][id]) this.inventory[type][id] = 0;
        this.inventory[type][id] += amount;
    }
    
    removeItem(type, id, amount = 1) {
        if (this.inventory[type] && this.inventory[type][id] >= amount) {
            this.inventory[type][id] -= amount;
            // Clean up empty entries
            if (this.inventory[type][id] === 0) {
                delete this.inventory[type][id];
            }
            return true;
        }
        return false;
    }
    
    getItemCount(type, id) {
        return (this.inventory[type] && this.inventory[type][id]) || 0;
    }

    // Initialize skill tree
    initializeSkillTree() {
        return [
            { id: 'st01', name: 'ATK Boost I', icon: '⚔️', desc: '+5% ATK to all heroes', cost: 10, maxLevel: 5, level: 0, bonus: 'allStatsPercent', value: 5 },
            { id: 'st02', name: 'HP Boost I', icon: '❤️', desc: '+5% HP to all heroes', cost: 10, maxLevel: 5, level: 0, bonus: 'allStatsPercent', value: 5 },
            { id: 'st03', name: 'Fire Mastery', icon: '🔥', desc: '+10% ATK to Fire heroes', cost: 15, maxLevel: 3, level: 0, bonus: 'fireBonus', value: 10 },
            { id: 'st04', name: 'Water Mastery', icon: '💧', desc: '+10% ATK to Water heroes', cost: 15, maxLevel: 3, level: 0, bonus: 'waterBonus', value: 10 },
            { id: 'st05', name: 'Wind Mastery', icon: '🌪️', desc: '+10% ATK to Wind heroes', cost: 15, maxLevel: 3, level: 0, bonus: 'windBonus', value: 10 },
            { id: 'st06', name: 'Light Mastery', icon: '✨', desc: '+10% ATK to Light heroes', cost: 15, maxLevel: 3, level: 0, bonus: 'lightBonus', value: 10 },
            { id: 'st07', name: 'Dark Mastery', icon: '🌑', desc: '+10% ATK to Dark heroes', cost: 15, maxLevel: 3, level: 0, bonus: 'darkBonus', value: 10 },
            { id: 'st08', name: 'Gold Rush', icon: '💰', desc: '+10% Gold earned', cost: 20, maxLevel: 5, level: 0, bonus: 'goldBonus', value: 10 },
            { id: 'st09', name: 'Critical Strike', icon: '💥', desc: '+5% Crit Chance', cost: 25, maxLevel: 4, level: 0, bonus: 'critChance', value: 5 },
            { id: 'st10', name: 'Swift Assault', icon: '⚡', desc: '+10% SPD to all', cost: 15, maxLevel: 3, level: 0, bonus: 'allStatsPercent', value: 10 },
            { id: 'st11', name: 'Tank Fortress', icon: '🛡️', desc: '+15% HP to Tanks', cost: 18, maxLevel: 3, level: 0, bonus: 'tankBonus', value: 15 },
            { id: 'st12', name: 'Healer Blessing', icon: '🌿', desc: '+20% Healing Power', cost: 18, maxLevel: 3, level: 0, bonus: 'healerBonus', value: 20 },
            { id: 'st13', name: 'DPS Excellence', icon: '🗡️', desc: '+10% ATK to DPS', cost: 18, maxLevel: 3, level: 0, bonus: 'dps(single)Bonus', value: 10 },
            { id: 'st14', name: 'AoE Master', icon: '💫', desc: '+10% ATK to AoE DPS', cost: 18, maxLevel: 3, level: 0, bonus: 'dps(aoe)Bonus', value: 10 },
            { id: 'st15', name: 'Support Expert', icon: '🎯', desc: '+15% Buff Duration', cost: 18, maxLevel: 3, level: 0, bonus: 'bufferBonus', value: 15 },
            { id: 'st16', name: 'Veteran Fighter', icon: '🏆', desc: '+3% All Stats per level', cost: 30, maxLevel: 5, level: 0, bonus: 'allStatsPercent', value: 3 },
            { id: 'st17', name: 'Petal Finder', icon: '🌸', desc: '+5% Petal drops', cost: 25, maxLevel: 4, level: 0, bonus: 'petalBonus', value: 5 },
            { id: 'st18', name: 'Spirit Connection', icon: '🔮', desc: '+10% Spirit Orb drops', cost: 25, maxLevel: 4, level: 0, bonus: 'orbBonus', value: 10 },
            { id: 'st19', name: 'Ultimate Power', icon: '✨', desc: 'Start battles with 20 mana', cost: 35, maxLevel: 3, level: 0, bonus: 'startingMana', value: 20 },
            { id: 'st20', name: 'Legendary Warrior', icon: '👑', desc: '+10% All Stats', cost: 50, maxLevel: 3, level: 0, bonus: 'allStatsPercent', value: 10 }
        ];
    }
    
    // Generate daily quests
    generateDailyQuests() {
        const questTemplates = [
            { id: 'q1', desc: 'Defeat 50 enemies', type: 'killEnemies', target: 50, current: 0, reward: { petals: 30 } },
            { id: 'q2', desc: 'Complete 10 waves', type: 'completeWaves', target: 10, current: 0, reward: { petals: 25, gold: 500 } },
            { id: 'q3', desc: 'Summon 3 heroes', type: 'summon', target: 3, current: 0, reward: { petals: 20, spiritOrbs: 5 } },
            { id: 'q4', desc: 'Use 10 Ultimate abilities', type: 'useUltimates', target: 10, current: 0, reward: { gold: 800 } },
            { id: 'q5', desc: 'Level up any hero 5 times', type: 'levelUp', target: 5, current: 0, reward: { petals: 15, spiritOrbs: 3 } }
        ];
        
        // Return 3 random quests
        return questTemplates.sort(() => Math.random() - 0.5).slice(0, 3).map((q, i) => ({...q, id: `daily_${i}`}));
    }
    
    // Check if quests need reset (daily at midnight)
    checkQuestReset() {
        const now = Date.now();
        const lastReset = new Date(this.lastQuestReset);
        const currentDate = new Date(now);
        
        // Check if it's a new day
        if (currentDate.getDate() !== lastReset.getDate() || 
            currentDate.getMonth() !== lastReset.getMonth() ||
            currentDate.getFullYear() !== lastReset.getFullYear()) {
            this.quests = this.generateDailyQuests();
            this.lastQuestReset = now;
        }
    }
    
    // Update quest progress
    updateQuest(type, amount = 1) {
        this.quests.forEach(quest => {
            if (quest.type === type && !quest.completed) {
                quest.current = Math.min(quest.target, quest.current + amount);
                if (quest.current >= quest.target) {
                    quest.completed = true;
                }
            }
        });
    }
    
    // Claim quest rewards
    claimQuest(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest && quest.completed && !quest.claimed) {
            if (quest.reward.gold) this.gold += quest.reward.gold;
            if (quest.reward.petals) this.petals += quest.reward.petals;
            if (quest.reward.spiritOrbs) this.spiritOrbs += quest.reward.spiritOrbs;
            quest.claimed = true;
            return quest.reward;
        }
        return null;
    }
    
    // Give starter heroes
    giveStarterHeroes() {
        // Give 3 starter heroes (N rarity)
        const starterIds = ['h001', 'h002', 'h003'];
        starterIds.forEach(id => {
            const heroData = HEROES_DATABASE.find(h => h.id === id);
            if (heroData) {
                const hero = new Hero(heroData);
                this.roster.push(hero);
            }
        });
    }
    
    // Add hero to roster
    addHero(heroId) {
        // Check if hero already exists
        const existingHero = this.roster.find(h => h.id === heroId);
        
        if (existingHero) {
            // Give awakening shards for duplicate
            const shardsToAdd = this.getShardsByRarity(existingHero.rarity);
            existingHero.addShards(shardsToAdd);
            return { isDuplicate: true, hero: existingHero, shards: shardsToAdd };
        } else {
            // Add new hero
            const heroData = HEROES_DATABASE.find(h => h.id === heroId);
            if (heroData) {
                const hero = new Hero(heroData);
                this.roster.push(hero);
                return { isDuplicate: false, hero: hero };
            }
        }
        
        return null;
    }
    
    // Get shards by rarity
    getShardsByRarity(rarity) {
        const shardMap = { 'N': 5, 'R': 10, 'SR': 15, 'SSR': 25, 'UR': 50 };
        return shardMap[rarity] || 5;
    }
    
    // Set team member
    setTeamMember(slotIndex, heroId) {
        if (slotIndex >= 0 && slotIndex < 5) {
            this.team[slotIndex] = heroId;
        }
    }
    
    // Get team heroes
    getTeamHeroes() {
        return this.team
            .filter(heroId => heroId !== null)
            .map(heroId => this.roster.find(h => h.id === heroId))
            .filter(hero => hero !== undefined);
    }
    
    // Get skill tree bonuses
    getSkillTreeBonuses() {
        const bonuses = {};
        
        this.skillTree.forEach(node => {
            if (node.level > 0) {
                const bonusKey = node.bonus;
                const bonusValue = node.value * node.level;
                
                if (!bonuses[bonusKey]) {
                    bonuses[bonusKey] = 0;
                }
                bonuses[bonusKey] += bonusValue;
            }
        });
        
        return bonuses;
    }
    
    // Upgrade skill tree node
    upgradeSkillNode(nodeId) {
        const node = this.skillTree.find(n => n.id === nodeId);
        
        if (node && node.level < node.maxLevel) {
            const cost = node.cost * (node.level + 1);
            
            if (this.spiritOrbs >= cost) {
                this.spiritOrbs -= cost;
                node.level++;
                return true;
            }
        }
        
        return false;
    }
    
    // Calculate expedition rewards
    calculateExpeditionRewards() {
        if (!this.expedition.isActive || !this.expedition.startTime) {
            return null;
        }
        
        const now = Date.now();
        const timeElapsed = now - this.expedition.lastClaimTime;
        const hoursElapsed = timeElapsed / (1000 * 60 * 60);
        
        // Base rewards per hour
        const goldPerHour = 50;
        const petalsPerHour = 2;
        
        const totalGold = Math.floor(goldPerHour * hoursElapsed);
        const totalPetals = Math.floor(petalsPerHour * hoursElapsed);
        
        return {
            gold: totalGold,
            petals: totalPetals,
            hours: hoursElapsed.toFixed(1)
        };
    }
    
    // Claim expedition rewards
    claimExpeditionRewards() {
        const rewards = this.calculateExpeditionRewards();
        
        if (rewards && rewards.gold > 0) {
            this.gold += rewards.gold;
            this.petals += rewards.petals;
            this.expedition.lastClaimTime = Date.now();
            return rewards;
        }
        
        return null;
    }
    
    // Start expedition
    startExpedition() {
        this.expedition.isActive = true;
        this.expedition.startTime = Date.now();
        this.expedition.lastClaimTime = Date.now();
    }
    
    // Export for save
    toJSON() {
        return {
            gold: this.gold,
            petals: this.petals,
            spiritOrbs: this.spiritOrbs,
            roster: this.roster.map(h => h.toJSON()),
            team: this.team,
            currentWave: this.currentWave,
            highestWave: this.highestWave,
            enemiesDefeated: this.enemiesDefeated,
            pityCounter: this.pityCounter,
            totalPulls: this.totalPulls,
            skillTree: this.skillTree,
            expedition: this.expedition,
            quests: this.quests,
            lastQuestReset: this.lastQuestReset,
            stats: this.stats,
            inventory: this.inventory, // NEW
            garden: this.garden.toJSON() // NEW
        };
    }
    
    // Load from save
    static fromJSON(savedState) {
        const state = new GameState();
        
        // Load currencies
        state.gold = savedState.gold || 0;
        state.petals = savedState.petals || 0;
        state.spiritOrbs = savedState.spiritOrbs || 0;
        
        // Load roster
        state.roster = [];
        if (savedState.roster) {
            savedState.roster.forEach(savedHero => {
                const hero = Hero.fromJSON(savedHero);
                if (hero) state.roster.push(hero);
            });
        }
        
        // Load team
        state.team = savedState.team || [null, null, null, null, null];
        
        // Load battle progress
        state.currentWave = savedState.currentWave || 0;
        state.highestWave = savedState.highestWave || 0;
        state.enemiesDefeated = savedState.enemiesDefeated || 0;
        
        // Load gacha state
        state.pityCounter = savedState.pityCounter || 0;
        state.totalPulls = savedState.totalPulls || 0;
        
        // Load skill tree
        if (savedState.skillTree) {
            state.skillTree = savedState.skillTree;
        }
        
        // Load expedition
        if (savedState.expedition) {
            state.expedition = savedState.expedition;
        }
        
        // Load quests
        if (savedState.quests) {
            state.quests = savedState.quests;
            state.lastQuestReset = savedState.lastQuestReset;
        }
        
        // Load stats
        if (savedState.stats) {
            state.stats = savedState.stats;
        }
        
        // Load inventory (NEW)
        if (savedState.inventory) {
            state.inventory = savedState.inventory;
        }
        
        // Load garden (NEW)
        if (savedState.garden) {
            state.garden = Garden.fromJSON(savedState.garden);
        }
        
        // Start expedition if not active
        if (!state.expedition.isActive) {
            state.startExpedition();
        }
        
        return state;
    }
}