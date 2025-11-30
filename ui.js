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
// TEAM SELECTION
// ===========================

function showHeroSelectionModal(slotIndex, gameState) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = ''; // Clear content

    // Container
    const container = document.createElement('div');
    container.className = 'bg-slate-50 p-8 min-h-[600px]';

    // Header
    const header = document.createElement('h3');
    header.className = 'text-2xl font-heading font-bold text-slate-800 mb-6';
    header.textContent = `Select Hero for Slot ${slotIndex + 1}`;
    container.appendChild(header);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4';

    // "Clear Slot" Option
    const clearCard = document.createElement('div');
    clearCard.className = 'hero-card border-2 border-dashed border-slate-300 bg-slate-100 flex items-center justify-center cursor-pointer hover:bg-slate-200 aspect-[3/4] rounded-xl transition-colors';
    clearCard.innerHTML = `
        <div class="text-center text-slate-400">
            <i class="fa-solid fa-xmark text-3xl mb-2"></i>
            <div class="text-sm font-bold">Empty Slot</div>
        </div>
    `;
    clearCard.onclick = () => selectHeroForSlot(slotIndex, null);
    grid.appendChild(clearCard);

    // Hero List
    const sortedHeroes = [...gameState.roster].sort((a, b) => b.getPower() - a.getPower());

    sortedHeroes.forEach(hero => {
        const assignedSlot = gameState.team.indexOf(hero.id);
        const isAssigned = assignedSlot !== -1 && assignedSlot !== slotIndex;

        // Card Wrapper
        const card = document.createElement('div');
        card.className = `hero-card relative transition-transform duration-200 rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-white ${isAssigned ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer hover:scale-105 hover:shadow-md'}`;
        
        if (!isAssigned) {
            card.onclick = () => selectHeroForSlot(slotIndex, hero.id);
        }

        // Image Container
        const imgContainer = document.createElement('div');
        imgContainer.className = 'relative aspect-[3/4] overflow-hidden bg-slate-100';

        const img = document.createElement('img');
        img.src = `images/${hero.id}.jpg`;
        img.className = 'w-full h-full object-cover';
        
        img.onerror = () => {
            const div = document.createElement('div');
            const colors = {
                'Fire': 'from-red-400 to-orange-500', 'Water': 'from-blue-400 to-cyan-500',
                'Wind': 'from-emerald-400 to-teal-500', 'Light': 'from-yellow-300 to-amber-500',
                'Dark': 'from-purple-500 to-indigo-600'
            };
            const gradient = colors[hero.element] || 'from-slate-400 to-slate-600';
            div.className = `w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-2xl font-heading font-bold opacity-90`;
            div.textContent = hero.name.substring(0, 2).toUpperCase();
            img.replaceWith(div);
        };
        imgContainer.appendChild(img);

        // Star Level
        const starBadge = document.createElement('div');
        starBadge.className = "absolute top-1 left-1 text-[12px] text-yellow-400 font-bold z-10 drop-shadow-md";
        starBadge.textContent = '⭐'.repeat(hero.stars);
        imgContainer.appendChild(starBadge);

        // Rarity Badge
        const badge = document.createElement('div');
        badge.className = `absolute top-1 right-1 badge-${hero.rarity} text-[10px] text-white px-1.5 py-0.5 rounded shadow font-bold`;
        badge.textContent = hero.rarity;
        imgContainer.appendChild(badge);

        if (isAssigned) {
            const overlay = document.createElement('div');
            overlay.className = 'absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-sm tracking-wider';
            overlay.textContent = 'IN TEAM';
            imgContainer.appendChild(overlay);
        }

        card.appendChild(imgContainer);

        // Info
        const pw = hero.getPower ? hero.getPower() : 0;
        const info = document.createElement('div');
        info.className = 'p-3 text-center border-t border-slate-100 flex flex-col gap-1.5';
        info.innerHTML = `
            <div class="text-base font-extrabold text-slate-800 truncate leading-tight">${hero.name}</div>
            <div class="text-xs font-semibold text-slate-500 bg-slate-100 py-0.5 px-2 rounded-full mx-auto">Lv.${hero.level} • ${hero.class}</div>
            <div class="mt-0.5">
                <span class="text-sm font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-0.5 rounded shadow-sm">PW: ${formatNumber(pw)}</span>
            </div>
        `;
        card.appendChild(info);

        grid.appendChild(card);
    });

    container.appendChild(grid);
    modalBody.appendChild(container);
    
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.remove('opacity-0', 'pointer-events-none'));
}

