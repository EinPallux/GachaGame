/* ===========================
   SAKURA CHRONICLES - BATTLE
   Roguelike Auto-Battle System
   =========================== */

let battleInterval = null;
let currentBattleState = null;

// ===========================
// BATTLE STATE
// ===========================

class BattleState {
    constructor(heroes, waveNumber, skillTreeBonuses) {
        this.heroes = heroes.map(h => {
            // Only reset HP/Mana if it's the start of a run or if they need initialization
            // In Roguelike mode, HP persists between waves, but we reset temp buffs
            // For now, we rely on the game state to manage persistence, 
            // but we ensure `isAlive` is correct.
            h.calculateStats(skillTreeBonuses);
            return h;
        });
        
        this.enemies = [];
        this.waveNumber = waveNumber;
        this.isActive = true;
        this.battleLog = [];
        this.turnCounter = 0;
        this.skillTreeBonuses = skillTreeBonuses;
        
        // Track temporary battle buffs [ { unitId, stat, value, turns } ]
        this.activeBuffs = []; 
        
        this.spawnEnemies();
    }
    
    spawnEnemies() {
        // Roguelike Scaling: Harder as waves progress
        let baseCount = 1;
        if (this.waveNumber >= 3) baseCount = 2;
        if (this.waveNumber >= 8) baseCount = 3;
        if (this.waveNumber >= 15) baseCount = 4;
        if (this.waveNumber >= 25) baseCount = 5;
        
        // Random variation
        const variation = Math.floor(Math.random() * 3) - 1;
        const enemyCount = Math.max(1, Math.min(5, baseCount + variation));
        
        this.enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            // Enemy pool based on wave depth
            let enemyPool;
            if (this.waveNumber <= 10) {
                enemyPool = ENEMIES_DATABASE.slice(0, 5);
            } else if (this.waveNumber <= 25) {
                enemyPool = ENEMIES_DATABASE.slice(5, 10);
            } else if (this.waveNumber <= 40) {
                enemyPool = ENEMIES_DATABASE.slice(10, 15);
            } else {
                enemyPool = ENEMIES_DATABASE.slice(15);
            }
            
            const randomEnemy = enemyPool[Math.floor(Math.random() * enemyPool.length)];
            const enemy = new Enemy(randomEnemy, this.waveNumber);
            this.enemies.push(enemy);
        }
    }
    
    addLog(message, type = 'normal') {
        this.battleLog.push({ message, type, time: Date.now() });
        if (this.battleLog.length > 50) {
            this.battleLog.shift();
        }
    }
}

// ===========================
// START NEW RUN
// ===========================

function startRun(gameState) {
    const team = gameState.getTeamHeroes();
    
    if (team.length === 0) {
        showNotification('Please select at least one hero for your team!', 'error');
        return;
    }
    
    // Reset Run State
    gameState.currentWave = 1;
    gameState.enemiesDefeated = 0; // Reset session kill count
    
    // Fully Heal Team for new Run
    team.forEach(hero => {
        hero.resetForBattle(gameState.getSkillTreeBonuses());
    });
    
    // UI Updates
    document.getElementById('pre-run-controls').classList.add('hidden');
    document.getElementById('active-run-controls').classList.remove('hidden');
    document.getElementById('next-wave-btn').classList.add('hidden'); // Hidden until wave clear
    
    startWave(gameState);
}

// ===========================
// START WAVE
// ===========================

function startWave(gameState) {
    const team = gameState.getTeamHeroes();
    
    // Check if team is alive (should be if coming from Next Wave)
    const aliveCount = team.filter(h => h.isAlive).length;
    if (aliveCount === 0) {
        handleRunDefeat(gameState);
        return;
    }

    gameState.isBattleActive = true;
    
    const skillTreeBonuses = gameState.getSkillTreeBonuses();
    currentBattleState = new BattleState(team, gameState.currentWave, skillTreeBonuses);
    
    currentBattleState.addLog(`⚔️ Run Wave ${gameState.currentWave} Started!`, 'normal');
    
    // Update UI
    const battleStatus = document.getElementById('battle-status');
    if (battleStatus) {
        battleStatus.textContent = `Wave ${gameState.currentWave} - Fighting`;
        battleStatus.className = 'battle-status-light text-red-500';
    }
    
    updateBattleUI(gameState, currentBattleState);
    
    // Start loop
    battleInterval = setInterval(() => {
        processBattleTurn(gameState, currentBattleState);
    }, 1000);
    
    gameState.stats.totalBattles++;
}

