/* =========================================
   SAKURA CHRONICLES - GARDEN SYSTEM
   Planting, Growing & Harvesting Logic
   ========================================= */

let selectedSeedId = null;
let gardenInterval = null;

// ===========================
// RENDER GARDEN TAB
// ===========================

function renderGarden(gameState) {
    const container = document.getElementById('garden-tab');
    if (!container) return;
    
    // Check if we need to start the growth timer loop
    if (!gardenInterval) {
        gardenInterval = setInterval(() => {
            const changed = gameState.garden.checkGrowth();
            if (changed) {
                // Full re-render if state changed (e.g. plant became ready)
                renderPlots(gameState);
                showToast('A plant is ready to harvest!', 'success');
            } else {
                // Just update visual progress bars
                updateGrowthBars(gameState);
            }
        }, 1000);
    }

    container.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6 animate-entry">
            <div class="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div>
                    <h2 class="text-2xl font-heading font-bold text-slate-800 flex items-center gap-2">
                        <i class="fa-solid fa-seedling text-green-500"></i> Spirit Garden
                    </h2>
                    <p class="text-slate-500 text-sm">Grow magical herbs to brew powerful teas for battle.</p>
                </div>
                
                <div class="mt-4 md:mt-0">
                    ${getUnlockButtonHtml(gameState)}
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="space-y-6">
                    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <h3 class="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide flex justify-between">
                            <span>Seed Pouch</span>
                            <span class="text-xs font-normal text-slate-400">Select to plant</span>
                        </h3>
                        <div id="seed-inventory" class="grid grid-cols-3 gap-2"></div>
                    </div>

                    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                        <h3 class="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wide">Brewed Teas</h3>
                        <div id="tea-inventory" class="grid grid-cols-3 gap-2"></div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
                        <div id="garden-plots" class="plot-grid"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    renderPlots(gameState);
    renderSeedInventory(gameState);
    renderTeaInventory(gameState);
}

function getUnlockButtonHtml(gameState) {
    const nextLocked = gameState.garden.plots.find(p => !p.unlocked);
    if (!nextLocked) {
        return `<button class="btn bg-slate-100 text-slate-400 cursor-default">All Plots Unlocked</button>`;
    }
    const canAfford = gameState.gold >= 5000;
    return `
        <button class="btn ${canAfford ? 'btn-primary' : 'bg-slate-200 text-slate-400'}" 
                onclick="handleUnlockPlot()" 
                ${!canAfford ? 'disabled' : ''}>
            Unlock Plot (5000 Gold)
        </button>
    `;
}

// ===========================
// RENDER PLOTS
// ===========================

function renderPlots(gameState) {
    const container = document.getElementById('garden-plots');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.garden.plots.forEach(plot => {
        const div = document.createElement('div');
        div.className = `garden-plot ${!plot.unlocked ? 'locked' : ''}`;
        
        if (!plot.unlocked) {
            div.innerHTML = `<i class="fa-solid fa-lock text-2xl text-slate-300 mb-1"></i><span class="text-xs text-slate-400 font-bold">Locked</span>`;
            div.onclick = () => showToast('Unlock this plot for 5000 Gold!', 'info');
        } 
        else if (plot.plant) {
            const seedData = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === plot.plant.seedId);
            
            if (plot.plant.ready) {
                div.className += ' bg-amber-50 border-amber-300 shadow-md transform scale-105';
                div.innerHTML = `
                    <div class="text-3xl animate-bounce mb-1">${seedData.emoji}</div>
                    <div class="text-xs font-bold text-amber-600 uppercase">Ready!</div>
                    <div class="text-[10px] text-amber-500">Click to harvest</div>
                `;
                div.onclick = () => harvestPlot(plot.id, gameState);
            } else {
                div.className += ' bg-green-50 border-green-200';
                div.innerHTML = `
                    <div class="text-2xl mb-2 opacity-80">🌱</div>
                    <div class="w-4/5 h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1">
                        <div class="growth-fill bg-green-500 h-full transition-all duration-500" style="width: 0%"></div>
                    </div>
                    <div class="text-[10px] text-slate-400 font-mono growth-timer">...</div>
                `;
            }
        } 
        else {
            div.className += ' hover:bg-slate-50 hover:border-slate-300';
            div.innerHTML = `<div class="text-3xl text-slate-200">+</div><div class="text-xs text-slate-400 font-bold">Empty</div>`;
            div.onclick = () => handlePlotClick(plot.id, gameState);
        }
        
        container.appendChild(div);
    });
    
    updateGrowthBars(gameState);
}

