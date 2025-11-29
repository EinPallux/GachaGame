/* =========================================
   SAKURA CHRONICLES - BATTLE ENGINE
   Roguelike Combat System & UI
   ========================================= */

let battleInterval = null;
let currentBattleState = null;
let isAnimationPlaying = false; 

// ===========================
// BATTLE STATE MODEL
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
        this.turnCounter = 0;
        this.skillTreeBonuses = skillTreeBonuses;
        this.combatLog = [];
        this.waveComplete = false;
        
        this.spawnEnemies();
    }
    
    spawnEnemies() {
        let baseCount = 1;
        if (this.waveNumber >= 3) baseCount = 2;
        if (this.waveNumber >= 8) baseCount = 3;
        if (this.waveNumber >= 15) baseCount = 4;
        
        const variation = Math.floor(Math.random() * 2);
        const enemyCount = Math.min(5, baseCount + variation);
        
        this.enemies = [];
        
        for (let i = 0; i < enemyCount; i++) {
            let poolRange = [0, 5];
            if (this.waveNumber > 10) poolRange = [5, 10];
            if (this.waveNumber > 25) poolRange = [10, 15];
            if (this.waveNumber > 40) poolRange = [15, 20];
            
            const pool = ENEMIES_DATABASE.slice(poolRange[0], poolRange[1]);
            const template = pool[Math.floor(Math.random() * pool.length)] || ENEMIES_DATABASE[0];
            
            const instanceId = `${template.id}_${Date.now()}_${i}`;
            const enemy = new Enemy(template, this.waveNumber);
            enemy.instanceId = instanceId; 
            this.enemies.push(enemy);
        }
    }
    
    addLog(message, type='neutral') {
        this.combatLog.unshift({ message, type, id: Date.now() });
        if (this.combatLog.length > 20) this.combatLog.pop();
    }
}

// ===========================
// CORE LOOP CONTROLS
// ===========================

function startRun(gameState) {
    const team = gameState.getTeamHeroes();
    if (team.length === 0) {
        showToast('Please add heroes to your team first!', 'error');
        return;
    }
    
    // Recovery at start of run only
    gameState.recoverTeam();
    
    gameState.currentWave = 1;
    gameState.enemiesDefeated = 0;
    gameState.isBattleActive = true;
    
    renderBattleDashboard(gameState);
    startWave(gameState);
}

function startWave(gameState) {
    const team = gameState.getTeamHeroes();
    const aliveCount = team.filter(h => h.isAlive).length;
    
    if (aliveCount === 0) {
        handleRunDefeat(gameState);
        return;
    }

    const bonuses = gameState.getSkillTreeBonuses();
    currentBattleState = new BattleState(team, gameState.currentWave, bonuses);
    currentBattleState.addLog(`Wave ${gameState.currentWave} Started!`, 'info');
    
    const nextBtn = document.getElementById('next-wave-container');
    if (nextBtn) nextBtn.classList.add('hidden');
    
    updateBattleUI(gameState, currentBattleState);
    
    if (battleInterval) clearInterval(battleInterval);
    
    // Slow loop: 2.5 seconds per turn to allow animations to breathe
    battleInterval = setInterval(() => {
        if (!isAnimationPlaying && !currentBattleState.waveComplete) {
            processBattleTurn(gameState, currentBattleState);
        }
    }, 2500); 
}

function stopBattle(gameState) {
    if (battleInterval) {
        clearInterval(battleInterval);
        battleInterval = null;
    }
    gameState.isBattleActive = false;
    renderBattleDashboard(gameState);
}

// ===========================
// TURN LOGIC
// ===========================

