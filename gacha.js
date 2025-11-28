/* ===========================
   SAKURA CHRONICLES - GACHA
   Summoning System
   =========================== */

// ===========================
// GACHA PULL LOGIC
// ===========================

function performGachaPull(gameState, count = 1) {
    const results = [];
    let guaranteedSSR = false;
    
    for (let i = 0; i < count; i++) {
        let rarity;
        
        // Check pity system (50 pulls without SSR = guaranteed SSR)
        if (gameState.pityCounter >= 50) {
            rarity = Math.random() < 0.5 ? 'SSR' : 'UR';
            gameState.pityCounter = 0;
            guaranteedSSR = true;
        } else {
            rarity = rollRarity();
            
            if (rarity === 'SSR' || rarity === 'UR') {
                gameState.pityCounter = 0;
            } else {
                gameState.pityCounter++;
            }
        }
        
        // Get random hero of that rarity
        const hero = getRandomHeroByRarity(rarity);
        
        if (hero) {
            const result = gameState.addHero(hero.id);
            results.push({
                hero: hero,
                rarity: rarity,
                isDuplicate: result.isDuplicate,
                shards: result.shards || 0
            });
        }
        
        gameState.totalPulls++;
        gameState.stats.totalPulls++;
    }
    
    // Update quest progress
    gameState.updateQuest('summon', count);
    
    return {
        results: results,
        guaranteedSSR: guaranteedSSR
    };
}

// ===========================
// RARITY ROLL
// ===========================

function rollRarity() {
    const roll = Math.random() * 100;
    let cumulative = 0;
    
    // Iterate through rates in order
    const rarities = ['UR', 'SSR', 'SR', 'R', 'N'];
    
    for (let rarity of rarities) {
        cumulative += GACHA_RATES[rarity];
        if (roll <= cumulative) {
            return rarity;
        }
    }
    
    return 'N'; // Fallback
}

// ===========================
// GET RANDOM HERO BY RARITY
// ===========================

function getRandomHeroByRarity(rarity) {
    const heroesOfRarity = HEROES_DATABASE.filter(h => h.rarity === rarity);
    
    if (heroesOfRarity.length === 0) {
        return null;
    }
    
    const randomIndex = Math.floor(Math.random() * heroesOfRarity.length);
    return heroesOfRarity[randomIndex];
}

// ===========================
// GACHA ANIMATION
// ===========================

function playGachaAnimation(results, callback) {
    const animationContainer = document.getElementById('gacha-animation');
    animationContainer.innerHTML = '';
    animationContainer.classList.remove('hidden');
    
    // Get highest rarity from results
    const highestRarity = getHighestRarity(results);
    const rarityColors = {
        'N': '#10b981',
        'R': '#3b82f6',
        'SR': '#a855f7',
        'SSR': '#f59e0b',
        'UR': 'linear-gradient(135deg, #ec4899, #8b5cf6, #3b82f6)'
    };
    
    // Create shrine animation
    const shrine = document.createElement('div');
    shrine.className = 'gacha-shrine';
    shrine.innerHTML = `
        <div class="shrine-door">
            <div class="text-white text-center pt-32 text-2xl font-bold">🌸</div>
        </div>
    `;
    
    animationContainer.appendChild(shrine);
    
    // Show light beam after 1 second
    setTimeout(() => {
        const light = document.createElement('div');
        light.className = 'gacha-light';
        
        if (highestRarity === 'UR') {
            light.style.background = 'linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(139, 92, 207, 0.8), rgba(59, 130, 246, 0.8))';
        } else {
            light.style.background = rarityColors[highestRarity];
            light.style.opacity = '0.8';
        }
        
        shrine.querySelector('.shrine-door').appendChild(light);
        
        // Show results after 2 seconds
        setTimeout(() => {
            animationContainer.classList.add('hidden');
            if (callback) callback();
        }, 2000);
    }, 1000);
}

// ===========================
// GET HIGHEST RARITY
// ===========================

function getHighestRarity(results) {
    const rarityOrder = ['UR', 'SSR', 'SR', 'R', 'N'];
    
    for (let rarity of rarityOrder) {
        if (results.some(r => r.rarity === rarity)) {
            return rarity;
        }
    }
    
    return 'N';
}

// ===========================
// DISPLAY GACHA RESULTS
// ===========================

function displayGachaResults(results) {
    const resultsContainer = document.getElementById('gacha-results');
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('hidden');
    
    // Create title
    const title = document.createElement('h3');
    title.className = 'section-title text-center mb-6';
    title.textContent = results.length === 1 ? 'Summoning Result' : 'Summoning Results';
    resultsContainer.appendChild(title);
    
    // Create grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4';
    
    results.forEach((result, index) => {
        const card = createGachaResultCard(result, index);
        grid.appendChild(card);
    });
    
    resultsContainer.appendChild(grid);
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn btn-primary w-full mt-6';
    closeBtn.textContent = 'Continue';
    closeBtn.onclick = () => {
        resultsContainer.classList.add('hidden');
    };
    resultsContainer.appendChild(closeBtn);
}

// ===========================
// CREATE GACHA RESULT CARD
// ===========================