window.selectHeroForSlot = function(slotIndex, heroId) {
    window.gameState.setTeamMember(slotIndex, heroId);
    saveGame(window.gameState);
    
    if (typeof renderBattleDashboard === 'function') {
        renderBattleDashboard(window.gameState);
    }
    
    closeModal();
    showNotification(heroId ? 'Hero assigned!' : 'Slot cleared.', 'success');
};

// ===========================
// ROSTER TAB
// ===========================

function renderRoster(gameState) {
    const container = document.getElementById('roster-tab');
    if (!container) return;
    
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
    
    if (rarityFilter !== 'all') {
        heroes = heroes.filter(h => h.rarity === rarityFilter);
    }
    
    const rarityOrder = { 'UR': 5, 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
    heroes.sort((a, b) => {
        if (sortFilter === 'level') return b.level - a.level;
        if (sortFilter === 'power') return b.getPower() - a.getPower();
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
    const card = document.createElement('div');
    card.className = 'hero-card cursor-pointer group';
    card.setAttribute('data-rarity', hero.rarity);

    const imgContainer = document.createElement('div');
    imgContainer.className = 'relative overflow-hidden';

    const img = document.createElement('img');
    img.src = `images/${hero.id}.jpg`;
    img.className = 'hero-card-image transition-transform duration-500 group-hover:scale-110';
    img.alt = hero.name;
    
    img.onerror = function() {
        const placeholder = createHeroPlaceholderElement(hero);
        this.replaceWith(placeholder);
    };

    imgContainer.appendChild(img);

    const starBadge = document.createElement('div');
    starBadge.className = 'absolute top-2 left-2 text-[12px] text-yellow-400 font-bold z-10 drop-shadow-md';
    starBadge.textContent = '⭐'.repeat(hero.stars);
    imgContainer.appendChild(starBadge);

    const rarityBadge = document.createElement('div');
    rarityBadge.className = `absolute top-2 right-2 badge-${hero.rarity} text-white text-xs font-bold px-2 py-0.5 rounded shadow-sm`;
    rarityBadge.textContent = hero.rarity;
    imgContainer.appendChild(rarityBadge);

    const pw = hero.getPower ? hero.getPower() : 0;
    const infoDiv = document.createElement('div');
    infoDiv.className = 'p-3 bg-white';
    infoDiv.innerHTML = `
        <div class="font-bold text-slate-800 text-sm truncate">${hero.name}</div>
        <div class="flex justify-between items-center mt-1">
            <div class="text-xs text-slate-500 flex items-center gap-1">
                <span>Lv.${hero.level}</span>
                <span class="text-slate-300">•</span>
                <span>${hero.class}</span>
            </div>
            <div class="text-[9px] font-bold text-amber-500 bg-amber-50 px-1.5 rounded border border-amber-100">PW: ${formatNumber(pw)}</div>
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

// ===========================
// HERO DETAILS MODAL
// ===========================

function showHeroDetails(hero, gameState) {
    const modalBody = document.getElementById('modal-body');
    if (!modalBody) return;
    
    // Stats calculation variables
    const xpNeeded = hero.getUpgradeCost();
    const canAfford = gameState.gold >= xpNeeded;
    const maxStars = 5; 
    const isMaxStars = hero.stars >= maxStars;
    const shardsRequired = hero.stars * 10;
    const canAwaken = !isMaxStars && hero.awakeningShards >= shardsRequired;
    
    let shardProgress = 0;
    if (!isMaxStars) {
        shardProgress = Math.min(100, (hero.awakeningShards / shardsRequired) * 100);
    } else {
        shardProgress = 100;
    }

    // Equipment Slot HTML Generator
    const generateEquipSlot = (type, iconClass) => {
        const item = hero.equipment[type];
        const isEmpty = !item;
        
        let rarityClass = "border-slate-200 bg-slate-50";
        if (item) {
            const rMap = { 'Common': 'border-slate-300 bg-white', 'Rare': 'border-blue-300 bg-blue-50', 'Epic': 'border-purple-300 bg-purple-50', 'Legendary': 'border-amber-300 bg-amber-50', 'Mythic': 'border-pink-300 bg-pink-50' };
            rarityClass = rMap[item.rarity] || rarityClass;
        }

        return `
            <div class="flex flex-col items-center gap-1 cursor-pointer group" onclick="showEquipmentSelectionModal('${hero.id}', '${type}')">
                <div class="w-16 h-16 rounded-xl border-2 ${rarityClass} flex items-center justify-center text-2xl relative shadow-sm transition-transform group-hover:scale-105">
                    ${item 
                        ? getItemIcon(type) 
                        : `<i class="${iconClass} text-slate-300"></i>`
                    }
                    ${item ? `<div class="absolute -bottom-1 -right-1 bg-slate-800 text-white text-[9px] px-1 rounded">${item.rarity.charAt(0)}</div>` : ''}
                </div>
                <div class="text-[10px] font-bold text-slate-500 uppercase tracking-wide">${type}</div>
            </div>
        `;
    };

    const html = `
        <div class="flex flex-col md:flex-row h-full min-h-[600px] md:h-[700px]">
            <div class="w-full md:w-5/12 relative bg-slate-900 overflow-hidden group">
                <img src="images/${hero.id}.jpg" class="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                     onerror="this.parentElement.innerHTML='<div class=\'w-full h-full bg-slate-800 flex items-center justify-center text-white font-bold text-6xl\'>${hero.name.substring(0,2).toUpperCase()}</div>'">
                
                <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                
                <div class="absolute bottom-6 left-6 z-10">
                    <div class="flex items-center gap-2 mb-2">
                         <span class="badge-${hero.rarity} px-2 py-0.5 rounded text-xs font-bold text-white shadow">${hero.rarity}</span>
                         <span class="bg-black/50 text-white px-2 py-0.5 rounded text-xs backdrop-blur-md border border-white/20">
                            ${getElementEmoji(hero.element)} ${hero.element}
                         </span>
                    </div>
                    <h2 class="text-4xl font-heading font-bold text-white mb-1 shadow-black drop-shadow-md">${hero.name}</h2>
                    <div class="text-slate-300 text-sm font-medium">${hero.class} Class</div>
                    <div class="flex gap-1 mt-3 text-yellow-400 text-xl drop-shadow-md">
                        ${'⭐'.repeat(hero.stars)}
                    </div>
                </div>
            </div>

            <div class="w-full md:w-7/12 bg-white flex flex-col h-full overflow-y-auto">
                <div class="p-8 space-y-8">
                    
                    <div>
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Combat Stats</h3>
                        <div class="grid grid-cols-5 gap-2">
                            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <div class="text-[10px] text-slate-400 font-bold mb-1">HP</div>
                                <div class="text-lg font-bold text-slate-700">${formatNumber(hero.maxHP)}</div>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <div class="text-[10px] text-slate-400 font-bold mb-1">ATK</div>
                                <div class="text-lg font-bold text-slate-700">${formatNumber(hero.atk)}</div>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <div class="text-[10px] text-slate-400 font-bold mb-1">DEF</div>
                                <div class="text-lg font-bold text-slate-700">${formatNumber(hero.def)}</div>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <div class="text-[10px] text-slate-400 font-bold mb-1">SPD</div>
                                <div class="text-lg font-bold text-slate-700">${hero.spd}</div>
                            </div>
                            <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                                <div class="text-[10px] text-slate-400 font-bold mb-1">CRIT</div>
                                <div class="text-lg font-bold text-slate-700">${hero.crit}%</div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Equipment</h3>
                        <div class="flex justify-around bg-slate-50 p-4 rounded-xl border border-slate-100">
                            ${generateEquipSlot('weapon', 'fa-solid fa-khanda')}
                            ${generateEquipSlot('artifact', 'fa-solid fa-scroll')}
                            ${generateEquipSlot('ring', 'fa-solid fa-ring')}
                            ${generateEquipSlot('cloak', 'fa-solid fa-user-shield')}
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <div class="flex justify-between items-center mb-4">
                                <div>
                                    <h4 class="font-bold text-slate-700">Level ${hero.level}</h4>
                                    <div class="text-xs text-slate-400">Max: 100</div>
                                </div>
                                <div class="text-right">
                                    <div class="text-sm font-bold ${canAfford ? 'text-slate-700' : 'text-red-500'}">
                                        ${formatNumber(xpNeeded)} <span class="text-xs font-normal text-slate-400">G</span>
                                    </div>
                                </div>
                            </div>
                            <button id="modal-levelup-btn" class="w-full btn py-2 text-sm ${canAfford ? 'btn-primary' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}" ${!canAfford ? 'disabled' : ''}>
                                Level Up
                            </button>
                        </div>

                        <div class="bg-amber-50 p-6 rounded-xl border border-amber-100">
                            <div class="flex justify-between items-end mb-3">
                                <h4 class="font-bold text-amber-800">Ascension</h4>
                                ${isMaxStars 
                                    ? '<span class="text-xs font-bold text-amber-600">MAXED</span>' 
                                    : `<span class="text-xs font-bold text-amber-700">${hero.awakeningShards}/${shardsRequired}</span>`
                                }
                            </div>
                            
                            ${!isMaxStars ? `
                            <div class="w-full bg-white/50 rounded-full h-2 mb-4 overflow-hidden border border-amber-100">
                                <div class="bg-amber-400 h-full transition-all duration-500" style="width: ${shardProgress}%"></div>
                            </div>` : ''}
                            
                            <button id="modal-awaken-btn" 
                                    class="w-full btn py-2 text-sm ${canAwaken ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-200/50 text-amber-400 cursor-not-allowed'}" 
                                    ${!canAwaken ? 'disabled' : ''}>
                                ${isMaxStars ? 'Maxed' : 'Awaken'}
                            </button>
                        </div>
                    </div>

                    <div class="flex items-start gap-4 p-4 rounded-xl border border-purple-100 bg-purple-50/50">
                        <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-500 text-lg border border-purple-200 shrink-0">
                            <i class="fa-solid fa-bolt"></i>
                        </div>
                        <div>
                            <div class="flex justify-between items-center mb-1">
                                <h4 class="font-bold text-slate-700 text-sm">${hero.ultimate.name}</h4>
                                <span class="text-[10px] font-bold text-purple-500 bg-purple-100 px-2 py-0.5 rounded">100 MP</span>
                            </div>
                            <p class="text-xs text-slate-600 leading-relaxed">${hero.ultimate.desc}</p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    `;
    
    modalBody.innerHTML = html;
    
    // Bind Buttons
    const lvlBtn = document.getElementById('modal-levelup-btn');
    if (lvlBtn && canAfford) {
        lvlBtn.onclick = () => {
            if (hero.levelUp(xpNeeded)) {
                gameState.gold -= xpNeeded;
                gameState.updateQuest('levelUp', 1);
                showNotification('Level Up!', 'success');
                refreshHeroModal(hero, gameState);
            }
        };
    }
    
    const awakenBtn = document.getElementById('modal-awaken-btn');
    if (awakenBtn && !isMaxStars) {
        awakenBtn.onclick = () => {
            if (hero.awakeningShards >= shardsRequired) {
                hero.awakeningShards -= shardsRequired;
                hero.stars++;
                hero.calculateStats(gameState.getSkillTreeBonuses());
                showNotification('Hero Awakened!', 'success');
                refreshHeroModal(hero, gameState);
            }
        };
    }
    
    const modal = document.getElementById('modal-overlay');
    modal.classList.remove('hidden');
    requestAnimationFrame(() => modal.classList.remove('opacity-0', 'pointer-events-none'));
}

function refreshHeroModal(hero, gameState) {
    saveGame(gameState);
    updateUI(gameState);
    if(document.getElementById('roster-tab').classList.contains('active')) {
        renderRoster(gameState);
    }
    showHeroDetails(hero, gameState);
}

// ===========================
// EQUIPMENT SELECTION MODAL
// ===========================

window.showEquipmentSelectionModal = function(heroId, slotType) {
    const modalBody = document.getElementById('modal-body');
    const hero = window.gameState.roster.find(h => h.id === heroId);
    if (!hero) return;

    // Filter available items: Must match type AND not be currently equipped by anyone
    const availableItems = (window.gameState.inventory.equipment || []).filter(item => item.type === slotType);
    
    // NOTE: In a more complex system, we'd filter out items equipped by *other* heroes.
    // For now, we assume inventory list contains ALL items, and we just move them around.
    // To do this right: Items in `inventory.equipment` are "unequipped". 
    // Items on heroes are removed from inventory array or marked.
    // CURRENT LOGIC: `gameState.inventory.equipment` holds ONLY unequipped items.
    // When equipped, it moves to `hero.equipment`. When unequipped, moves back.

    modalBody.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'bg-slate-50 p-6 min-h-[500px] flex flex-col';

    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-6';
    header.innerHTML = `
        <h3 class="text-xl font-heading font-bold text-slate-800">Equip ${slotType.charAt(0).toUpperCase() + slotType.slice(1)}</h3>
        <button class="text-slate-400 hover:text-slate-600" onclick="showHeroDetails(window.gameState.roster.find(h=>h.id=='${heroId}'), window.gameState)">
            <i class="fa-solid fa-arrow-left mr-1"></i> Back
        </button>
    `;
    container.appendChild(header);

    // Unequip Option (if currently equipped)
    if (hero.equipment[slotType]) {
        const currentItem = hero.equipment[slotType];
        const unequipDiv = document.createElement('div');
        unequipDiv.className = 'bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex justify-between items-center';
        unequipDiv.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-white rounded border border-red-100 flex items-center justify-center text-red-400">
                    <i class="fa-solid fa-slash"></i>
                </div>
                <div>
                    <div class="text-sm font-bold text-red-700">Unequip Current Item</div>
                    <div class="text-xs text-red-500">${currentItem.name}</div>
                </div>
            </div>
            <button class="btn bg-white border border-red-200 text-red-600 text-xs hover:bg-red-100" onclick="handleUnequip('${heroId}', '${slotType}')">Unequip</button>
        `;
        container.appendChild(unequipDiv);
    }

    // List Container
    const list = document.createElement('div');
    list.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar flex-1';

    if (availableItems.length === 0) {
        list.innerHTML = `<div class="col-span-full text-center text-slate-400 py-10">No available ${slotType}s in inventory.</div>`;
    } else {
        availableItems.forEach(item => {
            const el = document.createElement('div');
            
            // Rarity Colors
            const rMap = { 'Common': 'border-slate-200', 'Rare': 'border-blue-200', 'Epic': 'border-purple-200', 'Legendary': 'border-amber-200', 'Mythic': 'border-pink-200' };
            const borderColor = rMap[item.rarity] || 'border-slate-200';

            // Stats String
            let statsStr = '';
            for(const [k,v] of Object.entries(item.stats)) {
                statsStr += `<span class="mr-2 text-slate-600"><span class="font-bold uppercase text-[9px]">${k}</span> +${v}</span>`;
            }

            el.className = `bg-white p-3 rounded-xl border ${borderColor} shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all`;
            el.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <div class="font-bold text-slate-700 text-sm">${item.name}</div>
                    <div class="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-500">${item.rarity}</div>
                </div>
                <div class="text-xs mb-2 border-b border-slate-50 pb-2">${statsStr}</div>
                <button class="btn btn-primary w-full text-xs py-1.5" onclick="handleEquip('${heroId}', '${item.instanceId}', '${slotType}')">Equip</button>
            `;
            list.appendChild(el);
        });
    }

    container.appendChild(list);
    modalBody.appendChild(container);
}

window.handleEquip = function(heroId, itemInstanceId, slotType) {
    const gameState = window.gameState;
    const hero = gameState.roster.find(h => h.id === heroId);
    
    // Find item in inventory
    const inventoryIdx = gameState.inventory.equipment.findIndex(i => i.instanceId === itemInstanceId);
    if (inventoryIdx === -1 || !hero) return;
    
    const newItem = gameState.inventory.equipment[inventoryIdx];
    
    // 1. Remove new item from inventory
    gameState.inventory.equipment.splice(inventoryIdx, 1);
    
    // 2. Equip item (and get old one back if exists)
    const oldItem = hero.equipItem(slotType, newItem);
    
    // 3. Put old item back in inventory
    if (oldItem) {
        gameState.inventory.equipment.push(oldItem);
    }
    
    showNotification(`Equipped ${newItem.name}`, 'success');
    refreshHeroModal(hero, gameState);
};

window.handleUnequip = function(heroId, slotType) {
    const gameState = window.gameState;
    const hero = gameState.roster.find(h => h.id === heroId);
    
    if (!hero) return;
    
    const oldItem = hero.unequipItem(slotType);
    if (oldItem) {
        gameState.inventory.equipment.push(oldItem);
        showNotification('Item unequipped', 'info');
    }
    
    refreshHeroModal(hero, gameState);
};

function getItemIcon(type) {
    const icons = {
        'weapon': '<i class="fa-solid fa-khanda"></i>',
        'artifact': '<i class="fa-solid fa-scroll"></i>',
        'ring': '<i class="fa-solid fa-ring"></i>',
        'cloak': '<i class="fa-solid fa-user-shield"></i>'
    };
    return icons[type] || '<i class="fa-solid fa-cube"></i>';
}

// ... (Quests and Expedition sections remain unchanged)
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
        let diffColor = 'bg-slate-100 text-slate-500';
        if (quest.difficulty === 'Easy') diffColor = 'bg-green-100 text-green-600';
        if (quest.difficulty === 'Medium') diffColor = 'bg-blue-100 text-blue-600';
        if (quest.difficulty === 'Hard') diffColor = 'bg-orange-100 text-orange-600';
        if (quest.difficulty === 'Insane') diffColor = 'bg-purple-100 text-purple-600';
        let rewardsHtml = '';
        if (quest.reward) {
            for (const [key, val] of Object.entries(quest.reward)) {
                let icon = '';
                let label = key;
                if (key === 'gold') { icon = 'fa-coins text-yellow-500'; label = 'Gold'; }
                if (key === 'petals') { icon = 'fa-spa text-pink-500'; label = 'Petals'; }
                if (key === 'spiritOrbs') { icon = 'fa-gem text-purple-500'; label = 'Orbs'; }
                if (key === 'seeds') { icon = 'fa-seedling text-green-500'; label = 'Seeds'; } 
                if (key === 'seeds' && typeof val === 'object') {
                     rewardsHtml += `<span class="text-xs font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1"><i class="fa-solid ${icon}"></i> Seeds</span>`;
                } else {
                     rewardsHtml += `<span class="text-xs font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100 flex items-center gap-1"><i class="fa-solid ${icon}"></i> ${val} ${label}</span>`;
                }
            }
        }
        html += `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between h-full relative overflow-hidden">
                <div class="mb-4 relative z-10">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex flex-col gap-1">
                            <span class="text-[10px] font-bold uppercase tracking-wider ${diffColor} px-2 py-0.5 rounded w-fit">${quest.difficulty || 'Normal'}</span>
                            <h3 class="font-bold text-slate-700">${quest.desc}</h3>
                        </div>
                        ${quest.claimed ? '<span class="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded border border-green-100">CLAIMED</span>' : ''}
                    </div>
                    <div class="flex flex-wrap gap-2 mb-3">
                        ${rewardsHtml}
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-2.5 mb-1">
                        <div class="bg-primary h-2.5 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                    </div>
                    <div class="text-xs text-slate-500 text-right font-mono">${quest.current} / ${quest.target}</div>
                </div>
                ${isFinished && !quest.claimed ? `
                    <button class="btn btn-primary w-full text-sm py-2 relative z-10" onclick="claimQuestReward('${quest.id}')">
                        Claim Rewards
                    </button>
                ` : ''}
            </div>
        `;
    });
    html += `</div>`;
    container.innerHTML = html;
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

function updateExpeditionUI(gameState) {
    const container = document.getElementById('expedition-tab');
    if (!container) return;
    const rewards = gameState.calculateExpeditionRewards();
    
    // Helper to render materials nicely
    let matsHtml = '';
    if (rewards.materials && rewards.materials.length > 0) {
        matsHtml = `<div class="mt-2 text-xs font-bold text-indigo-500 bg-indigo-50 px-2 py-1 rounded border border-indigo-100 inline-block">
            +${rewards.materials.length} Materials Found!
        </div>`;
    }

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
                        <div class="flex justify-center gap-8 mb-2">
                            <div class="text-center">
                                <div class="text-2xl font-bold text-slate-700">${rewards ? rewards.gold : 0}</div>
                                <div class="text-xs text-slate-400">Gold</div>
                            </div>
                            <div class="text-center">
                                <div class="text-2xl font-bold text-slate-700">${rewards ? rewards.petals : 0}</div>
                                <div class="text-xs text-slate-400">Petals</div>
                            </div>
                        </div>
                        ${matsHtml}
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
            let msg = `Claimed ${claimed.gold} Gold & ${claimed.petals} Petals!`;
            if (claimed.materials && claimed.materials.length > 0) {
                msg += ` +${claimed.materials.length} Materials!`;
            }
            showNotification(msg, 'success');
            updateUI(gameState);
            updateExpeditionUI(gameState);
            saveGame(gameState);
        } else {
            showNotification('Not enough rewards yet!', 'info');
        }
    };
}

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