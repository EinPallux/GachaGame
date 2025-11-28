/* ===========================
   SAKURA CHRONICLES - GARDEN
   Planting & Harvesting System
   =========================== */

let selectedSeedId = null;
let gardenInterval = null;

// ===========================
// RENDER GARDEN TAB
// ===========================

function renderGarden(gameState) {
    renderPlots(gameState);
    renderSeedInventory(gameState);
    renderTeaInventory(gameState);
    
    // Setup unlock button
    const buyBtn = document.getElementById('buy-plot-btn');
    if (buyBtn) {
        // Find next locked plot
        const nextLocked = gameState.garden.plots.find(p => !p.unlocked);
        
        if (nextLocked) {
            buyBtn.textContent = `Unlock Plot ${nextLocked.id + 1} (5000 Gold)`;
            buyBtn.onclick = () => unlockNextPlot(gameState);
            
            if (gameState.gold < 5000) {
                buyBtn.disabled = true;
                buyBtn.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                buyBtn.disabled = false;
                buyBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        } else {
            buyBtn.textContent = 'All Plots Unlocked';
            buyBtn.disabled = true;
        }
    }
    
    // Start growth checker if not running
    if (!gardenInterval) {
        gardenInterval = setInterval(() => {
            const changed = gameState.garden.checkGrowth();
            if (changed) {
                renderPlots(gameState);
                showNotification('✨ A plant is ready to harvest!', 'success');
            } else {
                // Update progress bars visually without full re-render
                updateGrowthBars(gameState);
            }
        }, 1000);
    }
}

// ===========================
// RENDER PLOTS
// ===========================

function renderPlots(gameState) {
    const container = document.getElementById('garden-plots');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.garden.plots.forEach(plot => {
        const plotEl = document.createElement('div');
        plotEl.className = 'garden-plot';
        
        if (!plot.unlocked) {
            plotEl.classList.add('locked');
            plotEl.innerHTML = `
                <div class="text-4xl mb-2">🔒</div>
                <div class="text-sm font-semibold text-slate-500">Locked</div>
            `;
            plotEl.onclick = () => showNotification('Unlock this plot for 5000 Gold!', 'info');
        } else if (plot.plant) {
            // Planted
            plotEl.classList.add('planted');
            
            const seedData = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === plot.plant.seedId);
            const isReady = plot.plant.ready;
            
            if (isReady) {
                plotEl.classList.add('ready');
                plotEl.innerHTML = `
                    <div class="plant-emoji animate-bounce">${seedData.emoji}</div>
                    <div class="text-sm font-bold text-green-700">Ready!</div>
                    <div class="text-xs text-green-600">Click to Harvest</div>
                `;
                plotEl.onclick = () => harvestPlot(plot.id, gameState);
            } else {
                // Growing
                const now = Date.now();
                const elapsed = now - plot.plant.plantedAt;
                const progress = Math.min(100, (elapsed / plot.plant.growthTime) * 100);
                const timeLeft = Math.ceil((plot.plant.growthTime - elapsed) / 1000);
                
                plotEl.innerHTML = `
                    <div class="text-2xl mb-2">🌱</div>
                    <div class="text-sm font-semibold text-slate-600">${seedData.name}</div>
                    <div class="growth-bar mt-2">
                        <div class="growth-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="text-xs text-slate-500 mt-1">${timeLeft}s left</div>
                `;
            }
        } else {
            // Empty
            plotEl.innerHTML = `
                <div class="text-4xl mb-2 opacity-30">🕳️</div>
                <div class="text-sm font-semibold text-slate-400">Empty Plot</div>
            `;
            plotEl.onclick = () => handleEmptyPlotClick(plot.id, gameState);
        }
        
        container.appendChild(plotEl);
    });
}

// ===========================
// UPDATE GROWTH BARS (Visual Only)
// ===========================

function updateGrowthBars(gameState) {
    const plots = document.querySelectorAll('.garden-plot.planted:not(.ready)');
    
    plots.forEach((plotEl, index) => {
        // Find corresponding data plot (skip locked/empty/ready)
        // This is a rough mapping, relying on render order
        const growingPlots = gameState.garden.plots.filter(p => p.unlocked && p.plant && !p.plant.ready);
        const plotData = growingPlots[index];
        
        if (plotData && plotData.plant) {
            const now = Date.now();
            const elapsed = now - plotData.plant.plantedAt;
            const progress = Math.min(100, (elapsed / plotData.plant.growthTime) * 100);
            const timeLeft = Math.max(0, Math.ceil((plotData.plant.growthTime - elapsed) / 1000));
            
            const fill = plotEl.querySelector('.growth-fill');
            const timeText = plotEl.querySelector('.text-xs'); // Last element
            
            if (fill) fill.style.width = `${progress}%`;
            if (timeText) timeText.textContent = `${timeLeft}s left`;
        }
    });
}