function processBattleTurn(gameState, battleState) {
    if (!battleState.isActive || battleState.waveComplete) return;
    
    battleState.turnCounter++;
    
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
    
    const allUnits = [
        ...aliveHeroes.map(h => ({ unit: h, isHero: true })),
        ...aliveEnemies.map(e => ({ unit: e, isHero: false }))
    ].sort((a, b) => b.unit.spd - a.unit.spd);
    
    let delay = 0;
    const turnDuration = 1500; // Time per unit action
    
    isAnimationPlaying = true; 
    
    allUnits.forEach(({ unit, isHero }, index) => {
        setTimeout(() => {
            // Re-check alive status and victory state inside the loop
            if (!unit.isAlive || !battleState.isActive || battleState.waveComplete) return;
            
            // Check if enemies/heroes are still alive to receive attacks
            const currentAliveEnemies = battleState.enemies.filter(e => e.isAlive);
            const currentAliveHeroes = battleState.heroes.filter(h => h.isAlive);

            if (currentAliveHeroes.length === 0 || currentAliveEnemies.length === 0) return;

            highlightActiveUnit(unit);

            if (isHero) {
                if (gameState.autoCast && unit.canUseUltimate()) {
                    useHeroUltimate(unit, battleState, gameState);
                } else {
                    const target = getRandomTarget(battleState.enemies);
                    if (target) performAttack(unit, target, battleState, true);
                }
            } else {
                const target = getRandomTarget(battleState.heroes);
                if (target) performAttack(unit, target, battleState, false);
            }
            
        }, index * turnDuration);
        
        delay = (index + 1) * turnDuration;
    });

    setTimeout(() => {
        removeActiveHighlights();
        isAnimationPlaying = false;
    }, delay);
}

function getRandomTarget(units) {
    const alive = units.filter(u => u.isAlive);
    if (alive.length === 0) return null;
    return alive[Math.floor(Math.random() * alive.length)];
}

function performAttack(attacker, defender, battleState, isHero) {
    // Determine Damage
    let damage = Math.max(1, attacker.atk - (defender.def * 0.5));
    
    if (attacker.element && defender.element) {
        const adv = ELEMENT_ADVANTAGE[attacker.element];
        if (adv && adv.strong === defender.element) damage *= 1.5;
        if (adv && adv.weak === defender.element) damage *= 0.75;
    }
    
    const isCrit = Math.random() < 0.15;
    if (isCrit) damage *= 1.5;
    
    damage = Math.floor(damage);
    
    // Trigger Animation (Lunge) - Immediate
    playAttackAnimation(attacker, isHero ? 'right' : 'left');
    
    // Impact Event (Delayed to sync with animation)
    setTimeout(() => {
        playHitAnimation(defender);
        defender.takeDamage(damage);
        
        if (isHero) attacker.gainMana(15);
        else defender.gainMana(10);
        
        const critText = isCrit ? ' CRIT!' : '';
        battleState.addLog(`${attacker.name} hit ${defender.name} for ${damage}${critText}`, isHero ? 'success' : 'warning');
        
        showFloatingText(defender, `-${damage}${critText}`, isCrit ? 'crit' : 'damage');
        
        // --- QUEST TRACKING FIX ---
        if (isHero && !defender.isAlive) {
            window.gameState.updateQuest('killEnemies', 1);
        }
        // -------------------------

        // Update UI *BEFORE* checking victory so the empty HP bar is shown
        updateBattleUI(window.gameState, battleState); 

        // VICTORY / DEFEAT CHECKS
        if (isHero) {
            const livingEnemies = battleState.enemies.filter(e => e.isAlive);
            if (livingEnemies.length === 0) {
                setTimeout(() => handleWaveVictory(window.gameState, battleState), 200);
                return;
            }
        } else {
            const livingHeroes = battleState.heroes.filter(h => h.isAlive);
            if (livingHeroes.length === 0) {
                setTimeout(() => handleRunDefeat(window.gameState, battleState), 200);
                return;
            }
        }

    }, 300); // 300ms delay for hit impact
}

