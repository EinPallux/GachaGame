/* =========================================
   SAKURA CHRONICLES - UI MANAGER
   Rendering & Component Logic
   ========================================= */

// ===========================
// GLOBAL UI UPDATES
// ===========================

function updateUI(gameState) {
    if (!gameState) return;

    updateCurrencyDisplay(gameState);
    
    // Update Sidebar Profile
    const sidebarName = document.getElementById('sidebar-username');
    const sidebarLevel = document.getElementById('sidebar-level');
    
    if (sidebarName) sidebarName.textContent = gameState.username;
    if (sidebarLevel) {
        // Calculate a pseudo-player level based on total hero levels
        const totalLevels = gameState.roster.reduce((acc, h) => acc + h.level, 0);
        const playerLevel = Math.floor(Math.sqrt(totalLevels)) || 1;
        sidebarLevel.textContent = playerLevel;
    }
}

function updateCurrencyDisplay(gameState) {
    const goldDisplay = document.getElementById('gold-display');
    const petalsDisplay = document.getElementById('petals-display');
    const orbsDisplay = document.getElementById('orbs-display');
    
    // Animate numbers (simple implementation)
    if (goldDisplay) goldDisplay.textContent = formatNumber(gameState.gold);
    if (petalsDisplay) petalsDisplay.textContent = formatNumber(gameState.petals);
    if (orbsDisplay) orbsDisplay.textContent = formatNumber(gameState.spiritOrbs);
}

// ===========================
// TEAM SELECTION (NEW & FIXED)
// ===========================

function showHeroSelectionModal(slotIndex, gameState) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = ''; // Clear content

    // Container
    const container = document.createElement('div');
    container.className = 'bg-slate-50 p-6 min-h-[500px]';

    // Header
    const header = document.createElement('h3');
    header.className = 'text-xl font-heading font-bold text-slate-800 mb-4';
    header.textContent = `Select Hero for Slot ${slotIndex + 1}`;
    container.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-3 md:grid-cols-4 gap-3';

    // "Clear Slot" Option
    const clearCard = document.createElement('div');
    clearCard.className = 'hero-card border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 aspect-[3/4] rounded-xl';
    clearCard.innerHTML = `
        <div class="text-center text-slate-400">
            <i class="fa-solid fa-xmark text-2xl mb-1"></i>
            <div class="text-xs font-bold">Empty</div>
        </div>
    `;
    clearCard.onclick = () => selectHeroForSlot(slotIndex, null);
    grid.appendChild(clearCard);

    // Hero List
    const sortedHeroes = [...gameState.roster].sort((a, b) => b.getPower() - a.getPower());

    sortedHeroes.forEach(hero => {
        // Check if hero is already in another slot
        const assignedSlot = gameState.team.indexOf(hero.id);
        const isAssigned = assignedSlot !== -1 && assignedSlot !== slotIndex;

        // Card Wrapper
        const card = document.createElement('div');
        card.className = `hero-card relative transition-transform duration-200 ${isAssigned ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`;
        
        if (!isAssigned) {
            card.onclick = () => selectHeroForSlot(slotIndex, hero.id);
        }

        // Image Container
        const imgContainer = document.createElement('div');
        imgContainer.className = 'aspect-[3/4] rounded-xl overflow-hidden relative';

        const img = document.createElement('img');
        img.src = `images/${hero.id}.jpg`; // FIXED PATH
        img.className = 'w-full h-full object-cover';
        
        // Error Handler
        img.onerror = () => {
            const div = document.createElement('div');
            const colors = {
                'Fire': 'from-red-400 to-orange-500', 'Water': 'from-blue-400 to-cyan-500',
                'Wind': 'from-emerald-400 to-teal-500', 'Light': 'from-yellow-300 to-amber-500',
                'Dark': 'from-purple-500 to-indigo-600'
            };
            const gradient = colors[hero.element] || 'from-slate-400 to-slate-600';
            div.className = `w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-4xl font-heading font-bold opacity-90`;
            div.textContent = hero.name.substring(0, 2).toUpperCase();
            img.replaceWith(div);
        };
        imgContainer.appendChild(img);

        // Badges
        const badge = document.createElement('div');
        badge.className = `absolute top-1 right-1 badge-${hero.rarity} text-[10px] text-white px-1.5 rounded shadow`;
        badge.textContent = hero.rarity;
        imgContainer.appendChild(badge);

        if (isAssigned) {
            const overlay = document.createElement('div');
            overlay.className = 'absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs';
            overlay.textContent = 'IN TEAM';
            imgContainer.appendChild(overlay);
        }

        card.appendChild(imgContainer);

        // Info
        const info = document.createElement('div');
        info.className = 'text-center mt-1';
        info.innerHTML = `
            <div class="text-xs font-bold text-slate-700 truncate">${hero.name}</div>
            <div class="text-[10px] text-slate-500">Lv.${hero.level}</div>
        `;
        card.appendChild(info);

        grid.appendChild(card);
    });

    container.appendChild(grid);
    modalBody.appendChild(container);
    
    // Show Modal
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.remove('opacity-0', 'pointer-events-none'));
}

