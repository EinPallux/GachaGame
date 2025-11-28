/* ===========================
   SAKURA CHRONICLES - UI
   UI Management & Rendering
   =========================== */

// ===========================
// UPDATE ALL UI
// ===========================

function updateUI(gameState) {
    updateCurrencyDisplay(gameState);
    updateBattleStats(gameState);
    updatePityDisplay(gameState);
    updateBattleButtonState(gameState); 
    
    // Update Header Username
    const usernameDisplay = document.getElementById('header-username');
    if (usernameDisplay) usernameDisplay.textContent = gameState.username;

    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const tabId = activeTab.id;
        if (tabId === 'battle-tab') renderTeamSelection(gameState); 
        if (tabId === 'roster-tab') renderRoster(gameState);
        if (tabId === 'skill-tree-tab') renderSkillTree(gameState);
        if (tabId === 'expedition-tab') updateExpeditionUI(gameState);
        if (tabId === 'quests-tab') renderQuests(gameState);
        if (tabId === 'garden-tab') renderGarden(gameState); 
        if (tabId === 'profile-tab') renderProfile(gameState); // NEW
    }
}

// ===========================
// UPDATE CURRENCY DISPLAY
// ===========================

function updateCurrencyDisplay(gameState) {
    const goldDisplay = document.getElementById('gold-display');
    const petalsDisplay = document.getElementById('petals-display');
    const orbsDisplay = document.getElementById('orbs-display');
    
    if (goldDisplay) goldDisplay.textContent = formatNumber(gameState.gold);
    if (petalsDisplay) petalsDisplay.textContent = formatNumber(gameState.petals);
    if (orbsDisplay) orbsDisplay.textContent = formatNumber(gameState.spiritOrbs);
}

// ===========================
// UPDATE BATTLE STATS 
// ===========================

function updateBattleStats(gameState) {
    const waveDisplay = document.getElementById('wave-display');
    const waveDisplayHeader = document.getElementById('wave-display-header');
    const highestWaveDisplay = document.getElementById('highest-wave-display');
    const enemiesDefeatedDisplay = document.getElementById('enemies-defeated-display');
    
    if (waveDisplay) waveDisplay.textContent = gameState.currentWave;
    if (waveDisplayHeader) waveDisplayHeader.textContent = gameState.currentWave;
    if (highestWaveDisplay) highestWaveDisplay.textContent = gameState.highestWave;
    if (enemiesDefeatedDisplay) enemiesDefeatedDisplay.textContent = formatNumber(gameState.enemiesDefeated);
}

// ===========================
// RENDER PROFILE (NEW)
// ===========================

function renderProfile(gameState) {
    // Update Username Input Value if it's empty (first load)
    const usernameInput = document.getElementById('username-input');
    if (usernameInput && usernameInput.value === '') {
        usernameInput.value = gameState.username;
    }

    // Update Stats
    const playTimeEl = document.getElementById('profile-playtime');
    const battlesEl = document.getElementById('profile-battles');
    const pullsEl = document.getElementById('profile-pulls');
    const waveEl = document.getElementById('profile-wave');

    if (playTimeEl) {
        const hours = Math.floor(gameState.stats.playTime / 3600);
        const minutes = Math.floor((gameState.stats.playTime % 3600) / 60);
        playTimeEl.textContent = `${hours}h ${minutes}m`;
    }

    if (battlesEl) battlesEl.textContent = formatNumber(gameState.stats.totalBattles);
    if (pullsEl) pullsEl.textContent = formatNumber(gameState.stats.totalPulls);
    if (waveEl) waveEl.textContent = gameState.highestWave;
}

// ===========================
// RENDER ROSTER
// ===========================