function useHeroUltimate(hero, battleState, gameState) {
    if (!hero.canUseUltimate()) return;
    
    hero.useUltimate();
    playCastAnimation(hero); 
    
    battleState.addLog(`${hero.name} cast ${hero.ultimate.name}!`, 'special');
    showFloatingText(hero, 'ULTIMATE!', 'heal');
    
    const aliveHeroes = battleState.heroes.filter(h => h.isAlive);
    const aliveEnemies = battleState.enemies.filter(e => e.isAlive);
    
    setTimeout(() => {
        if (hero.class === 'Healer') {
            aliveHeroes.forEach(h => {
                const heal = Math.floor(hero.atk * 3);
                h.heal(heal);
                showFloatingText(h, `+${heal}`, 'heal');
                playCastAnimation(h); 
            });
        } else if (hero.class === 'DPS (AoE)') {
            aliveEnemies.forEach(e => {
                const dmg = Math.floor(hero.atk * 1.5);
                e.takeDamage(dmg);
                playHitAnimation(e);
                showFloatingText(e, `-${dmg}`, 'damage');
                
                // Quest Check for AoE
                if (!e.isAlive) gameState.updateQuest('killEnemies', 1);
            });
        } else {
            const target = getRandomTarget(aliveEnemies);
            if (target) {
                const dmg = Math.floor(hero.atk * 3.5);
                target.takeDamage(dmg);
                playHitAnimation(target);
                showFloatingText(target, `-${dmg}`, 'crit');
                
                // Quest Check for Single Target
                if (!target.isAlive) gameState.updateQuest('killEnemies', 1);
            }
        }
        
        // Check victory after ultimate
        updateBattleUI(gameState, battleState);
        
        const livingEnemies = battleState.enemies.filter(e => e.isAlive);
        if (livingEnemies.length === 0) {
            setTimeout(() => handleWaveVictory(gameState, battleState), 200);
            return;
        }

        gameState.updateQuest('useUltimates', 1);
    }, 400); 
}

// ===========================
// ANIMATION HELPERS
// ===========================

function getUnitElement(unit) {
    const id = unit.instanceId || unit.id;
    return document.querySelector(`[data-unit-id="${id}"]`);
}

function highlightActiveUnit(unit) {
    removeActiveHighlights();
    const el = getUnitElement(unit);
    if (el) el.classList.add('active-turn');
}

function removeActiveHighlights() {
    document.querySelectorAll('.active-turn').forEach(el => el.classList.remove('active-turn'));
}

function playAttackAnimation(unit, direction) {
    const el = getUnitElement(unit);
    if (!el) return;
    
    const animClass = direction === 'right' ? 'anim-lunge-right' : 'anim-lunge-left';
    el.classList.remove(animClass); // Reset
    void el.offsetWidth; // Trigger reflow to restart animation
    el.classList.add(animClass);
    
    setTimeout(() => el.classList.remove(animClass), 600);
}

function playHitAnimation(unit) {
    const el = getUnitElement(unit);
    if (!el) return;
    
    el.classList.remove('anim-hit');
    void el.offsetWidth;
    el.classList.add('anim-hit');
    
    setTimeout(() => el.classList.remove('anim-hit'), 500);
}

function playCastAnimation(unit) {
    const el = getUnitElement(unit);
    if (!el) return;
    
    el.classList.remove('anim-cast');
    void el.offsetWidth;
    el.classList.add('anim-cast');
    
    setTimeout(() => el.classList.remove('anim-cast'), 800);
}

// ===========================
// RENDERING & UI
// ===========================