// Global handler for selection
window.selectHeroForSlot = function(slotIndex, heroId) {
    // 1. Update State
    window.gameState.setTeamMember(slotIndex, heroId);
    
    // 2. Save
    saveGame(window.gameState);
    
    // 3. Update UI
    // We need to refresh the battle dashboard specifically
    if (typeof renderBattleDashboard === 'function') {
        renderBattleDashboard(window.gameState);
    }
    
    // 4. Close Modal
    closeModal();
    showNotification(heroId ? 'Hero assigned!' : 'Slot cleared.', 'success');
};

// ===========================
// ROSTER TAB
// ===========================

function renderRoster(gameState) {
    const container = document.getElementById('roster-tab');
    if (!container) return;
    
    // Filters Header
    const headerHtml = `
        <div class="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 animate-entry">
            <h2 class="text-2xl font-heading font-bold text-slate-800">Hero Roster <span class="text-slate-400 text-lg font-normal">(${gameState.roster.length})</span></h2>
            <div class="flex gap-2">
                <select id="roster-filter-rarity" class="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none" onchange="renderRosterGrid(window.gameStateRef)">
                    <option value="all">All Rarities</option>
                    <option value="N">Normal</option>
                    <option value="R">Rare</option>
                    <option value="SR">Super Rare</option>
                    <option value="SSR">SSR</option>
                    <option value="UR">Ultra Rare</option>
                </select>
                <select id="roster-sort" class="bg-white border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-primary focus:border-primary block p-2.5 outline-none" onchange="renderRosterGrid(window.gameStateRef)">
                    <option value="rarity">Sort: Rarity</option>
                    <option value="level">Sort: Level</option>
                    <option value="power">Sort: Power</option>
                </select>
            </div>
        </div>
        <div id="roster-grid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-entry"></div>
    `;
    
    container.innerHTML = headerHtml;
    
    // Store ref for onchange handlers
    window.gameStateRef = gameState;
    
    renderRosterGrid(gameState);
}