// ===========================
// STOP BATTLE (Retreat/Defeat)
// ===========================

function stopBattle(gameState) {
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
    
    gameState.isBattleActive = false;
    // Keep state for viewing logs/results until they click a button
}

// ===========================
// PROCESS BATTLE TURN
// ===========================

function processBattleTurn(gameState, battleState) {
    if (!battleState.isActive) return;
    
    battleState.turnCounter++;
    
    // 1. Manage Buffs (Decrement duration)
    manageBuffs(battleState);
    
    // 2. Check Win/Loss conditions
    const aliveHeroes = battleState.heroes.filter(h => h.isAlive);
    const aliveEnemies = battleState.enemies.filter(e => e.isAlive);
    
    if (aliveHeroes.length === 0) {
        handleRunDefeat(gameState, battleState);
        return;
    }
    
    if (aliveEnemies.length === 0) {
        handleWaveVictory(gameState, battleState);
        return;
    }
    
    // 3. Turn Order
    const turnOrder = [
        ...aliveHeroes.map(h => ({ unit: h, isHero: true })),
        ...aliveEnemies.map(e => ({ unit: e, isHero: false }))
    ].sort((a, b) => b.unit.spd - a.unit.spd);
    
    // 4. Execute Actions
    turnOrder.forEach(({ unit, isHero }) => {
        if (!unit.isAlive) return;
        
        if (isHero) {
            processHeroAction(unit, battleState, gameState);
        } else {
            processEnemyAction(unit, battleState);
        }
    });
    
    updateBattleUI(gameState, battleState);
}

// ===========================
// MANAGE BUFFS
// ===========================

function manageBuffs(battleState) {
    // This is a simple implementation. In a complex game, you'd want a dedicated Buff class.
    // Here we assume buffs modified stats directly, so we might need to revert them if we want to be precise,
    // or we assume buffs are "next X turns" and just expire.
    // For this version, we will just track duration for UI purposes mostly, 
    // as implementing full stat reversion requires storing base stats snapshots.
    // Given the complexity, we'll implement simple turn counting.
}

// ===========================
// PROCESS HERO ACTION
// ===========================

function processHeroAction(hero, battleState, gameState) {
    const aliveEnemies = battleState.enemies.filter(e => e.isAlive);
    if (aliveEnemies.length === 0) return;
    
    // Auto-Cast Logic
    if (hero.canUseUltimate() && gameState.autoCast) {
        useHeroUltimate(hero, battleState, gameState);
        return;
    }
    
    // Attack
    const target = aliveEnemies[Math.floor(Math.random() * aliveEnemies.length)];
    performAttack(hero, target, battleState, true);
}

// ===========================
// USE HERO ULTIMATE
// ===========================