function renderBattleDashboard(gameState) {
    const container = document.getElementById('battle-tab');
    if (!container) return;

    // SCENE 1: PRE-BATTLE
    if (!gameState.isBattleActive) {
        renderPreBattleScreen(container, gameState);
        return;
    }

    // SCENE 2: ACTIVE BATTLE LAYOUT
    if (!document.getElementById('battle-dashboard-grid')) {
        container.innerHTML = `
            <div id="battle-dashboard-grid" class="battle-dashboard animate-entry h-[calc(100vh-140px)] min-h-[600px]">
                <div class="flex flex-col gap-4 h-full">
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Run Stats</h3>
                        <div class="grid grid-cols-2 gap-2">
                            <div class="bg-slate-50 p-2 rounded text-center">
                                <div class="text-xs text-slate-400">Wave</div>
                                <div class="font-heading font-bold text-xl text-primary" id="dash-wave">1</div>
                            </div>
                            <div class="bg-slate-50 p-2 rounded text-center">
                                <div class="text-xs text-slate-400">Kills</div>
                                <div class="font-heading font-bold text-xl text-slate-700" id="dash-kills">0</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex-1 flex flex-col overflow-hidden">
                        <h3 class="font-bold text-slate-700 text-sm mb-2 uppercase tracking-wider">Combat Log</h3>
                        <div id="combat-log" class="flex-1 overflow-y-auto text-xs space-y-1.5 font-mono bg-slate-50 p-2 rounded inner-shadow"></div>
                    </div>
                </div>

                <div class="flex flex-col gap-4 relative h-full">
                    <div class="flex-1 rounded-xl border border-red-100 flex items-center justify-center p-4 relative overflow-hidden group bg-slate-50/50">
                        <div class="absolute top-2 left-3 text-xs font-bold text-red-400 uppercase tracking-widest z-0">Enemies</div>
                        <div id="arena-enemies" class="flex gap-4 justify-center flex-wrap w-full items-end min-h-[220px] z-10"></div>
                    </div>
                    
                    <div class="h-12 flex items-center justify-center relative">
                        <span class="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full z-10">VS</span>
                        
                        <div id="next-wave-container" class="absolute inset-0 flex items-center justify-center z-50 hidden">
                             <button class="btn btn-primary animate-bounce shadow-lg px-8 py-3 text-lg border-2 border-white" onclick="startWave(window.gameState)">
                                Next Wave <i class="fa-solid fa-arrow-right ml-2"></i>
                             </button>
                        </div>
                    </div>

                    <div class="flex-1 rounded-xl border border-blue-100 flex items-center justify-center p-4 relative overflow-hidden bg-slate-50/50">
                        <div class="absolute top-2 left-3 text-xs font-bold text-blue-400 uppercase tracking-widest z-0">Heroes</div>
                        <div id="arena-heroes" class="flex gap-4 justify-center flex-wrap w-full items-end min-h-[220px] z-10"></div>
                    </div>
                </div>

                <div class="flex flex-col gap-4 battle-dashboard-right h-full overflow-y-auto">
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Ultimates</h3>
                        <div id="ultimates-list" class="space-y-2"></div>
                    </div>

                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex-1">
                        <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Brewed Teas</h3>
                        <div id="battle-tea-list" class="grid grid-cols-2 gap-2"></div>
                    </div>

                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mt-auto">
                        <button id="auto-btn" class="btn w-full mb-2 ${gameState.autoCast ? 'btn-primary' : 'btn-secondary'}" onclick="toggleAutoCast()">
                            <i class="fa-solid fa-robot"></i> <span id="auto-btn-text">${gameState.autoCast ? 'Auto: ON' : 'Auto: OFF'}</span>
                        </button>
                        <button class="btn btn-secondary w-full text-red-500 border-red-100 hover:bg-red-50" onclick="handleRunDefeat(gameState)">
                            <i class="fa-solid fa-flag"></i> Retreat
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (currentBattleState) updateBattleUI(gameState, currentBattleState);
}

function renderPreBattleScreen(container, gameState) {
    container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center animate-entry py-12';
    
    wrapper.innerHTML = `
        <div class="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-400 text-4xl mb-6 shadow-sm">
            <i class="fa-solid fa-dungeon"></i>
        </div>
        <h2 class="text-3xl font-heading font-bold text-slate-800 mb-2">Battle Arena</h2>
        <p class="text-slate-500 mb-8">
            Enter the Roguelike dungeon. Your team will fight through endless waves. 
            Health does not regenerate between waves!
        </p>
    `;
    
    const teamBox = document.createElement('div');
    teamBox.className = 'bg-white p-6 rounded-xl border border-slate-100 w-full mb-8 text-left';
    
    const header = document.createElement('h3');
    header.className = 'font-bold text-slate-700 mb-4 flex justify-between';
    header.innerHTML = `<span>Current Team</span><button class="text-sm text-primary hover:underline" onclick="switchView('roster')">View Roster</button>`;
    teamBox.appendChild(header);
    
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'flex justify-between gap-2';
    slotsContainer.id = 'pre-battle-team';
    
    for(let i=0; i<5; i++) {
        const slot = createTeamSlotElement(i, gameState);
        slotsContainer.appendChild(slot);
    }
    teamBox.appendChild(slotsContainer);
    
    const hint = document.createElement('div');
    hint.className = 'mt-4 text-xs text-slate-400 text-center';
    hint.textContent = 'Click a slot to add or remove a hero.';
    teamBox.appendChild(hint);
    
    wrapper.appendChild(teamBox);
    
    const startBtn = document.createElement('button');
    startBtn.className = 'btn btn-primary text-lg px-8 py-3 shadow-lg shadow-primary/30';
    startBtn.innerHTML = '<i class="fa-solid fa-swords"></i> Start Run';
    startBtn.onclick = () => startRun(gameState);
    wrapper.appendChild(startBtn);
    
    container.appendChild(wrapper);
}

function createTeamSlotElement(index, gameState) {
    const heroId = gameState.team[index];
    const hero = heroId ? gameState.roster.find(h => h.id === heroId) : null;
    
    const slot = document.createElement('div');
    const commonClasses = "w-16 h-16 rounded-lg overflow-hidden border cursor-pointer hover:border-primary transition-colors relative shadow-sm";
    
    if (hero) {
        slot.className = `${commonClasses} bg-slate-100 border-slate-200`;
        slot.onclick = () => showHeroSelectionModal(index, window.gameState);
        
        const img = document.createElement('img');
        img.src = `images/${hero.id}.jpg`;
        img.className = "w-full h-full object-cover";
        img.onerror = () => {
            const colors = { 'Fire':'from-red-400 to-orange-500', 'Water':'from-blue-400 to-cyan-500', 'Wind':'from-emerald-400 to-teal-500' };
            const grad = colors[hero.element] || 'from-slate-400 to-slate-600';
            const div = document.createElement('div');
            div.className = `w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-lg`;
            div.textContent = hero.name.substring(0,2).toUpperCase();
            img.replaceWith(div);
        };
        slot.appendChild(img);
        
        const lvl = document.createElement('div');
        lvl.className = "absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center font-bold truncate px-1";
        lvl.textContent = `Lv.${hero.level}`;
        slot.appendChild(lvl);
        
    } else {
        slot.className = `${commonClasses} bg-slate-50 border-dashed border-slate-300 flex items-center justify-center text-slate-300 hover:text-primary hover:bg-slate-100`;
        slot.onclick = () => showHeroSelectionModal(index, window.gameState);
        slot.innerHTML = '<i class="fa-solid fa-plus"></i>';
    }
    
    return slot;
}

function updateBattleUI(gameState, battleState) {
    if (!document.getElementById('battle-dashboard-grid')) return;

    document.getElementById('dash-wave').textContent = gameState.currentWave;
    document.getElementById('dash-kills').textContent = gameState.enemiesDefeated;
    
    const logContainer = document.getElementById('combat-log');
    logContainer.innerHTML = battleState.combatLog.map(log => 
        `<div class="${log.type === 'info' ? 'text-blue-500 font-bold' : log.type === 'success' ? 'text-green-600' : log.type === 'warning' ? 'text-orange-500' : 'text-slate-500'}">
            <span class="opacity-50 mr-1">[${new Date(log.id).toLocaleTimeString([], {hour12: false, second: '2-digit', minute:'2-digit'})}]</span> ${log.message}
        </div>`
    ).join('');

    renderUnits(document.getElementById('arena-heroes'), battleState.heroes, true);
    renderUnits(document.getElementById('arena-enemies'), battleState.enemies, false);
    
    document.getElementById('ultimates-list').innerHTML = battleState.heroes.map(hero => {
        if (!hero.isAlive) return '';
        const canCast = hero.canUseUltimate();
        const pct = hero.getManaPercent();
        
        return `
            <div class="bg-slate-50 border ${canCast ? 'glow-gold border-amber-400 cursor-pointer' : 'border-slate-200 opacity-80'} p-3 rounded-xl transition-all relative overflow-hidden group"
                 onclick="${canCast ? `useHeroUltimate(window.gameState.roster.find(h=>h.id=='${hero.id}'), currentBattleState, window.gameState)` : ''}">
                
                <div class="flex justify-between items-start mb-1 relative z-10">
                    <div>
                        <div class="text-xs font-bold text-slate-700">${hero.name}</div>
                        <div class="text-[10px] font-bold ${canCast ? 'text-amber-600' : 'text-slate-400'}">${hero.ultimate.name}</div>
                    </div>
                    <span class="${canCast ? 'text-amber-500 font-bold animate-pulse' : 'text-slate-400 text-xs'}">${canCast ? 'READY' : Math.floor(pct) + '%'}</span>
                </div>
                
                <div class="text-[9px] text-slate-500 mb-2 leading-tight relative z-10">${hero.ultimate.desc}</div>

                <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden relative z-10">
                    <div class="${canCast ? 'bg-amber-400' : 'bg-blue-500'} h-full transition-all duration-300" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');

    updateTeaList(gameState);
}

function updateTeaList(gameState) {
    const list = document.getElementById('battle-tea-list');
    if (!list) return;
    
    list.innerHTML = '';
    const teas = gameState.inventory.teas || {};
    
    if (Object.keys(teas).length === 0) {
        list.innerHTML = '<div class="col-span-2 text-xs text-slate-400 text-center py-2">No teas brewed.</div>';
        return;
    }

    for(const [id, qty] of Object.entries(teas)) {
        if (qty > 0) {
            const data = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === id);
            if (data) {
                list.innerHTML += `
                    <div class="bg-slate-50 p-2 rounded border border-slate-200 flex items-center gap-2 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors group relative"
                         onclick="useTea('${id}', window.gameState)" title="${data.desc}">
                        <div class="text-xl">${data.emoji}</div>
                        <div class="flex-1 overflow-hidden">
                            <div class="text-[10px] font-bold text-slate-700 truncate">${data.name}</div>
                            <div class="text-[9px] text-slate-400">x${qty}</div>
                        </div>
                    </div>
                `;
            }
        }
    }
}