function renderRosterGrid(gameState) {
    const grid = document.getElementById('roster-grid');
    if (!grid) return;
    grid.innerHTML = '';
    
    const rarityFilter = document.getElementById('roster-filter-rarity')?.value || 'all';
    const sortFilter = document.getElementById('roster-sort')?.value || 'rarity';
    
    let heroes = [...gameState.roster];
    
    // Filter
    if (rarityFilter !== 'all') {
        heroes = heroes.filter(h => h.rarity === rarityFilter);
    }
    
    // Sort
    const rarityOrder = { 'UR': 5, 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
    heroes.sort((a, b) => {
        if (sortFilter === 'level') return b.level - a.level;
        if (sortFilter === 'power') return (b.atk + b.def + b.hp) - (a.atk + a.def + a.hp);
        // Default Rarity
        if (rarityOrder[b.rarity] !== rarityOrder[a.rarity]) {
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        }
        return b.level - a.level;
    });
    
    if (heroes.length === 0) {
        grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-400">No heroes found matching criteria.</div>`;
        return;
    }
    
    heroes.forEach(hero => {
        const card = createHeroCard(hero);
        card.onclick = () => showHeroDetails(hero, gameState);
        grid.appendChild(card);
    });
}

function createHeroCard(hero) {
    // 1. Create Card Container
    const card = document.createElement('div');
    card.className = 'hero-card cursor-pointer group';
    card.setAttribute('data-rarity', hero.rarity);

    // 2. Create Image Container
    const imgContainer = document.createElement('div');
    imgContainer.className = 'relative overflow-hidden';

    // 3. Image Element with Error Handling
    const img = document.createElement('img');
    img.src = `images/${hero.id}.jpg`; // FIXED PATH
    img.className = 'hero-card-image transition-transform duration-500 group-hover:scale-110';
    img.alt = hero.name;
    
    img.onerror = function() {
        const placeholder = createHeroPlaceholderElement(hero);
        this.replaceWith(placeholder);
    };

    imgContainer.appendChild(img);

    // 4. Badges (Level & Rarity)
    const levelBadge = document.createElement('div');
    levelBadge.className = 'absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-0.5 rounded';
    levelBadge.textContent = `Lv.${hero.level}`;
    imgContainer.appendChild(levelBadge);

    const rarityBadge = document.createElement('div');
    rarityBadge.className = `absolute top-2 right-2 badge-${hero.rarity} text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm`;
    rarityBadge.textContent = hero.rarity;
    imgContainer.appendChild(rarityBadge);

    // 5. Info Section
    const infoDiv = document.createElement('div');
    infoDiv.className = 'p-3 bg-white';
    infoDiv.innerHTML = `
        <div class="font-bold text-slate-800 text-sm truncate">${hero.name}</div>
        <div class="flex justify-between items-center mt-1">
            <div class="text-xs text-slate-500 flex items-center gap-1">
                <span>${getElementEmoji(hero.element)}</span>
                <span>${hero.class}</span>
            </div>
            <div class="flex gap-0.5 text-[0.6rem] text-yellow-400">
                ${'⭐'.repeat(hero.stars)}
            </div>
        </div>
    `;

    card.appendChild(imgContainer);
    card.appendChild(infoDiv);
    
    return card;
}

function createHeroPlaceholderElement(hero) {
    const div = document.createElement('div');
    const colors = {
        'Fire': 'from-red-400 to-orange-500',
        'Water': 'from-blue-400 to-cyan-500',
        'Wind': 'from-emerald-400 to-teal-500',
        'Light': 'from-yellow-300 to-amber-500',
        'Dark': 'from-purple-500 to-indigo-600'
    };
    const gradient = colors[hero.element] || 'from-slate-400 to-slate-600';
    div.className = `w-full aspect-[3/4] bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-4xl font-heading font-bold opacity-90 transition-transform duration-500 group-hover:scale-110`;
    div.textContent = hero.name.substring(0, 2).toUpperCase();
    return div;
}

// Retaining string version for non-DOM contexts if needed
function createHeroPlaceholder(hero) {
    const colors = {
        'Fire': 'from-red-400 to-orange-500',
        'Water': 'from-blue-400 to-cyan-500',
        'Wind': 'from-emerald-400 to-teal-500',
        'Light': 'from-yellow-300 to-amber-500',
        'Dark': 'from-purple-500 to-indigo-600'
    };
    const gradient = colors[hero.element] || 'from-slate-400 to-slate-600';
    const initials = hero.name.substring(0, 2).toUpperCase();
    return `<div class="w-full aspect-[3/4] bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-4xl font-heading font-bold opacity-90">${initials}</div>`;
}

// ===========================
// HERO DETAILS MODAL
// ===========================

function showHeroDetails(hero, gameState) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    // Level Up Calculations
    const xpNeeded = hero.getUpgradeCost();
    const canAfford = gameState.gold >= xpNeeded;
    
    // Awakening Calculations
    const maxStars = 5; 
    const isMaxStars = hero.stars >= maxStars;
    const shardsRequired = hero.stars * 10;
    const canAwaken = !isMaxStars && hero.awakeningShards >= shardsRequired;
    
    // Calculate progress percentage for the bar
    let shardProgress = 0;
    if (!isMaxStars) {
        shardProgress = Math.min(100, (hero.awakeningShards / shardsRequired) * 100);
    } else {
        shardProgress = 100;
    }

    const html = `
        <div class="relative">
            <div class="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative overflow-hidden">
                <img src="images/${hero.id}.jpg" class="absolute inset-0 w-full h-full object-cover opacity-30" onerror="this.style.display='none'">
                
                <div class="absolute bottom-4 left-6 flex items-end gap-4 z-10">
                     <div class="w-20 h-20 rounded-xl border-4 border-white shadow-lg overflow-hidden bg-slate-200 relative">
                        <img src="images/${hero.id}.jpg" class="w-full h-full object-cover" onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-slate-400 flex items-center justify-center text-white font-bold text-xl\'>${hero.name.substring(0,2).toUpperCase()}</div>'">
                     </div>
                     <div class="mb-1">
                        <h2 class="text-2xl font-bold text-white leading-none">${hero.name}</h2>
                        <div class="text-slate-300 text-sm flex items-center gap-2 mt-1">
                            <span class="badge-${hero.rarity} px-1.5 rounded text-[0.65rem]">${hero.rarity}</span>
                            <span>${getElementEmoji(hero.element)} ${hero.element}</span> • <span>${hero.class}</span>
                        </div>
                     </div>
                </div>
            </div>

            <div class="p-6 pt-4">
                <div class="grid grid-cols-4 gap-2 mb-6">
                    <div class="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                        <div class="text-xs text-slate-400 uppercase font-bold">HP</div>
                        <div class="font-bold text-slate-700">${formatNumber(hero.maxHP)}</div>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                        <div class="text-xs text-slate-400 uppercase font-bold">ATK</div>
                        <div class="font-bold text-slate-700">${formatNumber(hero.atk)}</div>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                        <div class="text-xs text-slate-400 uppercase font-bold">DEF</div>
                        <div class="font-bold text-slate-700">${formatNumber(hero.def)}</div>
                    </div>
                    <div class="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                        <div class="text-xs text-slate-400 uppercase font-bold">SPD</div>
                        <div class="font-bold text-slate-700">${hero.spd}</div>
                    </div>
                </div>

                <div class="space-y-4">
                    <button id="modal-levelup-btn" class="w-full btn ${canAfford ? 'btn-primary' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}" ${!canAfford ? 'disabled' : ''}>
                        <div class="flex flex-col items-center leading-tight">
                            <span>Level Up</span>
                            <span class="text-xs font-normal opacity-80">${formatNumber(xpNeeded)} Gold</span>
                        </div>
                    </button>
                    
                    <div class="bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <div class="flex justify-between items-end mb-2">
                            <h4 class="font-bold text-slate-700 text-sm flex items-center gap-1">
                                <span class="text-yellow-400 text-xs">⭐</span> Ascension
                            </h4>
                            ${isMaxStars 
                                ? '<span class="text-xs font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded">MAX STARS</span>' 
                                : `<span class="text-xs font-bold ${canAwaken ? 'text-green-600' : 'text-slate-400'}">${hero.awakeningShards} / ${shardsRequired} Shards</span>`
                            }
                        </div>
                        
                        ${!isMaxStars ? `
                        <div class="w-full bg-slate-200 rounded-full h-1.5 mb-3 overflow-hidden">
                            <div class="bg-amber-400 h-full transition-all duration-500" style="width: ${shardProgress}%"></div>
                        </div>` : ''}
                        
                        <button id="modal-awaken-btn" 
                                class="w-full btn ${canAwaken ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}" 
                                ${!canAwaken ? 'disabled' : ''}>
                            ${isMaxStars ? 'Max Ascension Reached' : canAwaken ? 'Awaken Hero' : 'Collect More Duplicate Heroes'}
                        </button>
                    </div>
                </div>
                
                <div class="mt-4 pt-2">
                    <h4 class="font-bold text-slate-700 mb-2 text-sm">Ultimate Ability</h4>
                    <div class="bg-purple-50 border border-purple-100 rounded-lg p-3">
                        <div class="flex justify-between items-center mb-1">
                            <span class="font-bold text-purple-700 text-sm">${hero.ultimate.name}</span>
                            <span class="text-xs bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded">100 Mana</span>
                        </div>
                        <p class="text-xs text-purple-800/80 leading-relaxed">${hero.ultimate.desc}</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = html;
    
    // Bind Events
    const lvlBtn = document.getElementById('modal-levelup-btn');
    if (lvlBtn && canAfford) {
        lvlBtn.onclick = () => {
            if (hero.levelUp(xpNeeded)) {
                gameState.gold -= xpNeeded;
                showNotification(`Level Up! ${hero.name} is now Lv.${hero.level}`, 'success');
                gameState.updateQuest('levelUp', 1);
                saveGame(gameState);
                updateUI(gameState);
                renderRoster(gameState); // Refresh grid
                showHeroDetails(hero, gameState); // Refresh modal
            }
        };
    }
    
    // Bind Awaken
    const awakenBtn = document.getElementById('modal-awaken-btn');
    if (awakenBtn && !isMaxStars) {
        awakenBtn.onclick = () => {
            if (hero.awakeningShards >= shardsRequired) {
                hero.awakeningShards -= shardsRequired;
                hero.stars++;
                hero.calculateStats(gameState.getSkillTreeBonuses());
                
                showNotification(`Awakened! ${hero.name} is now ${hero.stars} Stars!`, 'success');
                
                // Play particle effect on the star area if possible
                if(typeof playParticleEffect === 'function') {
                    playParticleEffect(awakenBtn);
                }

                saveGame(gameState);
                updateUI(gameState);
                renderRoster(gameState);
                showHeroDetails(hero, gameState);
            }
        };
    }
    
    // Show Modal
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => {
        modal.classList.remove('opacity-0', 'pointer-events-none');
    });
}

// ===========================
// QUESTS TAB
// ===========================

function renderQuests(gameState) {
    const container = document.getElementById('quests-tab');
    if (!container) return;
    
    gameState.checkQuestReset();
    
    let html = `
        <h2 class="text-2xl font-heading font-bold text-slate-800 mb-6 animate-entry">Daily Quests</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-entry">
    `;
    
    gameState.quests.forEach(quest => {
        const progress = Math.min(100, (quest.current / quest.target) * 100);
        const isFinished = quest.current >= quest.target;
        
        html += `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full">
                <div class="mb-4">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="font-bold text-slate-700">${quest.desc}</h3>
                        ${quest.claimed ? '<span class="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">CLAIMED</span>' : ''}
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                        <div class="bg-primary h-2.5 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                    </div>
                    <div class="text-xs text-slate-500 text-right">${quest.current} / ${quest.target}</div>
                </div>
                
                ${isFinished && !quest.claimed ? `
                    <button class="btn btn-primary w-full text-sm py-2" onclick="claimQuestReward('${quest.id}')">
                        Claim Rewards
                    </button>
                ` : ''}
            </div>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
    
    // Global function for the onclick handler
    window.claimQuestReward = (qid) => {
        const reward = gameState.claimQuest(qid);
        if (reward) {
            showNotification('Quest Rewards Claimed!', 'success');
            updateUI(gameState);
            renderQuests(gameState);
            saveGame(gameState);
        }
    };
}

