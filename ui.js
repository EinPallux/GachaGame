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
    
    // Update active tab content
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
        const tabId = activeTab.id;
        if (tabId === 'roster-tab') renderRoster(gameState);
        if (tabId === 'skill-tree-tab') renderSkillTree(gameState);
        if (tabId === 'expedition-tab') updateExpeditionUI(gameState);
        if (tabId === 'quests-tab') renderQuests(gameState);
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
    const highestWaveDisplay = document.getElementById('highest-wave-display');
    const enemiesDefeatedDisplay = document.getElementById('enemies-defeated-display');
    
    if (waveDisplay) waveDisplay.textContent = gameState.currentWave;
    if (highestWaveDisplay) highestWaveDisplay.textContent = gameState.highestWave;
    if (enemiesDefeatedDisplay) enemiesDefeatedDisplay.textContent = formatNumber(gameState.enemiesDefeated);
}

// ===========================
// RENDER ROSTER
// ===========================

function renderRoster(gameState) {
    const container = document.getElementById('roster-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Get filter values
    const rarityFilter = document.getElementById('roster-filter-rarity')?.value || 'all';
    const elementFilter = document.getElementById('roster-filter-element')?.value || 'all';
    const sortFilter = document.getElementById('roster-sort')?.value || 'rarity';
    
    // Filter heroes
    let heroes = [...gameState.roster];
    
    if (rarityFilter !== 'all') {
        heroes = heroes.filter(h => h.rarity === rarityFilter);
    }
    
    if (elementFilter !== 'all') {
        heroes = heroes.filter(h => h.element === elementFilter);
    }
    
    // Sort heroes
    const rarityOrder = { 'UR': 5, 'SSR': 4, 'SR': 3, 'R': 2, 'N': 1 };
    heroes.sort((a, b) => {
        if (sortFilter === 'team') {
            // Team members first
            const aInTeam = gameState.team.includes(a.id);
            const bInTeam = gameState.team.includes(b.id);
            if (aInTeam && !bInTeam) return -1;
            if (!aInTeam && bInTeam) return 1;
            // Then by team slot order
            if (aInTeam && bInTeam) {
                return gameState.team.indexOf(a.id) - gameState.team.indexOf(b.id);
            }
            // Then by rarity
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
        } else if (sortFilter === 'level') {
            return b.level - a.level;
        } else {
            // Default: rarity then level
            if (rarityOrder[b.rarity] !== rarityOrder[a.rarity]) {
                return rarityOrder[b.rarity] - rarityOrder[a.rarity];
            }
            return b.level - a.level;
        }
    });
    
    // Render cards
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
    
    // Check if hero is in team
    const isInTeam = gameState.team.includes(hero.id);
    if (isInTeam) {
        card.classList.add('in-team');
    }
    
    // Image
    const img = document.createElement('img');
    img.className = 'hero-card-image';
    img.src = `/images/${hero.id}.jpg`;
    img.alt = hero.name;
    
    // Fallback placeholder
    img.onerror = function() {
        const placeholder = createHeroPlaceholder(hero);
        img.replaceWith(placeholder);
    };
    
    card.appendChild(img);
    
    // In Team Badge
    if (isInTeam) {
        const teamBadge = document.createElement('div');
        teamBadge.className = 'in-team-badge';
        const teamSlot = gameState.team.indexOf(hero.id) + 1;
        teamBadge.innerHTML = `<span class="team-badge-icon">⭐</span><span>Team Slot ${teamSlot}</span>`;
        card.appendChild(teamBadge);
    }
    
    // Level badge
    const levelBadge = document.createElement('div');
    levelBadge.className = 'hero-card-level';
    levelBadge.textContent = `Lv.${hero.level}`;
    card.appendChild(levelBadge);
    
    // Rarity badge
    const rarityBadge = document.createElement('div');
    rarityBadge.className = `hero-card-rarity badge-${hero.rarity}`;
    rarityBadge.textContent = hero.rarity;
    card.appendChild(rarityBadge);
    
    // Info section
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
    
    // Stars
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
    
    // Click to view details
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
    
    // Hero image
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
    
    // Name and rarity
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
    
    // Stars
    const starsDiv = document.createElement('div');
    starsDiv.className = 'mb-4';
    for (let i = 0; i < hero.stars; i++) {
        starsDiv.innerHTML += '⭐';
    }
    starsDiv.innerHTML += ` <span class="text-slate-600">(${hero.stars}/5 Stars)</span>`;
    detailContainer.appendChild(starsDiv);
    
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
        <div class="bg-pink-50 p-3 rounded-lg">
            <div class="text-sm text-slate-600">SPD</div>
            <div class="text-xl font-bold">${hero.spd}</div>
        </div>
        <div class="bg-pink-50 p-3 rounded-lg">
            <div class="text-sm text-slate-600">Bond</div>
            <div class="text-xl font-bold">${hero.bond}/1000</div>
        </div>
    `;
    detailContainer.appendChild(stats);
    
    // Ultimate
    const ultimate = document.createElement('div');
    ultimate.className = 'bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4';
    ultimate.innerHTML = `
        <div class="font-semibold text-purple-900 mb-2">✨ ${hero.ultimate.name}</div>
        <div class="text-sm text-slate-700">${hero.ultimate.desc}</div>
    `;
    detailContainer.appendChild(ultimate);
    
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
        const maxStars = document.createElement('div');
        maxStars.className = 'text-center text-amber-600 font-semibold mt-2';
        maxStars.textContent = '★ MAX STARS ★';
        awakening.appendChild(maxStars);
    }
    
    detailContainer.appendChild(awakening);
    
    // Level up
    const levelUp = document.createElement('div');
    levelUp.className = 'space-y-2';
    
    const upgradeCost = hero.getUpgradeCost();
    const levelUpBtn = document.createElement('button');
    levelUpBtn.className = 'btn btn-primary w-full';
    levelUpBtn.innerHTML = `Level Up (${upgradeCost} Gold)`;
    levelUpBtn.disabled = gameState.gold < upgradeCost;
    
    levelUpBtn.onclick = () => {
        if (gameState.gold >= upgradeCost) {
            gameState.gold -= upgradeCost;
            hero.levelUp(upgradeCost);
            showNotification(`${hero.name} leveled up to ${hero.level}!`, 'success');
            showHeroDetails(hero, gameState);
            updateCurrencyDisplay(gameState);
            gameState.updateQuest('levelUp', 1);
            saveGame(gameState);
        }
    };
    
    levelUp.appendChild(levelUpBtn);
    detailContainer.appendChild(levelUp);
    
    // Add to team button
    const addToTeamBtn = document.createElement('button');
    addToTeamBtn.className = 'btn btn-secondary w-full mt-2';
    addToTeamBtn.textContent = 'Add to Team';
    addToTeamBtn.onclick = () => {
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
    // Find empty slot or ask user to replace
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
    
    if (heroId) {
        const hero = gameState.roster.find(h => h.id === heroId);
        
        if (hero) {
            slot.classList.add('filled');
            
            // Image
            const img = document.createElement('img');
            img.className = 'team-slot-image';
            img.src = `/images/${hero.id}.jpg`;
            img.onerror = function() {
                const placeholder = createHeroPlaceholder(hero);
                placeholder.className = 'team-slot-placeholder';
                img.replaceWith(placeholder);
            };
            slot.appendChild(img);
            
            // Info
            const info = document.createElement('div');
            info.className = 'team-slot-info';
            
            const name = document.createElement('div');
            name.className = 'team-slot-name';
            name.textContent = hero.name;
            
            const level = document.createElement('div');
            level.className = 'team-slot-level';
            level.textContent = `Lv.${hero.level} • ${getElementEmoji(hero.element)}`;
            
            info.appendChild(name);
            info.appendChild(level);
            slot.appendChild(info);
            
            // Remove button
            const removeBtn = document.createElement('button');
            removeBtn.className = 'text-red-500 hover:text-red-700';
            removeBtn.innerHTML = '✕';
            removeBtn.onclick = (e) => {
                e.stopPropagation();
                gameState.setTeamMember(index, null);
                renderTeamSelection(gameState);
                saveGame(gameState);
            };
            slot.appendChild(removeBtn);
        }
    } else {
        // Empty slot
        const placeholder = document.createElement('div');
        placeholder.className = 'team-slot-placeholder bg-slate-200';
        placeholder.textContent = '+';
        placeholder.style.fontSize = '2rem';
        slot.appendChild(placeholder);
        
        const info = document.createElement('div');
        info.className = 'team-slot-info';
        
        const name = document.createElement('div');
        name.className = 'team-slot-name text-slate-500';
        name.textContent = 'Empty Slot';
        
        info.appendChild(name);
        slot.appendChild(info);
    }
    
    // Click to select hero
    slot.onclick = () => {
        showHeroSelectionModal(index, gameState);
    };
    
    return slot;
}

// ===========================
// SHOW HERO SELECTION MODAL
// ===========================

function showHeroSelectionModal(slotIndex, gameState) {
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
        miniCard.style.border = '2px solid transparent';
        
        // Check if already in team
        if (gameState.team.includes(hero.id)) {
            miniCard.style.opacity = '0.5';
        }
        
        const img = document.createElement('img');
        img.className = 'hero-card-image';
        img.src = `/images/${hero.id}.jpg`;
        img.onerror = function() {
            const placeholder = createHeroPlaceholder(hero);
            img.replaceWith(placeholder);
        };
        miniCard.appendChild(img);
        
        const name = document.createElement('div');
        name.className = 'hero-card-name text-xs p-2';
        name.textContent = hero.name;
        miniCard.appendChild(name);
        
        miniCard.onclick = () => {
            gameState.setTeamMember(slotIndex, hero.id);
            renderTeamSelection(gameState);
            modal.classList.remove('active');
            showNotification(`${hero.name} added to team!`, 'success');
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
        const questCard = createQuestCard(quest, gameState);
        container.appendChild(questCard);
    });
}

// ===========================
// CREATE QUEST CARD
// ===========================

function createQuestCard(quest, gameState) {
    const card = document.createElement('div');
    card.className = `quest-card ${quest.completed ? 'completed' : ''}`;
    
    // Title and progress
    const header = document.createElement('div');
    header.className = 'flex justify-between items-center mb-2';
    
    const title = document.createElement('div');
    title.className = 'font-semibold';
    title.textContent = quest.desc;
    
    const progress = document.createElement('div');
    progress.className = 'text-sm text-slate-600';
    progress.textContent = `${quest.current} / ${quest.target}`;
    
    header.appendChild(title);
    header.appendChild(progress);
    card.appendChild(header);
    
    // Progress bar
    const progressBar = document.createElement('div');
    progressBar.className = 'quest-progress-bar';
    
    const progressFill = document.createElement('div');
    progressFill.className = 'quest-progress-fill';
    progressFill.style.width = `${(quest.current / quest.target) * 100}%`;
    
    progressBar.appendChild(progressFill);
    card.appendChild(progressBar);
    
    // Rewards
    const rewards = document.createElement('div');
    rewards.className = 'text-sm text-slate-700 mt-2';
    let rewardText = 'Rewards: ';
    if (quest.reward.gold) rewardText += `${quest.reward.gold} Gold `;
    if (quest.reward.petals) rewardText += `${quest.reward.petals} Petals `;
    if (quest.reward.spiritOrbs) rewardText += `${quest.reward.spiritOrbs} Orbs `;
    rewards.textContent = rewardText;
    card.appendChild(rewards);
    
    // Claim button
    if (quest.completed && !quest.claimed) {
        const claimBtn = document.createElement('button');
        claimBtn.className = 'btn btn-primary w-full mt-3';
        claimBtn.textContent = 'Claim Rewards';
        claimBtn.onclick = () => {
            const reward = gameState.claimQuest(quest.id);
            if (reward) {
                showNotification('✨ Quest rewards claimed!', 'success');
                renderQuests(gameState);
                updateCurrencyDisplay(gameState);
                saveGame(gameState);
            }
        };
        card.appendChild(claimBtn);
    } else if (quest.claimed) {
        const claimedText = document.createElement('div');
        claimedText.className = 'text-center text-green-600 font-semibold mt-2';
        claimedText.textContent = '✓ Claimed';
        card.appendChild(claimedText);
    }
    
    return card;
}

// ===========================
// UPDATE EXPEDITION UI
// ===========================

function updateExpeditionUI(gameState) {
    const statusContainer = document.getElementById('expedition-status');
    const claimBtn = document.getElementById('claim-expedition-btn');
    const rewardsContainer = document.getElementById('expedition-rewards');
    
    if (!statusContainer || !claimBtn) return;
    
    const rewards = gameState.calculateExpeditionRewards();
    
    if (rewards && rewards.gold > 0) {
        statusContainer.innerHTML = `
            <div class="mb-2">Your heroes have been on an expedition for <strong>${rewards.hours}</strong> hours.</div>
            <div class="text-sm">
                Accumulated Rewards:<br>
                💰 ${rewards.gold} Gold<br>
                🌸 ${rewards.petals} Petals
            </div>
        `;
        claimBtn.disabled = false;
    } else {
        statusContainer.innerHTML = `
            <div>Your heroes are currently on an expedition!</div>
            <div class="text-sm text-slate-600 mt-2">Come back later to claim rewards.</div>
        `;
        claimBtn.disabled = true;
    }
    
    claimBtn.onclick = () => {
        const claimed = gameState.claimExpeditionRewards();
        if (claimed) {
            showNotification(`✨ Claimed ${claimed.gold} Gold and ${claimed.petals} Petals!`, 'success');
            updateExpeditionUI(gameState);
            updateCurrencyDisplay(gameState);
            saveGame(gameState);
        }
    };
}

// ===========================
// SETUP FILTER LISTENERS
// ===========================

function setupFilterListeners(gameState) {
    const rarityFilter = document.getElementById('roster-filter-rarity');
    const elementFilter = document.getElementById('roster-filter-element');
    const sortFilter = document.getElementById('roster-sort');
    
    if (rarityFilter) {
        rarityFilter.onchange = () => renderRoster(gameState);
    }
    
    if (elementFilter) {
        elementFilter.onchange = () => renderRoster(gameState);
    }
    
    if (sortFilter) {
        sortFilter.onchange = () => renderRoster(gameState);
    }
}

// ===========================
// SETUP MODAL LISTENERS
// ===========================

function setupModalListeners() {
    const modal = document.getElementById('hero-modal');
    const closeBtn = modal?.querySelector('.modal-close');
    
    if (closeBtn) {
        closeBtn.onclick = () => modal.classList.remove('active');
    }
    
    if (modal) {
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        };
    }
}

// ===========================
// SETUP TAB LISTENERS
// ===========================

function setupTabListeners(gameState) {
    const tabs = document.querySelectorAll('.nav-tab');
    
    tabs.forEach(tab => {
        tab.onclick = () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName, gameState);
        };
    });
}

// ===========================
// SWITCH TAB
// ===========================

function switchTab(tabName, gameState = null) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });
    
    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    const activeContent = document.getElementById(`${tabName}-tab`);
    if (activeContent) {
        activeContent.classList.add('active');
        
        // Load content based on tab
        if (gameState) {
            if (tabName === 'roster') renderRoster(gameState);
            if (tabName === 'skill-tree') renderSkillTree(gameState);
            if (tabName === 'expedition') updateExpeditionUI(gameState);
            if (tabName === 'quests') renderQuests(gameState);
        }
    }
}
