/* =========================================
   SAKURA CHRONICLES - BATTLE ENGINE
   Roguelike Combat System & UI
   ========================================= */

let battleInterval = null;
let currentBattleState = null;

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
            
            const enemy = new Enemy(template, this.waveNumber);
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
    
    updateBattleUI(gameState, currentBattleState);
    
    if (battleInterval) clearInterval(battleInterval);
    battleInterval = setInterval(() => {
        processBattleTurn(gameState, currentBattleState);
    }, 1000);
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
    if (!battleState.isActive) return;
    
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
    
    allUnits.forEach(({ unit, isHero }, index) => {
        setTimeout(() => {
            if (!unit.isAlive) return;
            
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
            
            updateBattleUI(gameState, battleState);
            
        }, index * 200);
    });
}

function getRandomTarget(units) {
    const alive = units.filter(u => u.isAlive);
    if (alive.length === 0) return null;
    return alive[Math.floor(Math.random() * alive.length)];
}

function performAttack(attacker, defender, battleState, isHero) {
    let damage = Math.max(1, attacker.atk - (defender.def * 0.5));
    
    if (attacker.element && defender.element) {
        const adv = ELEMENT_ADVANTAGE[attacker.element];
        if (adv && adv.strong === defender.element) damage *= 1.5;
        if (adv && adv.weak === defender.element) damage *= 0.75;
    }
    
    const isCrit = Math.random() < 0.15;
    if (isCrit) damage *= 1.5;
    
    damage = Math.floor(damage);
    defender.takeDamage(damage);
    
    if (isHero) attacker.gainMana(15);
    else defender.gainMana(10);
    
    const critText = isCrit ? ' CRIT!' : '';
    battleState.addLog(`${attacker.name} hit ${defender.name} for ${damage}${critText}`, isHero ? 'success' : 'warning');
    
    showFloatingText(defender, `-${damage}${critText}`, isCrit ? 'crit' : 'damage');
}

function useHeroUltimate(hero, battleState, gameState) {
    if (!hero.canUseUltimate()) return;
    
    hero.useUltimate();
    battleState.addLog(`${hero.name} cast ${hero.ultimate.name}!`, 'special');
    showFloatingText(hero, 'ULTIMATE!', 'heal');
    
    const aliveHeroes = battleState.heroes.filter(h => h.isAlive);
    const aliveEnemies = battleState.enemies.filter(e => e.isAlive);
    
    if (hero.class === 'Healer') {
        aliveHeroes.forEach(h => {
            const heal = Math.floor(hero.atk * 3);
            h.heal(heal);
            showFloatingText(h, `+${heal}`, 'heal');
        });
    } else if (hero.class === 'DPS (AoE)') {
        aliveEnemies.forEach(e => {
            const dmg = Math.floor(hero.atk * 1.5);
            e.takeDamage(dmg);
            showFloatingText(e, `-${dmg}`, 'damage');
        });
    } else {
        const target = getRandomTarget(aliveEnemies);
        if (target) {
            const dmg = Math.floor(hero.atk * 3.5);
            target.takeDamage(dmg);
            showFloatingText(target, `-${dmg}`, 'crit');
        }
    }
    
    gameState.updateQuest('useUltimates', 1);
    updateBattleUI(gameState, battleState);
}

// ===========================
// RENDERING & UI (FIXED)
// ===========================