// ===========================
// EXPEDITION TAB
// ===========================

function updateExpeditionUI(gameState) {
    const container = document.getElementById('expedition-tab');
    if (!container) return;
    
    const rewards = gameState.calculateExpeditionRewards();
    const isRunning = gameState.expedition.isActive;
    
    container.innerHTML = `
        <div class="max-w-2xl mx-auto mt-8 animate-entry">
            <div class="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div class="h-40 bg-amber-50 relative flex items-center justify-center">
                    <i class="fa-solid fa-map-location-dot text-6xl text-amber-200"></i>
                    <div class="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent"></div>
                </div>
                <div class="p-8 text-center">
                    <h2 class="text-2xl font-heading font-bold text-slate-800 mb-2">Resource Expedition</h2>
                    <p class="text-slate-500 mb-8">Your heroes are gathering resources in the background.</p>
                    
                    <div class="bg-slate-50 rounded-xl p-6 mb-8 border border-slate-100">
                        <div class="text-sm text-slate-400 uppercase font-bold mb-4">Accumulated Rewards</div>
                        <div class="flex justify-center gap-8">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-slate-700">${rewards ? rewards.gold : 0}</div>
                                <div class="text-xs text-slate-400">Gold</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-slate-700">${rewards ? rewards.petals : 0}</div>
                                <div class="text-xs text-slate-400">Petals</div>
                            </div>
                        </div>
                        <div class="mt-4 text-xs text-slate-400">Duration: ${rewards ? rewards.hours : '0.0'} hours</div>
                    </div>
                    
                    <button class="btn btn-primary w-full py-3 text-lg" onclick="handleExpeditionClaim()">
                        Claim & Restart
                    </button>
                </div>
            </div>
        </div>
    `;
    
    window.handleExpeditionClaim = () => {
        const claimed = gameState.claimExpeditionRewards();
        if (claimed && claimed.gold > 0) {
            showNotification(`Claimed ${claimed.gold} Gold & ${claimed.petals} Petals!`, 'success');
            updateUI(gameState);
            updateExpeditionUI(gameState);
            saveGame(gameState);
        } else {
            showNotification('Not enough rewards yet!', 'info');
        }
    };
}

