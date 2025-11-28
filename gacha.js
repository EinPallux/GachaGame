/* =========================================
   SAKURA CHRONICLES - GACHA SYSTEM
   Summoning Logic & Animation
   ========================================= */

// ===========================
// RENDER GACHA VIEW
// ===========================

function renderGacha(gameState) {
    const container = document.getElementById('gacha-tab');
    if (!container) return;

    // Calculate Pity Progress
    const pityPercent = (gameState.pityCounter / 50) * 100;

    container.innerHTML = `
        <div class="max-w-4xl mx-auto animate-entry">
            <div class="relative h-64 rounded-2xl overflow-hidden shadow-lg mb-8 group">
                <div class="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                <div class="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('/images/h041.jpg')] bg-cover bg-center"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                <div class="absolute bottom-6 left-8 text-white z-10">
                    <div class="text-xs font-bold uppercase tracking-widest text-pink-200 mb-1">Standard Banner</div>
                    <h2 class="text-4xl font-heading font-bold mb-2">Legends of Sakura</h2>
                    <p class="text-sm text-pink-100 max-w-md">
                        Summon powerful heroes to aid you in your journey. 
                        Guaranteed <span class="text-amber-400 font-bold">SSR</span> every 50 pulls!
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div class="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div class="flex justify-between items-end mb-2">
                        <span class="text-sm font-bold text-slate-500 uppercase">Pity Counter</span>
                        <span class="text-2xl font-bold text-pink-500">${50 - gameState.pityCounter} <span class="text-sm text-slate-400">left</span></span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                        <div class="bg-gradient-to-r from-pink-400 to-pink-600 h-full transition-all duration-500" style="width: ${pityPercent}%"></div>
                    </div>
                    <div class="mt-3 text-xs text-slate-400 text-center">
                        Rate Up: UR (0.5%) • SSR (4.5%) • SR (10%)
                    </div>
                </div>

                <button class="bg-white p-6 rounded-xl border-2 border-slate-100 shadow-sm hover:border-pink-300 hover:shadow-md transition-all group relative overflow-hidden" onclick="handleGachaPull(1)">
                    <div class="relative z-10 flex flex-col items-center">
                        <span class="text-3xl mb-2">🌸</span>
                        <span class="font-bold text-slate-700 text-lg group-hover:text-pink-600">Summon x1</span>
                        <span class="text-sm text-slate-400 bg-slate-100 px-3 py-1 rounded-full mt-2 group-hover:bg-pink-50 group-hover:text-pink-600">10 Petals</span>
                    </div>
                </button>

                <button class="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border-2 border-amber-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group relative overflow-hidden" onclick="handleGachaPull(10)">
                    <div class="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-orange-200/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="relative z-10 flex flex-col items-center">
                        <div class="flex mb-2 text-2xl">
                            <span>🌸</span><span>🌸</span><span>🌸</span>
                        </div>
                        <span class="font-bold text-amber-700 text-lg">Summon x10</span>
                        <span class="text-sm text-amber-600/80 bg-amber-100/50 px-3 py-1 rounded-full mt-2 font-bold">100 Petals</span>
                    </div>
                </button>
            </div>
        </div>
    `;
}

// ===========================
// PULL LOGIC
// ===========================

function handleGachaPull(count) {
    const cost = count * 10;
    
    if (gameState.petals < cost) {
        showToast(`Not enough Petals! Need ${cost} 🌸`, 'error');
        return;
    }

    // Deduct Cost
    gameState.petals -= cost;
    updateCurrencyDisplay(gameState);

    // Perform Pulls
    const results = performPullLogic(count);
    
    // Save Game
    saveGame(gameState);

    // Trigger Animation & Reveal
    playSummonAnimation(results);
}

function performPullLogic(count) {
    const results = [];
    
    for (let i = 0; i < count; i++) {
        let rarity;
        
        // Pity Check
        if (gameState.pityCounter >= 50) {
            rarity = Math.random() < 0.5 ? 'SSR' : 'UR'; // 50/50 SSR or UR on pity
            gameState.pityCounter = 0;
        } else {
            rarity = rollRarity();
            if (rarity === 'SSR' || rarity === 'UR') gameState.pityCounter = 0;
            else gameState.pityCounter++;
        }

        // Get Hero
        const heroTemplate = getRandomHeroByRarity(rarity);
        if (heroTemplate) {
            const addResult = gameState.addHero(heroTemplate.id);
            results.push({
                hero: addResult.hero,
                isNew: !addResult.isDuplicate,
                shards: addResult.shards,
                rarity: rarity
            });
        }
        
        gameState.totalPulls++;
        gameState.stats.totalPulls++;
    }
    
    gameState.updateQuest('summon', count);
    return results;
}

function rollRarity() {
    const roll = Math.random() * 100;
    let cumulative = 0;
    const rates = { 'UR': 0.5, 'SSR': 4.5, 'SR': 10.0, 'R': 25.0, 'N': 60.0 }; // Total 100
    
    for (let [rarity, rate] of Object.entries(rates)) {
        cumulative += rate;
        if (roll <= cumulative) return rarity;
    }
    return 'N';
}

function getRandomHeroByRarity(rarity) {
    const pool = HEROES_DATABASE.filter(h => h.rarity === rarity);
    if (pool.length === 0) return HEROES_DATABASE[0]; // Fallback
    return pool[Math.floor(Math.random() * pool.length)];
}