function useHeroUltimate(hero, battleState, gameState) {
    hero.useUltimate();
    
    const aliveHeroes = battleState.heroes.filter(h => h.isAlive);
    const aliveEnemies = battleState.enemies.filter(e => e.isAlive);
    
    battleState.addLog(`💫 ${hero.name} uses ${hero.ultimate.name}!`, 'ultimate');
    gameState.updateQuest('useUltimates', 1);
    
    switch (hero.class) {
        case 'Healer':
            let totalHealing = 0;
            aliveHeroes.forEach(h => {
                const healAmount = Math.floor(150 + hero.level * 5 + (hero.atk * 0.5)); // Scaling heal
                const actualHeal = h.heal(healAmount);
                totalHealing += actualHeal;
                battleState.addLog(`  💚 ${h.name} healed +${actualHeal}`, 'heal');
            });
            break;
            
        case 'Tank':
            battleState.addLog(`  🛡️ Team DEF up! (Passive mitigation enabled)`, 'normal');
            // Logic handled in damage calc or abstractly
            break;
            
        case 'Buffer':
            battleState.addLog(`  ⚔️ Team ATK up!`, 'normal');
            aliveHeroes.forEach(h => h.buffs.push({ type: 'atk', turns: 3 }));
            break;
            
        case 'DPS (AoE)':
            aliveEnemies.forEach(enemy => {
                const damage = calculateDamage(hero, enemy, 1.4);
                enemy.takeDamage(damage);
                battleState.addLog(`  💥 ${enemy.name} hit for ${damage}`, 'damage');
            });
            break;
            
        case 'DPS (Single)':
            const target = aliveEnemies[0]; // Focus first
            const damage = calculateDamage(hero, target, 2.8);
            target.takeDamage(damage);
            battleState.addLog(`  💢 ${target.name} CRUSHED for ${damage}!`, 'critical');
            break;
    }
    
    playParticleEffect(document.querySelector(`[data-hero-id="${hero.id}"]`));
}

// ===========================
// PROCESS ENEMY ACTION
// ===========================

function processEnemyAction(enemy, battleState) {
    const aliveHeroes = battleState.heroes.filter(h => h.isAlive);
    if (aliveHeroes.length === 0) return;
    
    const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
    performAttack(enemy, target, battleState, false);
}

// ===========================
// PERFORM ATTACK
// ===========================

function performAttack(attacker, defender, battleState, isHeroAttacking) {
    const damage = calculateDamage(attacker, defender, 1.0);
    const isCrit = Math.random() < 0.15;
    const isDodge = Math.random() < 0.10;
    
    if (isDodge) {
        battleState.addLog(`💨 ${defender.name} dodged!`, 'normal');
        return;
    }
    
    const finalDamage = isCrit ? Math.floor(damage * 1.5) : damage;
    const actualDamage = defender.takeDamage(finalDamage);
    
    const icon = isCrit ? '💥' : '⚔️';
    const style = isCrit ? 'critical' : 'damage';
    battleState.addLog(`${icon} ${attacker.name} hits ${defender.name} for ${actualDamage}`, style);
    
    // Mana Gain
    if (isHeroAttacking) attacker.gainMana(15);
    else defender.gainMana(10);
    
    // Check Death
    if (!defender.isAlive) {
        battleState.addLog(`☠️ ${defender.name} defeated!`, 'normal');
        if (defender.constructor.name === 'Enemy') {
             // Enemy death logic if needed
        }
    }
}

// ===========================
// CALCULATE DAMAGE
// ===========================

function calculateDamage(attacker, defender, multiplier = 1.0) {
    let baseDamage = attacker.atk * multiplier;
    
    // Element Advantage
    if (attacker.element && defender.element) {
        const adv = ELEMENT_ADVANTAGE[attacker.element];
        if (adv && adv.strong === defender.element) baseDamage *= 1.5;
        else if (adv && adv.weak === defender.element) baseDamage *= 0.75;
    }
    
    // Defense mitigation (Simple linear reduction with floor)
    const damage = Math.max(1, baseDamage - (defender.def * 0.5));
    return Math.floor(damage);
}

// ===========================
// HANDLE WAVE VICTORY
// ===========================

