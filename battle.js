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
    
    battleState.addLog(`💫 ${hero.name} (Lv.${hero.level}) uses ${hero.ultimate.name}!`, 'ultimate');
    
    // Update quest progress
    gameState.updateQuest('useUltimates', 1);
    
    // Apply ultimate effects based on class
    switch (hero.class) {
        case 'Healer':
            // Heal all allies
            let totalHealing = 0;
            aliveHeroes.forEach(h => {
                const healAmount = Math.floor(150 + hero.level * 5);
                const actualHeal = h.heal(healAmount);
                totalHealing += actualHeal;
                battleState.addLog(`  💚 ${h.name} healed for ${actualHeal} HP [${h.currentHP}/${h.maxHP}]`, 'heal');
            });
            battleState.addLog(`  ✨ Total healing: ${totalHealing} HP`, 'heal');
            break;
            
        case 'Tank':
            // Buff team defense
            battleState.addLog(`  🛡️ Team DEF increased by 30% for 3 turns!`, 'normal');
            break;
            
        case 'Buffer':
            // Buff team attack
            battleState.addLog(`  ⚔️ Team ATK increased by 25% for 3 turns!`, 'normal');
            break;
            
        case 'DPS (AoE)':
            // Attack all enemies
            let totalDamage = 0;
            let enemiesKilled = 0;
            aliveEnemies.forEach(enemy => {
                const damage = calculateDamage(hero, enemy, 1.5);
                const actualDamage = enemy.takeDamage(damage);
                totalDamage += actualDamage;
                battleState.addLog(`  💥 ${enemy.name} takes ${actualDamage} damage [${enemy.currentHP}/${enemy.maxHP}]`, 'damage');
                
                if (!enemy.isAlive) {
                    battleState.addLog(`  ☠️ ${enemy.name} defeated!`, 'normal');
                    gameState.enemiesDefeated++;
                    enemiesKilled++;
                }
            });
            battleState.addLog(`  ⚡ Total AoE damage: ${totalDamage} | Enemies defeated: ${enemiesKilled}`, 'damage');
            break;
            
        case 'DPS (Single)':
            // Massive single target damage
            const target = aliveEnemies[0];
            const damage = calculateDamage(hero, target, 3.0);
            const actualDamage = target.takeDamage(damage);
            battleState.addLog(`  💢 ${target.name} takes ${actualDamage} MASSIVE damage! [${target.currentHP}/${target.maxHP}]`, 'critical');
            
            if (!target.isAlive) {
                battleState.addLog(`  ☠️ ${target.name} obliterated!`, 'normal');
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
        battleState.addLog(`💨 ${defender.name} dodged ${attacker.name}'s attack!`, 'normal');
        return;
    }
    
    const finalDamage = isCrit ? Math.floor(damage * 1.5) : damage;
    const actualDamage = defender.takeDamage(finalDamage);
    
    // Build detailed log message
    let logMessage = '';
    if (isCrit) {
        logMessage = `💥 ${attacker.name} (ATK: ${attacker.atk}) landed a CRITICAL hit on ${defender.name} (DEF: ${defender.def}) for ${actualDamage} damage! [${defender.currentHP}/${defender.maxHP} HP remaining]`;
        battleState.addLog(logMessage, 'critical');
    } else {
        logMessage = `⚔️ ${attacker.name} (ATK: ${attacker.atk}) attacks ${defender.name} (DEF: ${defender.def}) for ${actualDamage} damage [${defender.currentHP}/${defender.maxHP} HP remaining]`;
        battleState.addLog(logMessage, 'damage');
    }
    
    // Gain mana for heroes
    if (isHeroAttacking) {
        attacker.gainMana(15);
        if (attacker.mana === attacker.maxMana) {
            battleState.addLog(`✨ ${attacker.name}'s ultimate is ready! [${attacker.mana}/${attacker.maxMana} Mana]`, 'normal');
        }
    } else {
        // Hero takes damage, gain mana
        defender.gainMana(10);
        if (defender.mana === defender.maxMana) {
            battleState.addLog(`✨ ${defender.name}'s ultimate is ready! [${defender.mana}/${defender.maxMana} Mana]`, 'normal');
        }
    }
    
    // Check if defender died
    if (!defender.isAlive) {
        battleState.addLog(`☠️ ${defender.name} has been defeated!`, 'normal');
        
        if (!isHeroAttacking) {
            // Hero died
        } else {
            // Enemy died - track for quests
            if (defender.constructor.name === 'Enemy') {
                // This will be tracked in handleBattleVictory
            }
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
    gameState.updateQuest('killEnemies', battleState.enemies.length);
    
    // Show victory notification
    let rewardText = `+${gold} Gold`;
    if (petals > 0) rewardText += `, +${petals} Petals`;
    if (orbs > 0) rewardText += `, +${orbs} Orbs`;
    
    showNotification(`🎉 Wave ${gameState.currentWave} Complete! ${rewardText}`, 'success');
    
    // Show "Next Wave" button
    showNextWaveButton(gameState);
    
    saveGame(gameState);
}

// ===========================
// SHOW NEXT WAVE BUTTON
// ===========================

function showNextWaveButton(gameState) {
    const startBattleBtn = document.getElementById('start-battle-btn');
    
    if (startBattleBtn) {
        startBattleBtn.textContent = 'Next Wave';
        startBattleBtn.className = 'btn btn-primary w-full';
        startBattleBtn.style.animation = 'pulse 1.5s infinite';
        
        // Add pulse animation if not exists
        if (!document.getElementById('pulse-animation')) {
            const style = document.createElement('style');
            style.id = 'pulse-animation';
            style.textContent = `
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `;
            document.head.appendChild(style);
        }
    }
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
    
    // Unit name overlay
    const nameOverlay = document.createElement('div');
    nameOverlay.className = 'battle-card-name';
    nameOverlay.textContent = unit.name;
    card.appendChild(nameOverlay);
    
    // Level badge for heroes
    if (isHero) {
        const levelBadge = document.createElement('div');
        levelBadge.className = 'battle-card-level-badge';
        levelBadge.textContent = `Lv.${unit.level}`;
        card.appendChild(levelBadge);
    }
    
    // Stats overlay
    const statsOverlay = document.createElement('div');
    statsOverlay.className = 'battle-card-stats';
    statsOverlay.innerHTML = `
        <div class="battle-stat">⚔️ ${unit.atk}</div>
        <div class="battle-stat">🛡️ ${unit.def}</div>
        <div class="battle-stat">⚡ ${unit.spd}</div>
    `;
    card.appendChild(statsOverlay);
    
    // HP and Mana bars container
    const barsContainer = document.createElement('div');
    barsContainer.className = 'battle-card-bars';
    
    // HP text and bar
    const hpText = document.createElement('div');
    hpText.className = 'battle-bar-text';
    hpText.textContent = `HP: ${unit.currentHP}/${unit.maxHP}`;
    barsContainer.appendChild(hpText);
    
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
    barsContainer.appendChild(hpBar);
    
    // Mana bar for heroes
    if (isHero) {
        const manaText = document.createElement('div');
        manaText.className = 'battle-bar-text';
        manaText.textContent = `Mana: ${unit.mana}/${unit.maxMana}`;
        barsContainer.appendChild(manaText);
        
        const manaBar = document.createElement('div');
        manaBar.className = 'mana-bar';
        
        const manaFill = document.createElement('div');
        manaFill.className = 'mana-bar-fill';
        manaFill.style.width = `${unit.getManaPercent()}%`;
        
        manaBar.appendChild(manaFill);
        barsContainer.appendChild(manaBar);
        
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
    
    card.appendChild(barsContainer);
    
    // Add tooltip on hover
    card.title = isHero ? 
        `${unit.name} (Lv.${unit.level})\nHP: ${unit.currentHP}/${unit.maxHP}\nATK: ${unit.atk} | DEF: ${unit.def} | SPD: ${unit.spd}\n${unit.element} | ${unit.class}` :
        `${unit.name}\nHP: ${unit.currentHP}/${unit.maxHP}\nATK: ${unit.atk} | DEF: ${unit.def} | SPD: ${unit.spd}\n${unit.element}`;
    
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
            // Remove pulse animation when clicked
            startBattleBtn.style.animation = '';
            
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
            startBattleBtn.style.animation = '';
        } else {
            // Check if we just completed a wave
            if (gameState.currentWave > 0) {
                startBattleBtn.textContent = 'Next Wave';
            } else {
                startBattleBtn.textContent = 'Start Battle';
            }
            startBattleBtn.className = 'btn btn-primary w-full';
        }
    }
}