// ===========================
// RENDER SEED INVENTORY
// ===========================

function renderSeedInventory(gameState) {
    const container = document.getElementById('seed-inventory');
    if (!container) return;
    
    container.innerHTML = '';
    
    const seeds = gameState.inventory.seeds || {};
    const seedIds = Object.keys(seeds);
    
    if (seedIds.length === 0) {
        container.innerHTML = '<div class="col-span-4 text-center text-sm text-slate-400 py-4">No seeds found. Fight in battle to find some!</div>';
        return;
    }
    
    seedIds.forEach(id => {
        const count = seeds[id];
        const seedData = GARDEN_ITEMS_DATABASE.seeds.find(s => s.id === id);
        
        if (seedData && count > 0) {
            const item = document.createElement('div');
            item.className = `garden-item ${selectedSeedId === id ? 'selected' : ''}`;
            item.innerHTML = `
                <div class="text-2xl">${seedData.emoji}</div>
                <div class="item-count">x${count}</div>
            `;
            item.title = `${seedData.name}: ${seedData.desc}`;
            item.onclick = () => selectSeed(id, gameState);
            
            container.appendChild(item);
        }
    });
}

// ===========================
// RENDER TEA INVENTORY
// ===========================

function renderTeaInventory(gameState) {
    const container = document.getElementById('tea-inventory');
    if (!container) return;
    
    container.innerHTML = '';
    
    const teas = gameState.inventory.teas || {};
    const teaIds = Object.keys(teas);
    
    if (teaIds.length === 0) {
        container.innerHTML = '<div class="col-span-4 text-center text-sm text-slate-400 py-4">Harvest plants to brew teas!</div>';
        return;
    }
    
    teaIds.forEach(id => {
        const count = teas[id];
        const teaData = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === id);
        
        if (teaData && count > 0) {
            const item = document.createElement('div');
            item.className = 'garden-item cursor-default'; // Teas are just for show in garden
            item.innerHTML = `
                <div class="text-2xl">${teaData.emoji}</div>
                <div class="item-count">x${count}</div>
            `;
            item.title = `${teaData.name}: ${teaData.desc}`;
            
            container.appendChild(item);
        }
    });
}

// ===========================
// SELECT SEED
// ===========================

function selectSeed(id, gameState) {
    if (selectedSeedId === id) {
        selectedSeedId = null; // Deselect
    } else {
        selectedSeedId = id;
    }
    renderSeedInventory(gameState);
}

// ===========================
// HANDLE EMPTY PLOT CLICK
// ===========================

function handleEmptyPlotClick(plotId, gameState) {
    if (!selectedSeedId) {
        showNotification('Select a seed from your pouch first!', 'info');
        return;
    }
    
    // Attempt plant
    if (gameState.garden.plantSeed(plotId, selectedSeedId)) {
        // Remove 1 seed
        gameState.removeItem('seeds', selectedSeedId, 1);
        
        // If out of seeds, deselect
        if (gameState.getItemCount('seeds', selectedSeedId) <= 0) {
            selectedSeedId = null;
        }
        
        // Visual effects and save
        playParticleEffect(event.target);
        showNotification('Seed planted! 🌱', 'success');
        
        renderPlots(gameState);
        renderSeedInventory(gameState);
        saveGame(gameState);
    }
}

// ===========================
// HARVEST PLOT
// ===========================

function harvestPlot(plotId, gameState) {
    const rewardId = gameState.garden.harvest(plotId);
    
    if (rewardId) {
        const teaData = GARDEN_ITEMS_DATABASE.teas.find(t => t.id === rewardId);
        
        // Add reward to inventory
        gameState.addItem('teas', rewardId, 1);
        
        // Visuals
        playParticleEffect(event.target);
        showNotification(`Harvested 1x ${teaData.name} ${teaData.emoji}!`, 'success');
        
        renderPlots(gameState);
        renderTeaInventory(gameState);
        saveGame(gameState);
    }
}

// ===========================
// UNLOCK NEXT PLOT
// ===========================

function unlockNextPlot(gameState) {
    const nextLocked = gameState.garden.plots.find(p => !p.unlocked);
    
    if (!nextLocked) return;
    
    if (gameState.gold >= 5000) {
        gameState.gold -= 5000;
        gameState.garden.unlockPlot(nextLocked.id);
        
        showNotification('New plot unlocked!', 'success');
        updateCurrencyDisplay(gameState);
        renderGarden(gameState); // Re-renders buttons and plots
        saveGame(gameState);
    } else {
        showNotification('Not enough Gold!', 'error');
    }
}

// ===========================
// STOP GARDEN INTERVAL
// ===========================

function stopGardenTicker() {
    if (gardenInterval) {
        clearInterval(gardenInterval);
        gardenInterval = null;
    }
}