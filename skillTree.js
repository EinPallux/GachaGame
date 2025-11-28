/* =========================================
   SAKURA CHRONICLES - YGGDRASIL SYSTEM
   Skill Tree & Passive Upgrades
   ========================================= */

// ===========================
// RENDER SKILL TREE VIEW
// ===========================

function renderSkillTree(gameState) {
    const container = document.getElementById('skill-tree-tab');
    if (!container) return;
    
    // Calculate Summary Stats
    const bonuses = gameState.getSkillTreeBonuses();
    const totalSpent = calculateTotalSpent(gameState);
    
    container.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6 animate-entry">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center text-3xl shadow-sm">
                        <i class="fa-solid fa-tree"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-heading font-bold text-slate-800">Yggdrasil</h2>
                        <p class="text-slate-500 text-sm">Invest Spirit Orbs to unlock permanent passive bonuses.</p>
                    </div>
                </div>
                
                <div class="flex gap-6 text-center">
                    <div>
                        <div class="text-2xl font-bold text-purple-600">${formatNumber(gameState.spiritOrbs)}</div>
                        <div class="text-xs text-slate-400 font-bold uppercase">Available Orbs</div>
                    </div>
                    <div>
                        <div class="text-2xl font-bold text-slate-700">${formatNumber(totalSpent)}</div>
                        <div class="text-xs text-slate-400 font-bold uppercase">Orbs Invested</div>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div class="lg:col-span-1">
                    <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 sticky top-4">
                        <h3 class="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                            Current Effects
                        </h3>
                        <div class="space-y-3" id="bonus-summary-list">
                            ${renderBonusSummary(bonuses)}
                        </div>
                        
                        <div class="mt-6 pt-4 border-t border-slate-100">
                            <button class="w-full btn bg-red-50 text-red-500 hover:bg-red-100 text-sm" onclick="resetSkillTree(gameState)">
                                <i class="fa-solid fa-rotate-left"></i> Reset Tree
                            </button>
                            <p class="text-[10px] text-slate-400 text-center mt-2">Refunds all Orbs</p>
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-3">
                    <div id="skill-tree-grid" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        ${renderNodes(gameState)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===========================
// RENDER HELPERS
// ===========================

function renderNodes(gameState) {
    return gameState.skillTree.map(node => {
        const isMaxed = node.level >= node.maxLevel;
        const currentCost = node.cost * (node.level + 1);
        const canAfford = gameState.spiritOrbs >= currentCost;
        
        let cardClass = "bg-white border-slate-200";
        let iconClass = "bg-slate-50 text-slate-400";
        let btnClass = "bg-slate-100 text-slate-400";
        
        if (isMaxed) {
            cardClass = "bg-amber-50 border-amber-300 ring-1 ring-amber-200";
            iconClass = "bg-amber-100 text-amber-600";
            btnClass = "bg-amber-500 text-white cursor-default";
        } else if (canAfford) {
            cardClass = "bg-white border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer";
            iconClass = "bg-emerald-50 text-emerald-600";
            btnClass = "bg-emerald-500 text-white hover:bg-emerald-600";
        } else if (node.level > 0) {
            // Started but can't afford next level
            cardClass = "bg-white border-slate-200";
            iconClass = "bg-slate-50 text-slate-600";
            btnClass = "bg-slate-200 text-slate-400";
        }

        const nextBonus = node.value * (node.level + 1);
        const currentBonus = node.value * node.level;

        return `
            <div class="relative p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center text-center group ${cardClass}"
                 onclick="${!isMaxed && canAfford ? `handleSkillUpgrade('${node.id}')` : ''}">
                
                <div class="w-12 h-12 rounded-lg ${iconClass} flex items-center justify-center text-2xl mb-3 transition-colors">
                    <div class="group-hover:scale-110 transition-transform">${getIconForNode(node.icon)}</div>
                </div>
                
                <h4 class="font-bold text-slate-700 text-sm mb-1">${node.name}</h4>
                <p class="text-xs text-slate-500 mb-3 h-8 leading-tight flex items-center justify-center">${node.desc}</p>
                
                <div class="flex gap-1 mb-3">
                    ${renderLevelDots(node.level, node.maxLevel, isMaxed)}
                </div>
                
                <div class="mt-auto w-full">
                    ${isMaxed 
                        ? `<div class="text-xs font-bold text-amber-600 bg-amber-100 py-1.5 rounded">MAXED (+${currentBonus}%)</div>`
                        : `<button class="w-full py-1.5 rounded text-xs font-bold transition-colors ${btnClass}">
                             <span class="mr-1">🔮</span> ${currentCost}
                           </button>`
                    }
                </div>
                
                ${!isMaxed ? `<div class="mt-1 text-[10px] text-slate-400">Current: +${currentBonus}%</div>` : ''}
            </div>
        `;
    }).join('');
}

function renderLevelDots(current, max, isMaxed) {
    let html = '';
    for (let i = 0; i < max; i++) {
        const active = i < current;
        const color = isMaxed ? 'bg-amber-400' : active ? 'bg-emerald-400' : 'bg-slate-200';
        html += `<div class="w-2 h-2 rounded-full ${color}"></div>`;
    }
    return html;
}

function renderBonusSummary(bonuses) {
    if (Object.keys(bonuses).length === 0) {
        return `<div class="text-sm text-slate-400 italic text-center py-4">No active bonuses.<br>Start upgrading!</div>`;
    }

    // Friendly names map
    const nameMap = {
        'allStatsPercent': { name: 'All Stats', icon: 'fa-star' },
        'goldBonus': { name: 'Gold Gain', icon: 'fa-coins' },
        'petalBonus': { name: 'Petal Drop', icon: 'fa-spa' },
        'orbBonus': { name: 'Orb Drop', icon: 'fa-gem' },
        'critChance': { name: 'Crit Rate', icon: 'fa-bullseye' },
        'startingMana': { name: 'Start Mana', icon: 'fa-bolt' },
        'fireBonus': { name: 'Fire ATK', icon: 'fa-fire' },
        'waterBonus': { name: 'Water ATK', icon: 'fa-droplet' },
        'windBonus': { name: 'Wind ATK', icon: 'fa-wind' },
        'lightBonus': { name: 'Light ATK', icon: 'fa-sun' },
        'darkBonus': { name: 'Dark ATK', icon: 'fa-moon' },
    };

    return Object.entries(bonuses).map(([key, val]) => {
        const meta = nameMap[key] || { name: key, icon: 'fa-check' };
        return `
            <div class="flex justify-between items-center text-sm border-b border-slate-50 last:border-0 pb-1">
                <span class="text-slate-600 flex items-center gap-2">
                    <i class="fa-solid ${meta.icon} text-slate-400 w-4"></i> ${meta.name}
                </span>
                <span class="font-bold text-emerald-600">+${val}${key === 'startingMana' ? '' : '%'}</span>
            </div>
        `;
    }).join('');
}

// Helper to convert emoji icons to FontAwesome if needed, or keep emoji
function getIconForNode(iconChar) {
    // Check if it's an emoji (simple check) or map to FA
    return `<span class="font-emoji">${iconChar}</span>`;
}

function calculateTotalSpent(gameState) {
    let total = 0;
    gameState.skillTree.forEach(node => {
        for(let i=1; i <= node.level; i++) {
            total += node.cost * i;
        }
    });
    return total;
}

// ===========================
// ACTIONS
// ===========================

window.handleSkillUpgrade = function(nodeId) {
    const success = window.gameState.upgradeSkillNode(nodeId);
    
    if (success) {
        const node = window.gameState.skillTree.find(n => n.id === nodeId);
        showToast(`Upgraded ${node.name}!`, 'success');
        
        // Recalculate stats for all heroes immediately
        window.gameState.roster.forEach(hero => {
            hero.calculateStats(window.gameState.getSkillTreeBonuses());
        });
        
        saveGame(window.gameState);
        updateUI(window.gameState);
        renderSkillTree(window.gameState); // Re-render grid
    } else {
        showToast('Not enough Spirit Orbs!', 'error');
    }
};

window.resetSkillTree = function(gameState) {
    if (!confirm('Reset Skill Tree? This refunds all Spirit Orbs.')) return;
    
    let refund = 0;
    gameState.skillTree.forEach(node => {
        for(let i=1; i <= node.level; i++) {
            refund += node.cost * i;
        }
        node.level = 0;
    });
    
    gameState.spiritOrbs += refund;
    
    // Recalc stats
    gameState.roster.forEach(hero => {
        hero.calculateStats({});
    });
    
    showToast(`Refunded ${formatNumber(refund)} Orbs`, 'success');
    saveGame(gameState);
    updateUI(gameState);
    renderSkillTree(gameState);
};