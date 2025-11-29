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

    // Updated to max-w-6xl to match the new "Big Screen" feel of the modal
    container.innerHTML = `
        <div class="max-w-6xl mx-auto animate-entry">
            <div class="relative h-80 rounded-2xl overflow-hidden shadow-lg mb-8 group">
                <div class="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-600"></div>
                <div class="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('images/h041.jpg')] bg-cover bg-center"></div>
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                
                <div class="absolute bottom-8 left-10 text-white z-10">
                    <div class="text-sm font-bold uppercase tracking-widest text-pink-200 mb-2">Standard Banner</div>
                    <h2 class="text-5xl font-heading font-bold mb-3">Legends of Sakura</h2>
                    <p class="text-base text-pink-100 max-w-lg">
                        Summon powerful heroes to aid you in your journey. 
                        Guaranteed <span class="text-amber-400 font-bold">SSR</span> every 50 pulls!
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                <div class="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                    <div class="flex justify-between items-end mb-3">
                        <span class="text-base font-bold text-slate-500 uppercase">Pity Counter</span>
                        <span class="text-3xl font-bold text-pink-500">${50 - gameState.pityCounter} <span class="text-sm text-slate-400 font-normal">pulls left</span></span>
                    </div>
                    <div class="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
                        <div class="bg-gradient-to-r from-pink-400 to-pink-600 h-full transition-all duration-500" style="width: ${pityPercent}%"></div>
                    </div>
                    <div class="mt-4 text-sm text-slate-400 text-center font-medium">
                        Rate Up: UR (0.5%) • SSR (4.5%) • SR (10%)
                    </div>
                </div>

                <button class="bg-white p-8 rounded-2xl border-2 border-slate-100 shadow-sm hover:border-pink-300 hover:shadow-md transition-all group relative overflow-hidden" onclick="handleGachaPull(1)">
                    <div class="relative z-10 flex flex-col items-center">
                        <span class="text-4xl mb-3">🌸</span>
                        <span class="font-bold text-slate-700 text-xl group-hover:text-pink-600">Summon x1</span>
                        <span class="text-base text-slate-400 bg-slate-100 px-4 py-1.5 rounded-full mt-3 group-hover:bg-pink-50 group-hover:text-pink-600">10 Petals</span>
                    </div>
                </button>

                <button class="bg-gradient-to-br from-amber-50 to-orange-50 p-8 rounded-2xl border-2 border-amber-100 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group relative overflow-hidden" onclick="handleGachaPull(10)">
                    <div class="absolute inset-0 bg-gradient-to-r from-amber-200/20 to-orange-200/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div class="relative z-10 flex flex-col items-center">
                        <div class="flex mb-3 text-3xl gap-1">
                            <span>🌸</span><span>🌸</span><span>🌸</span>
                        </div>
                        <span class="font-bold text-amber-700 text-xl">Summon x10</span>
                        <span class="text-base text-amber-600/80 bg-amber-100/50 px-4 py-1.5 rounded-full mt-3 font-bold">100 Petals</span>
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
            rarity = Math.random() < 0.5 ? 'SSR' : 'UR';
            gameState.pityCounter = 0;
        } else {
            rarity = rollRarity();
            if (rarity === 'SSR' || rarity === 'UR') gameState.pityCounter = 0;
            else gameState.pityCounter++;
        }

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
    const rates = { 'UR': 0.5, 'SSR': 4.5, 'SR': 10.0, 'R': 25.0, 'N': 60.0 };
    
    for (let [rarity, rate] of Object.entries(rates)) {
        cumulative += rate;
        if (roll <= cumulative) return rarity;
    }
    return 'N';
}

function getRandomHeroByRarity(rarity) {
    const pool = HEROES_DATABASE.filter(h => h.rarity === rarity);
    if (pool.length === 0) return HEROES_DATABASE[0]; 
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

    // 1. Determine Visuals based on Highest Rarity
    const highestRarity = results.some(r => r.rarity === 'UR') ? 'UR' : 
                          results.some(r => r.rarity === 'SSR') ? 'SSR' : 
                          results.some(r => r.rarity === 'SR') ? 'SR' : 
                          results.some(r => r.rarity === 'R') ? 'R' : 'N';
    
    // 2. Prepare the Stage (Initial Dark State)
    // BIGGER STAGE: Height increased to 700px (from 500px)
    // BIGGER SHRINE: Dimensions roughly doubled
    modalBody.innerHTML = `
        <div class="h-[700px] flex items-center justify-center bg-slate-900 relative overflow-hidden select-none" id="gacha-stage">
            <div class="absolute inset-0 bg-[url('images/summon-bg.jpg')] bg-cover opacity-20"></div>
            <div class="absolute inset-0 bg-black/40 z-0"></div>

            <div id="gacha-particles" class="absolute inset-0 z-10 pointer-events-none"></div>

            <div id="shrine-gate" class="relative z-20 flex flex-col items-center justify-end mt-20 transition-transform duration-100">
                <div class="shrine-structure w-80 h-[28rem] border-8 border-slate-600 bg-slate-800 relative flex items-center justify-center shadow-2xl overflow-hidden rounded-t-xl">
                     <div class="absolute inset-0 opacity-30 flex flex-col items-center justify-center gap-8">
                        <div class="w-full h-2 bg-slate-500"></div>
                        <div class="w-full h-2 bg-slate-500"></div>
                        <div class="w-full h-2 bg-slate-500"></div>
                     </div>
                     <i class="fa-solid fa-torii-gate text-[10rem] text-slate-700/50"></i>
                     
                     <div id="summon-beam" class="gacha-beam beam-${highestRarity}"></div>
                </div>
                <div class="w-[28rem] h-6 bg-slate-700 rounded-full mt-[-4px] shadow-lg"></div>
            </div>

            <div id="gacha-flash" class="absolute inset-0 bg-white opacity-0 z-50 pointer-events-none"></div>
        </div>
    `;

    // Show Modal
    modal.classList.remove('hidden');
    modalContent.classList.remove('scale-95'); 
    requestAnimationFrame(() => modal.classList.remove('opacity-0', 'pointer-events-none'));
    
    // Hide Close button during animation
    const closeBtn = document.querySelector('.modal-close-btn');
    if(closeBtn) closeBtn.style.display = 'none';

    // === TIMELINE OF EVENTS ===

    // Phase 1: Charging (0s - 2.0s)
    const shrine = document.getElementById('shrine-gate');
    const particles = document.getElementById('gacha-particles');
    
    setTimeout(() => {
        if(shrine) shrine.classList.add('animate-shake-charging');
        spawnChargingParticles(particles);
    }, 500);

    // Phase 2: The Beam (2.0s - 3.5s)
    setTimeout(() => {
        const beam = document.getElementById('summon-beam');
        if(beam) {
            // Beam expand animation needs to be wider for bigger shrine
            beam.style.animation = "beam-expand-epic-large 2s ease-in forwards";
        }
    }, 2000);

    // Phase 3: The Flash (3.5s - 4.5s)
    setTimeout(() => {
        const flash = document.getElementById('gacha-flash');
        if(!flash) return;

        if (highestRarity === 'UR') flash.style.background = "linear-gradient(45deg, #ec4899, #8b5cf6, #f59e0b)";
        else if (highestRarity === 'SSR') flash.style.background = "#FEF3C7";
        else flash.style.background = "white";

        flash.style.animation = "screen-flash-white 0.8s ease-out forwards";
    }, 3500);

    // Phase 4: Reveal Results (4.2s)
    setTimeout(() => {
        showGachaResults(results);
        if(closeBtn) closeBtn.style.display = 'flex';
    }, 4200);
}

// Helper to spawn little dots rising up
function spawnChargingParticles(container) {
    if (!container) return;
    const count = 40; // Increased count
    for(let i=0; i<count; i++) {
        setTimeout(() => {
            const p = document.createElement('div');
            p.className = 'gacha-particle';
            const size = Math.random() * 8 + 4; // Bigger particles
            p.style.width = `${size}px`;
            p.style.height = `${size}px`;
            p.style.left = `${20 + Math.random() * 60}%`;
            p.style.bottom = '100px';
            container.appendChild(p);
        }, Math.random() * 1500);
    }
}

function showGachaResults(results) {
    const modalBody = document.getElementById('modal-body');
    modalBody.innerHTML = ''; 

    // Main Container - Increased padding for big screen feel
    const container = document.createElement('div');
    container.className = 'bg-slate-50 p-10 text-center min-h-[600px] flex flex-col justify-center';

    // Title
    const title = document.createElement('h3');
    title.className = 'text-4xl font-heading font-bold text-slate-800 mb-8';
    title.textContent = 'Summoning Results';
    container.appendChild(title);

    // Grid - Kept 5 cols, but gap is bigger and container is 6xl, so cards will be HUGE
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-5 gap-6 mb-10 max-w-6xl mx-auto w-full';

    results.forEach((r, index) => {
        // Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'flex flex-col items-center animate-entry';
        wrapper.style.animationDelay = `${index * 0.1}s`;

        // Card
        const card = document.createElement('div');
        // Removed fixed dimensions, let grid sizing handle the "Big" aspect
        card.className = 'hero-card w-full aspect-[3/4] mb-3 relative group rounded-2xl overflow-hidden shadow-md hover:shadow-xl bg-white border-2 border-slate-200 transition-transform duration-300 hover:-translate-y-2';
        card.setAttribute('data-rarity', r.rarity);

        // Image
        const imgContainer = document.createElement('div');
        imgContainer.className = 'absolute inset-0';
        const img = document.createElement('img');
        img.src = `images/${r.hero.id}.jpg`;
        img.className = 'hero-card-image w-full h-full object-cover transition-transform duration-700 group-hover:scale-110';
        img.onerror = () => {
            const div = document.createElement('div');
            const colors = {
                'Fire': 'from-red-400 to-orange-500', 'Water': 'from-blue-400 to-cyan-500',
                'Wind': 'from-emerald-400 to-teal-500', 'Light': 'from-yellow-300 to-amber-500',
                'Dark': 'from-purple-500 to-indigo-600'
            };
            const gradient = colors[r.hero.element] || 'from-slate-400 to-slate-600';
            div.className = `w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-5xl font-heading font-bold opacity-90`;
            div.textContent = r.hero.name.substring(0, 2).toUpperCase();
            img.replaceWith(div);
        };
        imgContainer.appendChild(img);
        card.appendChild(imgContainer);

        // Badges - Larger text for better visibility
        const topBadgeContainer = document.createElement('div');
        topBadgeContainer.className = 'absolute top-2 left-2 right-2 flex justify-between';
        
        // New Badge
        if (r.isNew) {
            const newBadge = document.createElement('span');
            newBadge.className = 'bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md animate-bounce';
            newBadge.textContent = 'NEW';
            topBadgeContainer.appendChild(newBadge);
        } else {
            const shardBadge = document.createElement('span');
            shardBadge.className = 'bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md';
            shardBadge.textContent = `+${r.shards} Shards`;
            topBadgeContainer.appendChild(shardBadge);
        }

        // Rarity Badge
        const rarityBadge = document.createElement('span');
        rarityBadge.className = `badge-${r.rarity} text-white text-xs font-bold px-2 py-1 rounded-md shadow-md ml-auto`;
        rarityBadge.textContent = r.rarity;
        topBadgeContainer.appendChild(rarityBadge);

        card.appendChild(topBadgeContainer);

        // Name Overlay - Bigger text
        const overlay = document.createElement('div');
        overlay.className = 'absolute bottom-0 w-full bg-gradient-to-t from-black/90 to-transparent p-4 pt-10';
        overlay.innerHTML = `
            <div class="text-white text-sm md:text-base font-bold truncate text-center">${r.hero.name}</div>
        `;
        card.appendChild(overlay);

        wrapper.appendChild(card);
        grid.appendChild(wrapper);
    });

    container.appendChild(grid);

    // Continue Button - Bigger
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary px-12 py-4 text-xl shadow-lg hover:scale-105 transition-transform';
    btn.textContent = 'Continue';
    btn.onclick = () => {
        closeModal();
        renderGacha(gameState);
        updateUI(gameState);
    };
    container.appendChild(btn);

    modalBody.appendChild(container);

    // Refresh Roster if in background
    if (!document.getElementById('roster-tab').classList.contains('hidden')) {
        renderRoster(gameState);
    }
}