function renderRoster(gameState) {
    const container = document.getElementById('roster-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    const rarityFilter = document.getElementById('roster-filter-rarity')?.value || 'all';
    const elementFilter = document.getElementById('roster-filter-element')?.value || 'all';
    const sortFilter = document.getElementById('roster-sort')?.value || 'rarity';
    
    let heroes = [...gameState.roster];
    
    if (rarityFilter !== 'all') {
        heroes = heroes.filter(h => h.rarity === rarityFilter);
    }
    
    if (elementFilter !== 'all') {
        heroes = heroes.filter(h => h.element === elementFilter);
    }
    
    const rarityOrder = { 'UR': 5, 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
    heroes.sort((a, b) => {
        if (sortFilter === 'team') {
            const aInTeam = gameState.team.includes(a.id);
            const bInTeam = gameState.team.includes(b.id);
            if (aInTeam && !bInTeam) return -1;
            if (!aInTeam && bInTeam) return 1;
            if (aInTeam && bInTeam) return gameState.team.indexOf(a.id) - gameState.team.indexOf(b.id);
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        } else if (sortFilter === 'level') {
            return b.level - a.level;
        } else {
            if (rarityOrder[b.rarity] !== rarityOrder[a.rarity]) {
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            }
            return b.level - a.level;
        }
    });
    
    heroes.forEach(hero => {
        const card = createHeroCard(hero, gameState);
        container.appendChild(card);
    });
    
    if (heroes.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'col-span-full text-center text-slate-500 py-8';
        emptyMessage.textContent = 'No heroes found with these filters.';
        container.appendChild(emptyMessage);
    }
}

// ===========================
// CREATE HERO CARD
// ===========================

function createHeroCard(hero, gameState) {
    const card = document.createElement('div');
    card.className = `hero-card rarity-${hero.rarity}`;
    
    const isInTeam = gameState.team.includes(hero.id);
    if (isInTeam) {
        card.classList.add('in-team');
    }
    
    const img = document.createElement('img');
    img.className = 'hero-card-image';
    img.src = `/images/${hero.id}.jpg`;
    img.alt = hero.name;
    img.onerror = function() {
        const placeholder = createHeroPlaceholder(hero);
        img.replaceWith(placeholder);
    };
    card.appendChild(img);
    
    if (isInTeam) {
        const teamBadge = document.createElement('div');
        teamBadge.className = 'in-team-badge';
        const teamSlot = gameState.team.indexOf(hero.id) + 1;
        teamBadge.innerHTML = `<span class="team-badge-icon">⭐</span><span>Team Slot ${teamSlot}</span>`;
        card.appendChild(teamBadge);
    }
    
    const levelBadge = document.createElement('div');
    levelBadge.className = 'hero-card-level';
    levelBadge.textContent = `Lv.${hero.level}`;
    card.appendChild(levelBadge);
    
    const rarityBadge = document.createElement('div');
    rarityBadge.className = `hero-card-rarity badge-${hero.rarity}`;
    rarityBadge.textContent = hero.rarity;
    card.appendChild(rarityBadge);
    
    const info = document.createElement('div');
    info.className = 'hero-card-info';
    
    const name = document.createElement('div');
    name.className = 'hero-card-name';
    name.textContent = hero.name;
    
    const details = document.createElement('div');
    details.className = 'hero-card-details';
    
    const element = document.createElement('span');
    element.textContent = getElementEmoji(hero.element);
    
    const classSpan = document.createElement('span');
    classSpan.textContent = hero.class;
    
    details.appendChild(element);
    details.appendChild(classSpan);
    
    const stars = document.createElement('div');
    stars.className = 'hero-card-stars';
    for (let i = 0; i < hero.stars; i++) {
        const star = document.createElement('span');
        star.textContent = '⭐';
        star.style.fontSize = '0.75rem';
        stars.appendChild(star);
    }
    
    info.appendChild(name);
    info.appendChild(details);
    info.appendChild(stars);
    
    card.appendChild(info);
    card.onclick = () => showHeroDetails(hero, gameState);
    
    return card;
}

// ===========================
// SHOW HERO DETAILS MODAL
// ===========================

function showHeroDetails(hero, gameState) {
    const modal = document.getElementById('hero-modal');
    const detailContainer = document.getElementById('hero-detail');
    
    if (!modal || !detailContainer) return;
    
    detailContainer.innerHTML = '';
    
    // Image
    const img = document.createElement('img');
    img.className = 'w-full rounded-lg mb-4';
    img.style.maxHeight = '300px';
    img.style.objectFit = 'cover';
    img.src = `/images/${hero.id}.jpg`;
    img.onerror = function() {
        const placeholder = createHeroPlaceholder(hero);
        placeholder.style.height = '300px';
        img.replaceWith(placeholder);
    };
    detailContainer.appendChild(img);
    
    // Header
    const header = document.createElement('div');
    header.className = 'mb-4';
    header.innerHTML = `
        <h2 class="text-2xl font-bold mb-2">${hero.name}</h2>
        <div class="flex gap-2 items-center">
            <span class="badge-${hero.rarity} px-3 py-1 rounded-lg text-white font-semibold">${hero.rarity}</span>
            <span>${getElementEmoji(hero.element)} ${hero.element}</span>
            <span>⚔️ ${hero.class}</span>
        </div>
    `;
    detailContainer.appendChild(header);
    
    // Stats
    const stats = document.createElement('div');
    stats.className = 'grid grid-cols-2 gap-3 mb-4';
    stats.innerHTML = `
        <div class="bg-pink-50 p-3 rounded-lg">
            <div class="text-sm text-slate-600">Level</div>
            <div class="text-xl font-bold">${hero.level}</div>
        </div>
        <div class="bg-pink-50 p-3 rounded-lg">
            <div class="text-sm text-slate-600">HP</div>
            <div class="text-xl font-bold">${hero.maxHP}</div>
        </div>
        <div class="bg-pink-50 p-3 rounded-lg">
            <div class="text-sm text-slate-600">ATK</div>
            <div class="text-xl font-bold">${hero.atk}</div>
        </div>
        <div class="bg-pink-50 p-3 rounded-lg">
            <div class="text-sm text-slate-600">DEF</div>
            <div class="text-xl font-bold">${hero.def}</div>
        </div>
    `;
    detailContainer.appendChild(stats);
    
    // Awakening
    const awakening = document.createElement('div');
    awakening.className = 'bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4';
    const shardsNeeded = hero.stars * 10;
    awakening.innerHTML = `
        <div class="font-semibold mb-2">Awakening Progress</div>
        <div class="text-sm mb-2">Shards: ${hero.awakeningShards} / ${shardsNeeded}</div>
        <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-amber-500 h-2 rounded-full" style="width: ${(hero.awakeningShards / shardsNeeded) * 100}%"></div>
        </div>
    `;
    
    if (hero.stars < 5 && hero.awakeningShards >= shardsNeeded) {
        const awakenBtn = document.createElement('button');
        awakenBtn.className = 'btn btn-gold w-full mt-3';
        awakenBtn.textContent = `Awaken to ${hero.stars + 1} Stars`;
        awakenBtn.onclick = () => {
            if (hero.awaken()) {
                showNotification(`✨ ${hero.name} awakened to ${hero.stars} stars!`, 'success');
                showHeroDetails(hero, gameState);
                saveGame(gameState);
            }
        };
        awakening.appendChild(awakenBtn);
    } else if (hero.stars >= 5) {
        awakening.innerHTML += '<div class="text-center text-amber-600 font-semibold mt-2">★ MAX STARS ★</div>';
    }
    detailContainer.appendChild(awakening);
    
    // Level Up
    const upgradeCost = hero.getUpgradeCost();
    const levelUpBtn = document.createElement('button');
    levelUpBtn.className = 'btn btn-primary w-full mb-4';
    levelUpBtn.innerHTML = `Level Up (${upgradeCost} Gold)`;
    levelUpBtn.disabled = gameState.gold < upgradeCost;
    levelUpBtn.onclick = () => {
        if (gameState.gold >= upgradeCost) {
            gameState.gold -= upgradeCost;
            hero.levelUp(upgradeCost);
            showNotification(`${hero.name} leveled up!`, 'success');
            showHeroDetails(hero, gameState);
            updateCurrencyDisplay(gameState);
            gameState.updateQuest('levelUp', 1);
            saveGame(gameState);
        }
    };
    detailContainer.appendChild(levelUpBtn);
    
    // Add to Team Button
    const addToTeamBtn = document.createElement('button');
    addToTeamBtn.className = 'btn btn-secondary w-full';
    addToTeamBtn.textContent = 'Add to Team';
    addToTeamBtn.onclick = () => {
        if (gameState.isBattleActive) {
            showNotification('Cannot change team during an active run!', 'error');
            return;
        }
        modal.classList.remove('active');
        switchTab('battle');
        showTeamSelectionForHero(hero, gameState);
    };
    detailContainer.appendChild(addToTeamBtn);
    
    modal.classList.add('active');
}

// ===========================
// SHOW TEAM SELECTION
// ===========================

function showTeamSelectionForHero(hero, gameState) {
    const emptySlotIndex = gameState.team.indexOf(null);
    
    if (emptySlotIndex !== -1) {
        gameState.setTeamMember(emptySlotIndex, hero.id);
        renderTeamSelection(gameState);
        showNotification(`${hero.name} added to team!`, 'success');
        saveGame(gameState);
    } else {
        showNotification('Team is full! Click a slot to replace a hero.', 'error');
    }
}

// ===========================
// RENDER TEAM SELECTION
// ===========================

function renderTeamSelection(gameState) {
    const container = document.getElementById('team-selection');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const slot = createTeamSlot(i, gameState);
        container.appendChild(slot);
    }
}

// ===========================
// CREATE TEAM SLOT
// ===========================

function createTeamSlot(index, gameState) {
    const slot = document.createElement('div');
    slot.className = 'team-slot';
    
    const heroId = gameState.team[index];
    const hero = heroId ? gameState.roster.find(h => h.id === heroId) : null;
    
    if (hero) {
        slot.classList.add('filled');
        
        const img = document.createElement('img');
        img.className = 'team-slot-image';
        img.src = `/images/${hero.id}.jpg`;
        img.onerror = () => img.replaceWith(createHeroPlaceholder(hero));
        slot.appendChild(img);
        
        const info = document.createElement('div');
        info.className = 'team-slot-info';
        info.innerHTML = `
            <div class="team-slot-name">${hero.name}</div>
            <div class="team-slot-level">Lv.${hero.level}</div>
        `;
        slot.appendChild(info);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'text-red-500 hover:text-red-700 font-bold';
        removeBtn.innerHTML = '✕';
        removeBtn.onclick = (e) => {
            e.stopPropagation();
            if (gameState.isBattleActive) {
                showNotification('Cannot remove hero during a run!', 'error');
                return;
            }
            gameState.setTeamMember(index, null);
            renderTeamSelection(gameState);
            saveGame(gameState);
        };
        slot.appendChild(removeBtn);
    } else {
        slot.innerHTML = `
            <div class="team-slot-placeholder bg-slate-200">+</div>
            <div class="team-slot-info">
                <div class="team-slot-name text-slate-500">Empty</div>
            </div>
        `;
    }
    
    slot.onclick = () => showHeroSelectionModal(index, gameState);
    
    return slot;
}

// ===========================
// SHOW HERO SELECTION MODAL
// ===========================

function showHeroSelectionModal(slotIndex, gameState) {
    if (gameState.isBattleActive) {
        showNotification('Cannot change team during a run!', 'error');
        return;
    }

    const modal = document.getElementById('hero-modal');
    const detailContainer = document.getElementById('hero-detail');
    
    if (!modal || !detailContainer) return;
    
    detailContainer.innerHTML = '';
    
    const title = document.createElement('h2');
    title.className = 'section-title mb-4';
    title.textContent = `Select Hero for Slot ${slotIndex + 1}`;
    detailContainer.appendChild(title);
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-3 gap-3 max-h-96 overflow-y-auto';
    
    gameState.roster.forEach(hero => {
        const miniCard = document.createElement('div');
        miniCard.className = `hero-card rarity-${hero.rarity} cursor-pointer hover:scale-105 transition`;
        
        if (gameState.team.includes(hero.id)) {
            miniCard.style.opacity = '0.5';
        }
        
        const img = document.createElement('img');
        img.className = 'hero-card-image';
        img.src = `/images/${hero.id}.jpg`;
        img.onerror = () => img.replaceWith(createHeroPlaceholder(hero));
        miniCard.appendChild(img);
        
        const name = document.createElement('div');
        name.className = 'hero-card-name text-xs p-2';
        name.textContent = hero.name;
        miniCard.appendChild(name);
        
        miniCard.onclick = () => {
            gameState.setTeamMember(slotIndex, hero.id);
            renderTeamSelection(gameState);
            modal.classList.remove('active');
            saveGame(gameState);
        };
        
        grid.appendChild(miniCard);
    });
    
    detailContainer.appendChild(grid);
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-secondary w-full mt-4';
    closeBtn.textContent = 'Cancel';
    closeBtn.onclick = () => modal.classList.remove('active');
    detailContainer.appendChild(closeBtn);
    
    modal.classList.add('active');
}

// ===========================
// RENDER QUESTS
// ===========================

function renderQuests(gameState) {
    const container = document.getElementById('quests-list');
    if (!container) return;
    
    gameState.checkQuestReset();
    container.innerHTML = '';
    
    gameState.quests.forEach(quest => {
        const card = createQuestCard(quest, gameState);
        container.appendChild(card);
    });
}

function createQuestCard(quest, gameState) {
    const card = document.createElement('div');
    card.className = `quest-card ${quest.completed ? 'completed' : ''}`;
    
    card.innerHTML = `
        <div class="flex justify-between items-center mb-2">
            <div class="font-semibold">${quest.desc}</div>
            <div class="text-sm text-slate-600">${quest.current} / ${quest.target}</div>
        </div>
        <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width: ${(quest.current / quest.target) * 100}%"></div>
        </div>
    `;
    
    if (quest.completed && !quest.claimed) {
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary w-full mt-3';
        btn.textContent = 'Claim Rewards';
        btn.onclick = () => {
            gameState.claimQuest(quest.id);
            showNotification('Rewards claimed!', 'success');
            renderQuests(gameState);
            updateCurrencyDisplay(gameState);
            saveGame(gameState);
        };
        card.appendChild(btn);
    } else if (quest.claimed) {
        card.innerHTML += '<div class="text-center text-green-600 font-semibold mt-2">✓ Claimed</div>';
    }
    
    return card;
}

// ===========================
// UPDATE EXPEDITION UI
// ===========================

function updateExpeditionUI(gameState) {
    const statusContainer = document.getElementById('expedition-status');
    const claimBtn = document.getElementById('claim-expedition-btn');
    
    if (!statusContainer || !claimBtn) return;
    
    const rewards = gameState.calculateExpeditionRewards();
    
    if (rewards && rewards.gold > 0) {
        statusContainer.innerHTML = `
            <div class="mb-2">Expedition Time: <strong>${rewards.hours}</strong> hours</div>
            <div class="text-sm">Rewards: 💰 ${rewards.gold} Gold, 🌸 ${rewards.petals} Petals</div>
        `;
        claimBtn.disabled = false;
        claimBtn.onclick = () => {
            const claimed = gameState.claimExpeditionRewards();
            if (claimed) {
                showNotification(`Claimed ${claimed.gold} Gold & ${claimed.petals} Petals!`, 'success');
                updateExpeditionUI(gameState);
                updateCurrencyDisplay(gameState);
                saveGame(gameState);
            }
        };
    } else {
        statusContainer.innerHTML = '<div>Heroes are exploring...</div><div class="text-sm text-slate-600 mt-2">Check back later!</div>';
        claimBtn.disabled = true;
    }
}

// ===========================
// SETUP FILTER LISTENERS
// ===========================

function setupFilterListeners(gameState) {
    ['roster-filter-rarity', 'roster-filter-element', 'roster-sort'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.onchange = () => renderRoster(gameState);
    });
}

// ===========================
// SETUP MODAL LISTENERS
// ===========================

function setupModalListeners() {
    const modal = document.getElementById('hero-modal');
    if (modal) {
        const closeBtn = modal.querySelector('.modal-close');
        if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');
        modal.onclick = (e) => { if (e.target === modal) modal.classList.remove('active'); };
    }
}

// ===========================
// SETUP TAB LISTENERS
// ===========================

function setupTabListeners(gameState) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.onclick = () => switchTab(tab.getAttribute('data-tab'), gameState);
    });
}

function switchTab(tabName, gameState = null) {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.toggle('active', tab.getAttribute('data-tab') === tabName);
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}-tab`);
    });
    
    if (gameState) {
        if (tabName === 'battle') renderTeamSelection(gameState); 
        if (tabName === 'roster') renderRoster(gameState);
        if (tabName === 'skill-tree') renderSkillTree(gameState);
        if (tabName === 'expedition') updateExpeditionUI(gameState);
        if (tabName === 'quests') renderQuests(gameState);
        if (tabName === 'garden') renderGarden(gameState); 
        if (tabName === 'profile') renderProfile(gameState); // NEW
    }
}