window.useTea = function(id, gameState) {
    if (gameState.getItemCount('teas', id) <= 0) return;
    
    const data = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === id);
    if (!data) return;

    const heroes = currentBattleState.heroes.filter(h => h.isAlive);
    if (heroes.length === 0) return;

    if (data.effectType === 'heal') {
        heroes.forEach(h => {
            const amt = Math.floor(h.maxHP * data.effectValue);
            h.heal(amt);
            showFloatingText(h, `+${amt}`, 'heal');
            playCastAnimation(h);
        });
        currentBattleState.addLog(`Used ${data.name}: Team Healed!`, 'success');
    } 
    else if (data.effectType === 'buff_atk') {
        heroes.forEach(h => {
            h.atk = Math.floor(h.atk * (1 + data.effectValue));
            showFloatingText(h, `ATK UP!`, 'crit');
            playCastAnimation(h);
        });
        currentBattleState.addLog(`Used ${data.name}: Attack Boosted!`, 'success');
    }

    gameState.removeItem('teas', id, 1);
    updateBattleUI(gameState, currentBattleState);
};

// ===========================================
// NEW RENDER UNITS (SMART UPDATE)
// ===========================================

function renderUnits(container, units, isHero) {
    // 1. Identify existing nodes to PRESERVE animations
    const existingNodes = new Map();
    Array.from(container.children).forEach(el => {
        const id = el.getAttribute('data-unit-id');
        if(id) existingNodes.set(id, el);
    });

    const activeIds = new Set();

    units.forEach(unit => {
        const unitId = unit.instanceId || unit.id;
        activeIds.add(unitId);

        let div = existingNodes.get(unitId);
        
        // Calculation Data
        const hpPct = unit.getHPPercent();
        const hpText = `${Math.floor(unit.currentHP)}/${unit.maxHP}`;
        let mpPct = 0;
        let mpText = '';
        if (isHero) {
            mpPct = unit.getManaPercent();
            mpText = `${Math.floor(unit.mana)}/${unit.maxMana}`;
        }

        // CREATE (if doesn't exist)
        if (!div) {
            div = document.createElement('div');
            div.className = `battle-unit ${isHero ? 'is-hero' : 'is-enemy'}`;
            div.setAttribute('data-unit-id', unitId);
            
            const imgSrc = isHero ? `images/${unit.id}.jpg` : `images/enemies/${unit.id}.jpg`;
            
            div.innerHTML = `
                <div class="battle-unit-image-area">
                    <img src="${imgSrc}" class="battle-unit-img" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.background='#cbd5e1';">
                    
                    <div class="battle-unit-overlay">
                         <div class="battle-unit-name">${unit.name}</div>
                         <div class="battle-unit-info">${isHero ? `Lv.${unit.level} ${unit.class}` : `Wave ${currentBattleState.waveNumber}`}</div>
                    </div>
                </div>
                
                <div class="battle-unit-stats-area">
                    <div class="stat-row">
                         <div class="stat-item">
                            <span class="stat-val stat-val-atk">${unit.atk}</span>
                            <span class="stat-icon text-red-400"><i class="fa-solid fa-sword"></i></span>
                         </div>
                         <div class="stat-item">
                            <span class="stat-val stat-val-def">${unit.def}</span>
                            <span class="stat-icon text-blue-400"><i class="fa-solid fa-shield"></i></span>
                         </div>
                         <div class="stat-item">
                            <span class="stat-val stat-val-spd">${unit.spd}</span>
                            <span class="stat-icon text-green-400"><i class="fa-solid fa-wind"></i></span>
                         </div>
                    </div>

                    <div class="bar-groups">
                         <div class="bar-group">
                             <div class="bar-label-row text-slate-600">
                                 <span>HP</span>
                                 <span class="hp-text">${hpText}</span>
                             </div>
                             <div class="bar-track">
                                 <div class="bar-fill hp" style="width: ${hpPct}%"></div>
                             </div>
                         </div>
                         
                         ${isHero ? `
                         <div class="bar-group">
                             <div class="bar-label-row text-blue-500">
                                 <span>MP</span>
                                 <span class="mp-text">${mpText}</span>
                             </div>
                             <div class="bar-track">
                                 <div class="bar-fill mana" style="width: ${mpPct}%"></div>
                             </div>
                         </div>` : ''}
                    </div>
                </div>
            `;
            container.appendChild(div);
        } else {
            // UPDATE (Target specific elements to preserve animations on root)
            
            // 1. Stats
            div.querySelector('.stat-val-atk').textContent = unit.atk;
            div.querySelector('.stat-val-def').textContent = unit.def;
            div.querySelector('.stat-val-spd').textContent = unit.spd;

            // 2. HP Bar
            const hpBar = div.querySelector('.bar-fill.hp');
            hpBar.style.width = `${hpPct}%`;
            if (hpPct < 30) hpBar.classList.add('low'); else hpBar.classList.remove('low');
            
            div.querySelector('.hp-text').textContent = hpText;

            // 3. MP Bar
            if (isHero) {
                div.querySelector('.bar-fill.mana').style.width = `${mpPct}%`;
                div.querySelector('.mp-text').textContent = mpText;
            }
        }

        // Global Class Updates (Dead status)
        if (!unit.isAlive) {
            div.classList.add('dead');
        } else {
            div.classList.remove('dead');
        }
    });

    // Remove nodes that are gone
    existingNodes.forEach((node, id) => {
        if(!activeIds.has(id)) node.remove();
    });
}