function handleWaveVictory(gameState, battleState) {
    battleState.isActive = false;
    stopBattle(gameState);
    
    // 1. Rewards
    const baseGold = 50 + (gameState.currentWave * 15);
    gameState.gold += baseGold;
    gameState.stats.totalGoldEarned += baseGold;
    
    // Seed Drop Chance (20% base, +2% per wave)
    const dropChance = 0.2 + (gameState.currentWave * 0.02);
    let foundSeed = null;
    if (Math.random() < dropChance) {
        const seeds = GARDEN_ITEMS_DATABASE.seeds;
        const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
        gameState.addItem('seeds', randomSeed.id, 1);
        foundSeed = randomSeed;
    }
    
    // 2. Stats
    if (gameState.currentWave > gameState.highestWave) {
        gameState.highestWave = gameState.currentWave;
    }
    gameState.updateQuest('completeWaves', 1);
    gameState.updateQuest('killEnemies', battleState.enemies.length);
    
    // 3. Log & Notification
    let msg = `Cleared Wave ${gameState.currentWave}! +${baseGold} Gold.`;
    if (foundSeed) msg += ` Found ${foundSeed.name} 🌱!`;
    
    battleState.addLog(`🏆 VICTORY! ${msg}`, 'success');
    showNotification(msg, 'success');
    
    // 4. Update UI Controls for "Next Wave"
    const nextBtn = document.getElementById('next-wave-btn');
    if (nextBtn) {
        nextBtn.classList.remove('hidden');
        nextBtn.onclick = () => {
            nextBtn.classList.add('hidden');
            gameState.currentWave++;
            startWave(gameState);
        };
    }
    
    saveGame(gameState);
    updateBattleUI(gameState, battleState);
}

// ===========================
// HANDLE RUN DEFEAT
// ===========================

function handleRunDefeat(gameState, battleState) {
    if (battleState) battleState.isActive = false;
    stopBattle(gameState);
    
    battleState.addLog(`💀 DEFEAT! The team fell at Wave ${gameState.currentWave}.`, 'error');
    showNotification(`Run Over! Reached Wave ${gameState.currentWave}`, 'error');
    
    // Update Battle Status
    const battleStatus = document.getElementById('battle-status');
    if (battleStatus) {
        battleStatus.textContent = 'Run Ended';
        battleStatus.className = 'battle-status-light text-slate-500';
    }
    
    // Reset UI to Pre-Run state
    document.getElementById('pre-run-controls').classList.remove('hidden');
    document.getElementById('active-run-controls').classList.add('hidden');
    
    saveGame(gameState);
}

// ===========================
// USE CONSUMABLE (New Feature)
// ===========================

function useConsumable(gameState, itemId) {
    if (!currentBattleState || !currentBattleState.isActive) {
        showNotification('Can only use items during active battle!', 'warning');
        return;
    }
    
    const count = gameState.getItemCount('teas', itemId);
    if (count <= 0) return;
    
    const itemData = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === itemId);
    if (!itemData) return;
    
    // Apply Effect
    let used = false;
    const aliveHeroes = currentBattleState.heroes.filter(h => h.isAlive);
    
    switch (itemData.effectType) {
        case 'heal':
            aliveHeroes.forEach(h => {
                const amount = Math.floor(h.maxHP * itemData.effectValue);
                h.heal(amount);
                currentBattleState.addLog(`🍵 ${itemData.name}: Healed ${h.name} for ${amount}`, 'heal');
            });
            used = true;
            break;
            
        case 'mana':
            aliveHeroes.forEach(h => {
                h.gainMana(itemData.effectValue);
                currentBattleState.addLog(`🍵 ${itemData.name}: Restored ${itemData.effectValue} Mana to ${h.name}`, 'heal');
            });
            used = true;
            break;
            
        case 'buff_atk':
            aliveHeroes.forEach(h => {
                // Permanent buff for this run/battle
                h.atk = Math.floor(h.atk * (1 + itemData.effectValue));
                currentBattleState.addLog(`🍵 ${itemData.name}: ${h.name} ATK up by ${(itemData.effectValue*100)}%!`, 'normal');
            });
            used = true;
            break;
            
        case 'execute':
            const targets = currentBattleState.enemies.filter(e => e.isAlive && !e.isBoss && e.getHPPercent() < 30);
            if (targets.length > 0) {
                targets.forEach(e => {
                    e.takeDamage(99999);
                    currentBattleState.addLog(`🍵 ${itemData.name}: Executed ${e.name}!`, 'critical');
                });
                used = true;
            } else {
                showNotification('No valid targets (Non-boss < 30% HP)', 'warning');
            }
            break;
    }
    
    if (used) {
        gameState.removeItem('teas', itemId, 1);
        playParticleEffect(document.getElementById('battle-heroes'));
        updateBattleUI(gameState, currentBattleState);
    }
}

