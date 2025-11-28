/* ===========================
   SAKURA CHRONICLES - BATTLE
   Auto-Battle System
   =========================== */

let battleInterval = null;
let currentBattleState = null;

// ===========================
// BATTLE STATE
// ===========================

class BattleState {
    constructor(heroes, waveNumber, skillTreeBonuses) {
        this.heroes = heroes.map(h => {
            h.resetForBattle(skillTreeBonuses);
            return h;
        });
        this.enemies = [];
        this.waveNumber = waveNumber;
        this.isActive = true;
        this.battleLog = [];
        this.turnCounter = 0;
        this.skillTreeBonuses = skillTreeBonuses;
        
        this.spawnEnemies();
    }
    
    spawnEnemies() {
        const enemyCount = Math.min(5, 2 + Math.floor(this.waveNumber / 5));
        this.enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            // Select random enemy based on wave number
            let enemyPool;
            if (this.waveNumber <= 10) {
                enemyPool = ENEMIES_DATABASE.slice(0, 5);
            } else if (this.waveNumber <= 30) {
                enemyPool = ENEMIES_DATABASE.slice(5, 10);
            } else if (this.waveNumber <= 50) {
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
    
    checkVictory() {
        return this.enemies.every(e => !e.isAlive);
    }
    
    checkDefeat() {
        return this.heroes.every(h => !h.isAlive);
    }
}

// ===========================
// START BATTLE
// ===========================

function startBattle(gameState) {
    const team = gameState.getTeamHeroes();
    
    if (team.length === 0) {
        showNotification('Please select at least one hero for your team!', 'error');
        return;
    }
    
    gameState.isBattleActive = true;
    gameState.currentWave++;
    
    const skillTreeBonuses = gameState.getSkillTreeBonuses();
    currentBattleState = new BattleState(team, gameState.currentWave, skillTreeBonuses);
    
    currentBattleState.addLog(`⚔️ Wave ${gameState.currentWave} Started!`, 'normal');
    
    updateBattleUI(gameState, currentBattleState);
    
    // Start battle loop
    battleInterval = setInterval(() => {
        processBattleTurn(gameState, currentBattleState);
    }, 1000);
    
    gameState.stats.totalBattles++;
}

// ===========================
// STOP BATTLE
// ===========================

function stopBattle(gameState) {
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
    
    gameState.isBattleActive = false;
    currentBattleState = null;
}

// ===========================
// PROCESS BATTLE TURN
// ===========================

function processBattleTurn(gameState, battleState) {
    if (!battleState.isActive) return;
    
    battleState.turnCounter++;
    
    // Get all alive combatants
    const aliveHeroes = battleState.heroes.filter(h => h.isAlive);
    const aliveEnemies = battleState.enemies.filter(e => e.isAlive);
    
    if (aliveHeroes.length === 0) {
        // Defeat
        handleBattleDefeat(gameState, battleState);
        return;
    }
    
    if (aliveEnemies.length === 0) {
        // Victory
        handleBattleVictory(gameState, battleState);
        return;
    }
    
    // Create turn order based on speed
    const turnOrder = [
        ...aliveHeroes.map(h => ({ unit: h, isHero: true })),
        ...aliveEnemies.map(e => ({ unit: e, isHero: false }))
    ].sort((a, b) => b.unit.spd - a.unit.spd);
    
    // Process each unit's action
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
// PROCESS HERO ACTION
// ===========================

function processHeroAction(hero, battleState, gameState) {
    const aliveEnemies = battleState.enemies.filter(e => e.isAlive);
    if (aliveEnemies.length === 0) return;
    
    // Check if should use ultimate (auto-cast or manual ready)
    if (hero.canUseUltimate() && gameState.autoCast) {
        useHeroUltimate(hero, battleState, gameState);
        return;
    }
    
    // Normal attack
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
    
    // Update quest progress
    gameState.updateQuest('useUltimates', 1);
    
    // Apply ultimate effects based on class
    switch (hero.class) {
        case 'Healer':
            // Heal all allies
            aliveHeroes.forEach(h => {
                const healAmount = Math.floor(150 + hero.level * 5);
                const actualHeal = h.heal(healAmount);
                battleState.addLog(`  ${h.name} healed for ${actualHeal} HP`, 'heal');
            });
            break;
            
        case 'Tank':
            // Buff team defense
            battleState.addLog(`  Team DEF increased!`, 'normal');
            break;
            
        case 'Buffer':
            // Buff team attack
            battleState.addLog(`  Team ATK increased!`, 'normal');
            break;
            
        case 'DPS (AoE)':
            // Attack all enemies
            aliveEnemies.forEach(enemy => {
                const damage = calculateDamage(hero, enemy, 1.5);
                const actualDamage = enemy.takeDamage(damage);
                battleState.addLog(`  ${enemy.name} takes ${actualDamage} damage`, 'damage');
                
                if (!enemy.isAlive) {
                    battleState.addLog(`  ${enemy.name} defeated!`, 'normal');
                    gameState.enemiesDefeated++;
                }
            });
            break;
            
        case 'DPS (Single)':
            // Massive single target damage
            const target = aliveEnemies[0];
            const damage = calculateDamage(hero, target, 3.0);
            const actualDamage = target.takeDamage(damage);
            battleState.addLog(`  ${target.name} takes ${actualDamage} critical damage!`, 'critical');
            
            if (!target.isAlive) {
                battleState.addLog(`  ${target.name} defeated!`, 'normal');
                gameState.enemiesDefeated++;
            }
            break;
    }
    
    // Visual effect
    playParticleEffect(document.querySelector(`[data-hero-id="${hero.id}"]`));
}

// ===========================
// PROCESS ENEMY ACTION
// ===========================

function processEnemyAction(enemy, battleState) {
    const aliveHeroes = battleState.heroes.filter(h => h.isAlive);
    if (aliveHeroes.length === 0) return;
    
    // Target random hero
    const target = aliveHeroes[Math.floor(Math.random() * aliveHeroes.length)];
    performAttack(enemy, target, battleState, false);
}

// ===========================
// PERFORM ATTACK
// ===========================

function performAttack(attacker, defender, battleState, isHeroAttacking) {
    const damage = calculateDamage(attacker, defender, 1.0);
    const isCrit = Math.random() < 0.15; // 15% crit chance base
    const isDodge = Math.random() < 0.10; // 10% dodge chance base
    
    if (isDodge) {
        battleState.addLog(`${defender.name} dodged the attack!`, 'normal');
        return;
    }
    
    const finalDamage = isCrit ? Math.floor(damage * 1.5) : damage;
    const actualDamage = defender.takeDamage(finalDamage);
    
    if (isCrit) {
        battleState.addLog(`💥 ${attacker.name} lands a CRITICAL hit on ${defender.name} for ${actualDamage} damage!`, 'critical');
    } else {
        battleState.addLog(`${attacker.name} attacks ${defender.name} for ${actualDamage} damage`, 'damage');
    }
    
    // Gain mana for heroes
    if (isHeroAttacking) {
        attacker.gainMana(15);
    } else {
        // Hero takes damage, gain mana
        defender.gainMana(10);
    }
    
    // Check if defender died
    if (!defender.isAlive) {
        battleState.addLog(`☠️ ${defender.name} has been defeated!`, 'normal');
        
        if (!isHeroAttacking) {
            // Hero died
        } else {
            // Enemy died
            // Enemies defeated is tracked elsewhere
        }
    }
}

// ===========================
// CALCULATE DAMAGE
// ===========================

function calculateDamage(attacker, defender, multiplier = 1.0) {
    let baseDamage = attacker.atk * multiplier;
    
    // Apply element advantage
    if (attacker.element && defender.element) {
        const advantage = ELEMENT_ADVANTAGE[attacker.element];
        
        if (advantage && advantage.strong === defender.element) {
            baseDamage *= 1.5; // 50% more damage
        } else if (advantage && advantage.weak === defender.element) {
            baseDamage *= 0.75; // 25% less damage
        }
    }
    
    // Apply defense reduction
    const damage = Math.max(1, baseDamage - defender.def * 0.5);
    
    return Math.floor(damage);
}

// ===========================
// HANDLE BATTLE VICTORY
// ===========================

function handleBattleVictory(gameState, battleState) {
    battleState.isActive = false;
    stopBattle(gameState);
    
    // Calculate rewards
    const goldBonus = gameState.getSkillTreeBonuses().goldBonus || 0;
    const petalBonus = gameState.getSkillTreeBonuses().petalBonus || 0;
    const orbBonus = gameState.getSkillTreeBonuses().orbBonus || 0;
    
    const baseGold = 50 + gameState.currentWave * 10;
    const gold = Math.floor(baseGold * (1 + goldBonus / 100));
    
    let petals = 0;
    let orbs = 0;
    
    // Wave rewards
    if (gameState.currentWave % 10 === 0) {
        // Boss wave
        petals = Math.floor((5 + Math.floor(gameState.currentWave / 10)) * (1 + petalBonus / 100));
        orbs = Math.floor((2 + Math.floor(gameState.currentWave / 20)) * (1 + orbBonus / 100));
    } else {
        // Regular wave
        if (Math.random() < 0.1) {
            petals = Math.floor(1 * (1 + petalBonus / 100));
        }
    }
    
    gameState.gold += gold;
    gameState.petals += petals;
    gameState.spiritOrbs += orbs;
    gameState.stats.totalGoldEarned += gold;
    
    // Update highest wave
    if (gameState.currentWave > gameState.highestWave) {
        gameState.highestWave = gameState.currentWave;
    }
    
    // Add bond to heroes
    battleState.heroes.forEach(hero => {
        const originalHero = gameState.roster.find(h => h.id === hero.id);
        if (originalHero) {
            originalHero.addBond(10);
        }
    });
    
    // Update quest progress
    gameState.updateQuest('completeWaves', 1);
    
    // Show victory notification
    let rewardText = `+${gold} Gold`;
    if (petals > 0) rewardText += `, +${petals} Petals`;
    if (orbs > 0) rewardText += `, +${orbs} Orbs`;
    
    showNotification(`🎉 Wave ${gameState.currentWave} Complete! ${rewardText}`, 'success');
    
    // Auto-continue to next wave after 2 seconds
    setTimeout(() => {
        if (gameState.isBattleActive) {
            startBattle(gameState);
        }
    }, 2000);
    
    saveGame(gameState);
}

// ===========================
// HANDLE BATTLE DEFEAT
// ===========================

function handleBattleDefeat(gameState, battleState) {
    battleState.isActive = false;
    stopBattle(gameState);
    
    gameState.currentWave = Math.max(1, gameState.currentWave - 1);
    
    showNotification('💀 Your team has been defeated! Try again.', 'error');
    
    saveGame(gameState);
}

// ===========================
// UPDATE BATTLE UI
// ===========================

function updateBattleUI(gameState, battleState) {
    if (!battleState) return;
    
    // Update wave display
    const waveDisplay = document.getElementById('wave-display');
    if (waveDisplay) {
        waveDisplay.textContent = gameState.currentWave;
    }
    
    // Update heroes display
    const heroesContainer = document.getElementById('battle-heroes');
    if (heroesContainer) {
        heroesContainer.innerHTML = '';
        
        battleState.heroes.forEach(hero => {
            const card = createBattleCard(hero, true, gameState);
            heroesContainer.appendChild(card);
        });
    }
    
    // Update enemies display
    const enemiesContainer = document.getElementById('battle-enemies');
    if (enemiesContainer) {
        enemiesContainer.innerHTML = '';
        
        battleState.enemies.forEach(enemy => {
            const card = createBattleCard(enemy, false);
            enemiesContainer.appendChild(card);
        });
    }
    
    // Update battle log
    const logContainer = document.getElementById('battle-log');
    if (logContainer) {
        logContainer.innerHTML = '';
        
        // Show last 10 log entries
        const recentLogs = battleState.battleLog.slice(-10);
        recentLogs.forEach(log => {
            const entry = document.createElement('div');
            entry.className = `log-entry log-${log.type}`;
            entry.textContent = log.message;
            logContainer.appendChild(entry);
        });
        
        // Scroll to bottom
        logContainer.scrollTop = logContainer.scrollHeight;
    }
}

// ===========================
// CREATE BATTLE CARD
// ===========================

function createBattleCard(unit, isHero, gameState = null) {
    const card = document.createElement('div');
    card.className = `battle-card ${unit.isAlive ? '' : 'dead'}`;
    
    if (isHero) {
        card.setAttribute('data-hero-id', unit.id);
        
        if (unit.canUseUltimate()) {
            card.classList.add('ultimate-ready');
        }
    }
    
    // Image or placeholder
    const img = document.createElement('img');
    img.className = 'battle-card-image';
    
    if (isHero) {
        img.src = `/images/${unit.id}.jpg`;
        img.onerror = function() {
            const placeholder = createHeroPlaceholder(unit);
            placeholder.className = 'battle-card-placeholder';
            img.replaceWith(placeholder);
        };
    } else {
        img.src = `/images/enemies/${unit.id}.jpg`;
        img.onerror = function() {
            const placeholder = createEnemyPlaceholder(unit);
            placeholder.className = 'battle-card-placeholder';
            img.replaceWith(placeholder);
        };
    }
    
    card.appendChild(img);
    
    // HP and Mana bars
    const hpContainer = document.createElement('div');
    hpContainer.className = 'battle-card-hp';
    
    const hpBar = document.createElement('div');
    hpBar.className = 'hp-bar';
    
    const hpFill = document.createElement('div');
    hpFill.className = 'hp-bar-fill';
    hpFill.style.width = `${unit.getHPPercent()}%`;
    
    // Change color based on HP
    if (unit.getHPPercent() <= 25) {
        hpFill.style.background = 'linear-gradient(90deg, #ef4444, #f87171)';
    } else if (unit.getHPPercent() <= 50) {
        hpFill.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
    }
    
    hpBar.appendChild(hpFill);
    hpContainer.appendChild(hpBar);
    
    // Mana bar for heroes
    if (isHero) {
        const manaBar = document.createElement('div');
        manaBar.className = 'mana-bar';
        
        const manaFill = document.createElement('div');
        manaFill.className = 'mana-bar-fill';
        manaFill.style.width = `${unit.getManaPercent()}%`;
        
        manaBar.appendChild(manaFill);
        hpContainer.appendChild(manaBar);
        
        // Click to use ultimate manually
        if (!gameState?.autoCast && unit.canUseUltimate()) {
            card.style.cursor = 'pointer';
            card.onclick = () => {
                if (currentBattleState && unit.canUseUltimate()) {
                    useHeroUltimate(unit, currentBattleState, gameState);
                    updateBattleUI(gameState, currentBattleState);
                }
            };
        }
    }
    
    card.appendChild(hpContainer);
    
    return card;
}

// ===========================
// SETUP BATTLE LISTENERS
// ===========================

function setupBattleListeners(gameState, updateUI) {
    const startBattleBtn = document.getElementById('start-battle-btn');
    const autoBattleToggle = document.getElementById('auto-battle-toggle');
    
    if (startBattleBtn) {
        startBattleBtn.onclick = () => {
            if (!gameState.isBattleActive) {
                startBattle(gameState);
                updateUI();
            } else {
                stopBattle(gameState);
                updateUI();
            }
        };
    }
    
    if (autoBattleToggle) {
        autoBattleToggle.onclick = () => {
            gameState.autoCast = !gameState.autoCast;
            autoBattleToggle.textContent = `Auto-Cast: ${gameState.autoCast ? 'ON' : 'OFF'}`;
            autoBattleToggle.className = gameState.autoCast ? 'btn btn-primary w-full' : 'btn btn-secondary w-full';
        };
    }
}

// ===========================
// UPDATE BATTLE BUTTON STATE
// ===========================

function updateBattleButtonState(gameState) {
    const startBattleBtn = document.getElementById('start-battle-btn');
    
    if (startBattleBtn) {
        if (gameState.isBattleActive) {
            startBattleBtn.textContent = 'Stop Battle';
            startBattleBtn.className = 'btn btn-secondary w-full';
        } else {
            startBattleBtn.textContent = 'Start Battle';
            startBattleBtn.className = 'btn btn-primary w-full';
        }
    }
}