function showFloatingText(unit, text, type) {
    const unitId = unit.instanceId || unit.id;
    const targetEl = document.querySelector(`[data-unit-id="${unitId}"]`);
    
    if (!targetEl) return;
    
    const floater = document.createElement('div');
    floater.className = `damage-number ${type === 'crit' ? 'text-red-600' : type === 'heal' ? 'text-green-500' : 'text-slate-800'}`;
    floater.textContent = text;
    targetEl.appendChild(floater);
    setTimeout(() => floater.remove(), 1000);
}

function handleWaveVictory(gameState, battleState) {
    if (battleState.waveComplete) return;
    battleState.waveComplete = true; 
    
    if (battleInterval) clearInterval(battleInterval);
    
    // --- WAVE LOOT DROPS (NEW) ---
    const gold = 50 + (gameState.currentWave * 10);
    gameState.gold += gold;
    
    let lootText = `+${gold} Gold`;
    
    // Petals Chance (30%)
    if (Math.random() < 0.3) {
        const p = Math.floor(Math.random() * 5) + 1;
        gameState.petals += p;
        lootText += `, +${p} 🌸`;
    }
    
    // Orbs Chance (10%)
    if (Math.random() < 0.1) {
        const o = Math.floor(Math.random() * 2) + 1;
        gameState.spiritOrbs += o;
        lootText += `, +${o} 🔮`;
    }
    
    // Seeds Chance (15%)
    if (Math.random() < 0.15) {
        const allSeeds = GARDEN_ITEMS_DATABASE.seeds;
        const seed = allSeeds[Math.floor(Math.random() * allSeeds.length)];
        gameState.addItem('seeds', seed.id, 1);
        lootText += `, +1 ${seed.emoji}`;
    }
    
    // Quest Updates
    gameState.updateQuest('clearWaves', 1);
    
    // ----------------------------

    gameState.enemiesDefeated += battleState.enemies.length;
    
    gameState.currentWave++;
    if (gameState.currentWave > gameState.highestWave) gameState.highestWave = gameState.currentWave;
    
    showToast(`Wave Cleared! ${lootText}`, 'success');
    saveGame(gameState);
    
    const btnContainer = document.getElementById('next-wave-container');
    if (btnContainer) {
        btnContainer.classList.remove('hidden');
    }
}

function handleRunDefeat(gameState, battleState) {
    if (battleState.waveComplete) return;
    battleState.waveComplete = true;
    
    stopBattle(gameState);
    showToast(`Run Ended at Wave ${gameState.currentWave}`, 'error');
    gameState.roster.forEach(h => h.resetForBattle());
    saveGame(gameState);
}

function toggleAutoCast() {
    if (!window.gameState) return;
    window.gameState.autoCast = !window.gameState.autoCast;
    
    const btn = document.getElementById('auto-btn');
    const txt = document.getElementById('auto-btn-text');
    
    if (btn && txt) {
        if (window.gameState.autoCast) {
            btn.classList.add('btn-primary');
            btn.classList.remove('btn-secondary');
            txt.textContent = 'Auto: ON';
        } else {
            btn.classList.remove('btn-primary');
            btn.classList.add('btn-secondary');
            txt.textContent = 'Auto: OFF';
        }
    }
}