function updateGrowthBars(gameState) {
    const plots = document.querySelectorAll('.garden-plot');
    const now = Date.now();
    
    gameState.garden.plots.forEach((plot, index) => {
        if (plot.unlocked && plot.plant && !plot.plant.ready) {
            const el = plots[index];
            if (!el) return;
            
            const elapsed = now - plot.plant.plantedAt;
            const pct = Math.min(100, (elapsed / plot.plant.growthTime) * 100);
            const left = Math.max(0, Math.ceil((plot.plant.growthTime - elapsed) / 1000));
            
            const bar = el.querySelector('.growth-fill');
            const timer = el.querySelector('.growth-timer');
            
            if (bar) bar.style.width = `${pct}%`;
            if (timer) timer.textContent = `${left}s`;
        }
    });
}

// ===========================
// INVENTORY UI
// ===========================

function renderSeedInventory(gameState) {
    const container = document.getElementById('seed-inventory');
    if (!container) return;
    container.innerHTML = '';
    
    const seeds = gameState.inventory.seeds || {};
    const keys = Object.keys(seeds);
    
    if (keys.length === 0) {
        container.innerHTML = `<div class="col-span-3 text-center text-xs text-slate-400 py-4 italic">No seeds. Fight battles to find some!</div>`;
        return;
    }
    
    keys.forEach(id => {
        if (seeds[id] > 0) {
            const data = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === id);
            const el = document.createElement('div');
            el.className = `p-2 rounded-lg border cursor-pointer transition-all flex flex-col items-center text-center relative ${selectedSeedId === id ? 'bg-green-100 border-green-400 ring-2 ring-green-200' : 'bg-slate-50 border-slate-200 hover:border-green-300'}`;
            el.onclick = () => {
                selectedSeedId = (selectedSeedId === id) ? null : id;
                renderSeedInventory(gameState);
            };
            
            el.innerHTML = `
                <div class="text-2xl mb-1">${data.emoji}</div>
                <div class="text-[10px] font-bold text-slate-600 leading-tight">${data.name}</div>
                <div class="absolute top-0 right-0 bg-slate-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg">${seeds[id]}</div>
            `;
            container.appendChild(el);
        }
    });
}

function renderTeaInventory(gameState) {
    const container = document.getElementById('tea-inventory');
    if (!container) return;
    container.innerHTML = '';
    
    const teas = gameState.inventory.teas || {};
    const keys = Object.keys(teas);
    
    if (keys.length === 0) {
        container.innerHTML = `<div class="col-span-3 text-center text-xs text-slate-400 py-4 italic">No teas brewed yet.</div>`;
        return;
    }
    
    keys.forEach(id => {
        if (teas[id] > 0) {
            const data = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === id);
            container.innerHTML += `
                <div class="p-2 rounded-lg bg-white border border-slate-100 shadow-sm flex flex-col items-center text-center relative group">
                    <div class="text-2xl mb-1">${data.emoji}</div>
                    <div class="text-[10px] font-bold text-slate-600 leading-tight">${data.name}</div>
                    <div class="absolute top-0 right-0 bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg">${teas[id]}</div>
                    
                    <div class="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-32 bg-slate-800 text-white text-[10px] p-2 rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        ${data.desc}
                    </div>
                </div>
            `;
        }
    });
}

// ===========================
// INTERACTIONS
// ===========================

function handlePlotClick(plotId, gameState) {
    if (!selectedSeedId) {
        showToast('Select a seed from your pouch first!', 'info');
        return;
    }
    
    if (gameState.garden.plantSeed(plotId, selectedSeedId)) {
        gameState.removeItem('seeds', selectedSeedId, 1);
        
        // Auto-deselect if empty
        if (gameState.getItemCount('seeds', selectedSeedId) <= 0) {
            selectedSeedId = null;
        }
        
        showToast('Seed planted!', 'success');
        saveGame(gameState);
        renderPlots(gameState);
        renderSeedInventory(gameState);
    }
}

function harvestPlot(plotId, gameState) {
    const rewardId = gameState.garden.harvest(plotId);
    if (rewardId) {
        const tea = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === rewardId);
        gameState.addItem('teas', rewardId, 1);
        
        showToast(`Harvested ${tea.name}!`, 'success');
        saveGame(gameState);
        renderPlots(gameState);
        renderTeaInventory(gameState);
    }
}

window.handleUnlockPlot = function() {
    // Global handler for the button in the header
    const nextLocked = window.gameState.garden.plots.find(p => !p.unlocked);
    if (!nextLocked) return;
    
    if (window.gameState.gold >= 5000) {
        window.gameState.gold -= 5000;
        window.gameState.garden.unlockPlot(nextLocked.id);
        
        showToast('New plot unlocked!', 'success');
        updateUI(window.gameState);
        renderGarden(window.gameState);
        saveGame(window.gameState);
    } else {
        showToast('Not enough Gold!', 'error');
    }
};