// ===========================
// SETTINGS / PROFILE TAB
// ===========================

function renderProfile(gameState) {
    const container = document.getElementById('settings-tab');
    if (!container) return;
    
    container.innerHTML = `
        <div class="max-w-lg mx-auto mt-8 animate-entry">
            <h2 class="text-2xl font-heading font-bold text-slate-800 mb-6">Settings & Profile</h2>
            
            <div class="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
                <h3 class="font-bold text-slate-700 mb-4">Player Profile</h3>
                <div class="flex gap-4 mb-4">
                    <input type="text" id="settings-username" value="${gameState.username}" class="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 outline-none focus:border-primary transition-colors">
                    <button class="btn btn-secondary" onclick="saveUsername()">Update</button>
                </div>
                <div class="grid grid-cols-2 gap-4 text-sm text-slate-600">
                    <div>Total Battles: <span class="font-bold text-slate-800">${gameState.stats.totalBattles}</span></div>
                    <div>Highest Wave: <span class="font-bold text-slate-800">${gameState.highestWave}</span></div>
                    <div>Total Pulls: <span class="font-bold text-slate-800">${gameState.stats.totalPulls}</span></div>
                    <div>Play Time: <span class="font-bold text-slate-800">${Math.floor(gameState.stats.playTime / 3600)}h</span></div>
                </div>
            </div>
            
            <div class="bg-red-50 rounded-xl border border-red-100 p-6">
                <h3 class="font-bold text-red-700 mb-2">Danger Zone</h3>
                <p class="text-sm text-red-600/80 mb-4">Resetting your game is irreversible. All progress will be lost.</p>
                <button class="btn bg-red-500 text-white hover:bg-red-600 w-full" onclick="debug.reset()">
                    <i class="fa-solid fa-trash"></i> Reset Game Data
                </button>
            </div>
        </div>
    `;
    
    window.saveUsername = () => {
        const input = document.getElementById('settings-username');
        if (input && input.value.trim()) {
            gameState.username = input.value.trim();
            updateUI(gameState);
            saveGame(gameState);
            showNotification('Username Updated!', 'success');
        }
    };
}