function renderBattleDashboard(gameState) {
    const container = document.getElementById('battle-tab');
    if (!container) return;

    // SCENE 1: PRE-BATTLE (Team Selection)
    if (!gameState.isBattleActive) {
        renderPreBattleScreen(container, gameState);
        return;
    }

    // SCENE 2: ACTIVE BATTLE
    if (!document.getElementById('battle-dashboard-grid')) {
        container.innerHTML = `
            <div id="battle-dashboard-grid" class="battle-dashboard animate-entry h-[calc(100vh-140px)] min-h-[500px]">
                <div class="flex flex-col gap-4">
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

                <div class="flex flex-col gap-4 relative">
                    <div class="flex-1 bg-white/60 rounded-xl border border-red-100 flex items-center justify-center p-4 relative">
                        <div class="absolute top-2 left-3 text-xs font-bold text-red-400 uppercase tracking-widest">Enemies</div>
                        <div id="arena-enemies" class="flex gap-4 justify-center flex-wrap w-full"></div>
                    </div>
                    
                    <div class="h-8 flex items-center justify-center">
                        <span class="bg-slate-200 text-slate-500 text-xs font-bold px-3 py-1 rounded-full">VS</span>
                    </div>

                    <div class="flex-1 bg-white/80 rounded-xl border border-blue-100 flex items-center justify-center p-4 relative">
                        <div class="absolute top-2 left-3 text-xs font-bold text-blue-400 uppercase tracking-widest">Heroes</div>
                        <div id="arena-heroes" class="flex gap-4 justify-center flex-wrap w-full"></div>
                    </div>
                </div>

                <div class="flex flex-col gap-4 battle-dashboard-right">
                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex-1 overflow-y-auto">
                        <h3 class="font-bold text-slate-700 text-sm mb-3 uppercase tracking-wider">Ultimates</h3>
                        <div id="ultimates-list" class="space-y-2"></div>
                    </div>

                    <div class="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                        <button id="auto-btn" class="btn w-full mb-2 ${gameState.autoCast ? 'btn-primary' : 'btn-secondary'}" onclick="toggleAutoCast()">
                            <i class="fa-solid fa-robot"></i> ${gameState.autoCast ? 'Auto: ON' : 'Auto: OFF'}
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

// FIXED: No more string interpolation for attributes!
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
    
    // Team Section
    const teamBox = document.createElement('div');
    teamBox.className = 'bg-white p-6 rounded-xl border border-slate-100 w-full mb-8 text-left';
    
    const header = document.createElement('h3');
    header.className = 'font-bold text-slate-700 mb-4 flex justify-between';
    header.innerHTML = `<span>Current Team</span><button class="text-sm text-primary hover:underline" onclick="switchView('roster')">View Roster</button>`;
    teamBox.appendChild(header);
    
    const slotsContainer = document.createElement('div');
    slotsContainer.className = 'flex justify-between gap-2';
    slotsContainer.id = 'pre-battle-team';
    
    // Generate Slots Programmatically
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
    
    // Start Button
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
        
        // Image
        const img = document.createElement('img');
        img.src = `images/${hero.id}.jpg`; // FIXED PATH
        img.className = "w-full h-full object-cover";
        img.onerror = () => {
            // Helper from ui.js logic inline
            const colors = { 'Fire':'from-red-400 to-orange-500', 'Water':'from-blue-400 to-cyan-500', 'Wind':'from-emerald-400 to-teal-500' };
            const grad = colors[hero.element] || 'from-slate-400 to-slate-600';
            const div = document.createElement('div');
            div.className = `w-full h-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-bold text-lg`;
            div.textContent = hero.name.substring(0,2).toUpperCase();
            img.replaceWith(div);
        };
        slot.appendChild(img);
        
        // Level Tag
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
            <div class="bg-slate-50 border ${canCast ? 'border-primary cursor-pointer ring-2 ring-primary/20' : 'border-slate-200 opacity-70'} p-2 rounded-lg transition-all"
                 onclick="${canCast ? `useHeroUltimate(gameState.roster.find(h=>h.id=='${hero.id}'), currentBattleState, gameState)` : ''}">
                <div class="flex justify-between text-xs font-bold mb-1">
                    <span class="text-slate-700">${hero.name}</span>
                    <span class="${canCast ? 'text-primary animate-pulse' : 'text-slate-400'}">${canCast ? 'READY' : pct + '%'}</span>
                </div>
                <div class="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div class="bg-blue-500 h-full transition-all duration-300" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderUnits(container, units, isHero) {
    container.innerHTML = '';
    units.forEach(unit => {
        const div = document.createElement('div');
        div.className = `battle-unit ${isHero ? 'is-hero' : 'is-enemy'} ${!unit.isAlive ? 'dead' : ''} w-24 flex-shrink-0 flex flex-col items-center`;
        div.innerHTML = `
            <div class="w-16 h-16 rounded-lg shadow-sm border border-slate-200 relative overflow-hidden bg-white mb-2">
                <img src="${isHero ? `images/${unit.id}.jpg` : 'images/enemies/e001.jpg'}" class="w-full h-full object-cover" 
                     onerror="this.style.display='none'; this.parentElement.classList.add('flex','items-center','justify-center','bg-slate-100'); this.parentElement.innerHTML='${isHero ? unit.name[0] : '💀'}'">
                ${!unit.isAlive ? '<div class="absolute inset-0 bg-slate-500/50 flex items-center justify-center text-white font-bold text-xs">DEAD</div>' : ''}
            </div>
            
            <div class="w-full space-y-1">
                <div class="bar-container bg-slate-100">
                    <div class="bar-fill hp ${unit.getHPPercent() < 30 ? 'low' : ''}" style="width: ${unit.getHPPercent()}%"></div>
                </div>
                ${isHero ? `
                <div class="bar-container bg-slate-100">
                    <div class="bar-fill mana" style="width: ${unit.getManaPercent()}%"></div>
                </div>` : ''}
            </div>
            <div class="text-[10px] font-bold text-slate-600 mt-1 truncate w-full text-center">${unit.name}</div>
        `;
        div.style.position = 'relative';
        container.appendChild(div);
    });
}

function showFloatingText(unit, text, type) {
    const domUnits = document.querySelectorAll('.battle-unit');
    let targetEl = null;
    domUnits.forEach(el => {
        if (el.textContent.includes(unit.name)) targetEl = el;
    });
    
    if (!targetEl) return;
    
    const floater = document.createElement('div');
    floater.className = `damage-number ${type === 'crit' ? 'text-red-600 text-2xl' : type === 'heal' ? 'text-green-500' : 'text-slate-800'}`;
    floater.textContent = text;
    targetEl.appendChild(floater);
    setTimeout(() => floater.remove(), 800);
}

function handleWaveVictory(gameState, battleState) {
    if (battleInterval) clearInterval(battleInterval);
    battleState.isActive = false;
    
    const gold = 50 + (gameState.currentWave * 10);
    gameState.gold += gold;
    gameState.enemiesDefeated += battleState.enemies.length;
    
    gameState.currentWave++;
    if (gameState.currentWave > gameState.highestWave) gameState.highestWave = gameState.currentWave;
    
    showToast(`Wave Cleared! +${gold} Gold`, 'success');
    saveGame(gameState);
    
    setTimeout(() => {
        startWave(gameState);
    }, 2000);
}

function handleRunDefeat(gameState, battleState) {
    stopBattle(gameState);
    showToast(`Run Ended at Wave ${gameState.currentWave}`, 'error');
    gameState.roster.forEach(h => h.resetForBattle());
    saveGame(gameState);
}

function toggleAutoCast() {
    if (!gameState) return;
    gameState.autoCast = !gameState.autoCast;
    renderBattleDashboard(gameState);
}