// ===========================
// SETUP BATTLE LISTENERS
// ===========================

function setupBattleListeners(gameState, updateUICallback) {
    // Start Run Button
    const startRunBtn = document.getElementById('start-run-btn');
    if (startRunBtn) {
        startRunBtn.onclick = () => startRun(gameState);
    }
    
    // Auto Battle
    const autoToggle = document.getElementById('auto-battle-toggle');
    if (autoToggle) {
        autoToggle.onclick = () => {
            gameState.autoCast = !gameState.autoCast;
            autoToggle.textContent = `Auto-Cast: ${gameState.autoCast ? 'ON' : 'OFF'}`;
            autoToggle.className = gameState.autoCast ? 'btn btn-primary w-full mt-2' : 'btn btn-secondary w-full mt-2';
        };
    }
    
    // Retreat Button (Optional)
    const stopBtn = document.getElementById('stop-battle-btn');
    if (stopBtn) {
        stopBtn.onclick = () => handleRunDefeat(gameState, currentBattleState);
    }
}

// ===========================
// UPDATE BATTLE UI (Extended)
// ===========================

function updateBattleUI(gameState, battleState) {
    // Standard Updates
    const waveDisplay = document.getElementById('wave-display');
    if (waveDisplay) waveDisplay.textContent = gameState.currentWave;
    
    const waveHeader = document.getElementById('wave-display-header');
    if (waveHeader) waveHeader.textContent = gameState.currentWave;
    
    // Render Heroes & Enemies
    const heroesCont = document.getElementById('battle-heroes');
    if (heroesCont && battleState) {
        heroesCont.innerHTML = '';
        battleState.heroes.forEach(h => heroesCont.appendChild(createBattleCard(h, true, gameState)));
    }
    
    const enemiesCont = document.getElementById('battle-enemies');
    if (enemiesCont && battleState) {
        enemiesCont.innerHTML = '';
        battleState.enemies.forEach(e => enemiesCont.appendChild(createBattleCard(e, false)));
    }
    
    // Logs
    const logCont = document.getElementById('battle-log');
    if (logCont && battleState) {
        logCont.innerHTML = '';
        battleState.battleLog.slice(-15).forEach(log => {
            const el = document.createElement('div');
            el.className = `log-entry text-xs mb-1 ${getLogClass(log.type)}`;
            el.textContent = log.message;
            logCont.appendChild(el);
        });
        logCont.scrollTop = logCont.scrollHeight;
    }
    
    // Render Inventory
    renderBattleInventory(gameState);
    
    // Render Ultimates
    if (battleState) renderUltimateAbilities(gameState, battleState);
}

function getLogClass(type) {
    const map = {
        'normal': 'text-slate-700',
        'damage': 'text-slate-900',
        'critical': 'text-red-600 font-bold',
        'heal': 'text-green-600',
        'ultimate': 'text-purple-600 font-bold',
        'success': 'text-amber-600 font-bold',
        'error': 'text-red-500 font-bold'
    };
    return map[type] || 'text-slate-700';
}

// ===========================
// RENDER BATTLE INVENTORY
// ===========================

function renderBattleInventory(gameState) {
    const container = document.getElementById('battle-inventory');
    if (!container) return;
    
    container.innerHTML = '';
    
    const teas = gameState.inventory.teas || {};
    Object.keys(teas).forEach(id => {
        const count = teas[id];
        const data = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === id);
        
        if (data && count > 0) {
            const el = document.createElement('div');
            el.className = 'consumable-item active';
            el.innerHTML = `<div class="text-xl">${data.emoji}</div><div class="text-xs font-bold">x${count}</div>`;
            el.title = `Use ${data.name}: ${data.desc}`;
            el.onclick = () => useConsumable(gameState, id);
            container.appendChild(el);
        }
    });
    
    // Fill empty slots
    const filled = container.children.length;
    for (let i = 0; i < (4 - filled); i++) {
        const empty = document.createElement('div');
        empty.className = 'consumable-item';
        empty.innerHTML = '<div class="text-xl opacity-20">🍵</div>';
        container.appendChild(empty);
    }
}