function createGachaResultCard(result, index) {
    const card = document.createElement('div');
    card.className = `hero-card rarity-${result.rarity} gacha-result-card glass-panel`;
    card.style.animationDelay = `${index * 0.1}s`;
    
    // Hero image
    const img = document.createElement('img');
    img.className = 'hero-card-image';
    img.src = `/images/${result.hero.id}.jpg`;
    img.alt = result.hero.name;
    
    // Fallback placeholder
    img.onerror = function() {
        const placeholder = createHeroPlaceholder(result.hero);
        img.replaceWith(placeholder);
    };
    
    card.appendChild(img);
    
    // Rarity badge
    const rarityBadge = document.createElement('div');
    rarityBadge.className = `hero-card-rarity badge-${result.rarity}`;
    rarityBadge.textContent = result.rarity;
    card.appendChild(rarityBadge);
    
    // Hero info
    const info = document.createElement('div');
    info.className = 'hero-card-info';
    
    const name = document.createElement('div');
    name.className = 'hero-card-name';
    name.textContent = result.hero.name;
    
    const details = document.createElement('div');
    details.className = 'hero-card-details';
    
    const element = document.createElement('span');
    element.textContent = getElementEmoji(result.hero.element);
    
    const classSpan = document.createElement('span');
    classSpan.textContent = result.hero.class;
    
    details.appendChild(element);
    details.appendChild(classSpan);
    
    info.appendChild(name);
    info.appendChild(details);
    
    // Duplicate info
    if (result.isDuplicate) {
        const duplicateInfo = document.createElement('div');
        duplicateInfo.className = 'text-center text-xs mt-2 text-amber-600 font-semibold';
        duplicateInfo.innerHTML = `<span class="text-lg">✨</span> +${result.shards} Shards`;
        info.appendChild(duplicateInfo);
    } else {
        const newTag = document.createElement('div');
        newTag.className = 'text-center text-xs mt-2 text-green-600 font-semibold';
        newTag.innerHTML = `<span class="text-lg">🆕</span> NEW!`;
        info.appendChild(newTag);
    }
    
    card.appendChild(info);
    
    return card;
}

// ===========================
// HANDLE 1-PULL
// ===========================

function handle1Pull(gameState, updateUI) {
    const cost = 10;
    
    if (gameState.petals < cost) {
        showNotification('Not enough Petals! Need 10 Petals.', 'error');
        return;
    }
    
    gameState.petals -= cost;
    
    const pullResult = performGachaPull(gameState, 1);
    
    playGachaAnimation(pullResult.results, () => {
        displayGachaResults(pullResult.results);
        updateUI();
        saveGame(gameState);
        
        if (pullResult.guaranteedSSR) {
            showNotification('🎉 Pity SSR Activated!', 'success');
        }
        
        // Show special notification for SSR/UR
        const hasSSRorUR = pullResult.results.some(r => r.rarity === 'SSR' || r.rarity === 'UR');
        if (hasSSRorUR) {
            playParticleEffect(document.querySelector('.gacha-result-card'));
        }
    });
}

// ===========================
// HANDLE 10-PULL
// ===========================

function handle10Pull(gameState, updateUI) {
    const cost = 100;
    
    if (gameState.petals < cost) {
        showNotification('Not enough Petals! Need 100 Petals.', 'error');
        return;
    }
    
    gameState.petals -= cost;
    
    const pullResult = performGachaPull(gameState, 10);
    
    playGachaAnimation(pullResult.results, () => {
        displayGachaResults(pullResult.results);
        updateUI();
        saveGame(gameState);
        
        if (pullResult.guaranteedSSR) {
            showNotification('🎉 Pity SSR Activated!', 'success');
        }
        
        // Count rarities
        const ssrCount = pullResult.results.filter(r => r.rarity === 'SSR').length;
        const urCount = pullResult.results.filter(r => r.rarity === 'UR').length;
        
        if (urCount > 0) {
            showNotification(`✨ Amazing! ${urCount} Ultra Rare!`, 'success');
        } else if (ssrCount > 1) {
            showNotification(`🌟 Incredible! ${ssrCount} SSR!`, 'success');
        } else if (ssrCount === 1) {
            showNotification('⭐ Nice! 1 SSR!', 'success');
        }
    });
}

// ===========================
// SETUP GACHA LISTENERS
// ===========================

function setupGachaListeners(gameState, updateUI) {
    const pull1Btn = document.getElementById('pull-1-btn');
    const pull10Btn = document.getElementById('pull-10-btn');
    
    if (pull1Btn) {
        pull1Btn.onclick = () => handle1Pull(gameState, updateUI);
    }
    
    if (pull10Btn) {
        pull10Btn.onclick = () => handle10Pull(gameState, updateUI);
    }
}

// ===========================
// UPDATE PITY DISPLAY
// ===========================

function updatePityDisplay(gameState) {
    const pityCounter = document.getElementById('pity-counter');
    if (pityCounter) {
        const remaining = 50 - gameState.pityCounter;
        pityCounter.textContent = remaining;
        
        // Change color based on proximity to pity
        if (remaining <= 5) {
            pityCounter.className = 'text-3xl font-bold text-amber-500';
        } else if (remaining <= 10) {
            pityCounter.className = 'text-3xl font-bold text-yellow-500';
        } else {
            pityCounter.className = 'text-3xl font-bold gradient-text';
        }
    }
}