// ===========================
// ANIMATION & DISPLAY
// ===========================

function playSummonAnimation(results) {
    const modal = document.getElementById('modal-overlay');
    const modalBody = document.getElementById('modal-body');
    const modalContent = document.getElementById('modal-content');
    
    if (!modal || !modalBody) return;

    // Determine highest rarity for light color
    const highestRarity = results.some(r => r.rarity === 'UR') ? 'UR' : 
                          results.some(r => r.rarity === 'SSR') ? 'SSR' : 'N';
    
    const beamColor = highestRarity === 'UR' ? 'from-pink-500 via-purple-500 to-indigo-500' :
                      highestRarity === 'SSR' ? 'from-amber-400 via-orange-500 to-yellow-300' :
                      'from-blue-400 to-cyan-300';

    // 1. Play Animation
    modalBody.innerHTML = `
        <div class="h-[500px] flex items-center justify-center bg-slate-900 relative overflow-hidden">
            <div class="absolute inset-0 bg-[url('/images/summon-bg.jpg')] bg-cover opacity-20"></div>
            
            <div class="gacha-shrine z-10">
                <div class="shrine-door border-4 border-white/20 bg-slate-800 w-32 h-48 relative flex items-center justify-center overflow-hidden shadow-2xl">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <i class="fa-solid fa-torii-gate text-6xl text-white/30"></i>
                    
                    <div class="absolute inset-0 bg-gradient-to-t ${beamColor} opacity-0 animate-[lightBeam_2s_ease-out_forwards]"></div>
                </div>
            </div>
            
            <div class="absolute bottom-10 text-white font-bold tracking-[0.5em] text-sm animate-pulse">SUMMONING...</div>
        </div>
    `;

    // Show Modal
    modal.classList.remove('hidden');
    modalContent.classList.remove('scale-95'); // Reset scale if needed
    requestAnimationFrame(() => modal.classList.remove('opacity-0', 'pointer-events-none'));

    // 2. Show Results after delay
    setTimeout(() => {
        showGachaResults(results);
    }, 2200);
}

function showGachaResults(results) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = ''; // Clear existing content

    // Main Container
    const container = document.createElement('div');
    container.className = 'bg-slate-50 p-6 text-center';

    // Title
    const title = document.createElement('h3');
    title.className = 'text-2xl font-heading font-bold text-slate-800 mb-6';
    title.textContent = 'Summoning Results';
    container.appendChild(title);

    // Grid
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-5 gap-4 mb-8';

    results.forEach((r, index) => {
        // Wrapper for animation
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center animate-entry';
        wrapper.style.animationDelay = `${index * 0.1}s`;

        // Card Container
        const card = document.createElement('div');
        card.className = 'hero-card w-full aspect-[3/4] mb-2 relative group rounded-xl overflow-hidden shadow-sm bg-white';
        card.setAttribute('data-rarity', r.rarity);

        // Image Container with Error Handling
        const imgContainer = document.createElement('div');
        imgContainer.className = 'absolute inset-0';
        
        const img = document.createElement('img');
        img.src = `/images/${r.hero.id}.jpg`;
        img.className = 'w-full h-full object-cover transition-transform duration-500 group-hover:scale-110';
        
        // Define Placeholder logic locally to avoid dependency race conditions
        img.onerror = () => {
            const div = document.createElement('div');
            const colors = {
                'Fire': 'from-red-400 to-orange-500', 'Water': 'from-blue-400 to-cyan-500',
                'Wind': 'from-emerald-400 to-teal-500', 'Light': 'from-yellow-300 to-amber-500',
                'Dark': 'from-purple-500 to-indigo-600'
            };
            const gradient = colors[r.hero.element] || 'from-slate-400 to-slate-600';
            div.className = `w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-4xl font-heading font-bold opacity-90`;
            div.textContent = r.hero.name.substring(0, 2).toUpperCase();
            img.replaceWith(div);
        };
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);

        // "NEW" Badge
        if (r.isNew) {
            const badge = document.createElement('div');
            badge.className = 'absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm animate-bounce';
            badge.textContent = 'NEW!';
            card.appendChild(badge);
        }

        // Info Overlay
        const overlay = document.createElement('div');
        overlay.className = 'absolute bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent p-2';
        overlay.innerHTML = `
            <div class="text-white text-xs font-bold truncate">${r.hero.name}</div>
            <div class="text-white/80 text-[10px]">${r.hero.class}</div>
        `;
        card.appendChild(overlay);

        wrapper.appendChild(card);

        // Shards Label
        if (!r.isNew) {
            const shards = document.createElement('div');
            shards.className = 'text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100';
            shards.textContent = `+${r.shards} Shards`;
            wrapper.appendChild(shards);
        }

        grid.appendChild(wrapper);
    });

    container.appendChild(grid);

    // Continue Button
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary w-full md:w-auto px-8';
    btn.textContent = 'Continue';
    btn.onclick = () => {
        closeModal();
        renderGacha(gameState);
        updateUI(gameState);
    };
    container.appendChild(btn);

    modalBody.appendChild(container);

    // Refresh Roster if needed
    if (!document.getElementById('roster-tab').classList.contains('hidden')) {
        renderRoster(gameState);
    }
}