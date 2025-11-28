/* =========================================
   SAKURA CHRONICLES - FORGE SYSTEM
   Equipment Crafting Logic
   ========================================= */

// ===========================
// RENDER FORGE VIEW
// ===========================

function renderForge(gameState) {
    const container = document.getElementById('forge-tab');
    if (!container) return;

    // Generate Materials HTML
    const materialsHtml = generateMaterialsList(gameState);

    container.innerHTML = `
        <div class="max-w-6xl mx-auto space-y-6 animate-entry">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-3xl shadow-sm">
                        <i class="fa-solid fa-hammer"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-heading font-bold text-slate-800">The Forge</h2>
                        <p class="text-slate-500 text-sm">Craft powerful equipment using materials found in battle.</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-1">
                    <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 sticky top-4">
                        <h3 class="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                            Materials Storage
                        </h3>
                        <div class="space-y-3" id="forge-materials-list">
                            ${materialsHtml}
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-2">
                    <h3 class="font-bold text-slate-700 mb-4 ml-1">Available Recipes</h3>
                    <div id="forge-recipes-grid" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${generateRecipesGrid(gameState)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ===========================
// RENDER HELPERS
// ===========================

function generateMaterialsList(gameState) {
    // Get all known materials from DB
    const allMaterials = FORGE_DATABASE.materials;
    
    // Check user inventory
    const userMats = gameState.inventory.materials || {};
    
    return allMaterials.map(mat => {
        const count = userMats[mat.id] || 0;
        const hasSome = count > 0;
        
        return `
            <div class="flex items-center justify-between p-2 rounded-lg ${hasSome ? 'bg-indigo-50/50' : 'bg-slate-50 opacity-60'}">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-xs">
                        <i class="fa-solid fa-cube"></i>
                    </div>
                    <div>
                        <div class="text-sm font-bold text-slate-700">${mat.name}</div>
                        <div class="text-[10px] text-slate-400">${mat.desc}</div>
                    </div>
                </div>
                <div class="font-mono font-bold ${hasSome ? 'text-indigo-600' : 'text-slate-300'}">x${count}</div>
            </div>
        `;
    }).join('');
}

function generateRecipesGrid(gameState) {
    return FORGE_DATABASE.recipes.map(recipe => {
        // Calculate if craftable
        let canCraft = true;
        let matReqHtml = '';
        
        // Check Gold
        if (gameState.gold < recipe.cost) canCraft = false;
        
        // Check Materials
        for (const [matId, qty] of Object.entries(recipe.materials)) {
            const matName = FORGE_DATABASE.materials.find(m => m.id === matId)?.name || 'Unknown';
            const owned = (gameState.inventory.materials && gameState.inventory.materials[matId]) || 0;
            
            if (owned < qty) canCraft = false;
            
            matReqHtml += `
                <div class="flex justify-between text-xs mb-1">
                    <span class="text-slate-600">${matName}</span>
                    <span class="${owned >= qty ? 'text-green-600' : 'text-red-500'} font-bold">${owned}/${qty}</span>
                </div>
            `;
        }

        // Get Result Item Info (Assuming weapon/armor databases exist or placeholders)
        // For this V1, we just use the name from the recipe
        
        return `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center text-xl shadow-sm border border-orange-100">
                            <i class="fa-solid fa-shield-halved"></i>
                        </div>
                        <div>
                            <h4 class="font-bold text-slate-800">${recipe.name}</h4>
                            <div class="text-xs text-orange-400 font-bold">Equipment</div>
                        </div>
                    </div>
                </div>
                
                <div class="bg-slate-50 rounded-lg p-3 mb-4 flex-1">
                    <div class="text-[10px] font-bold text-slate-400 uppercase mb-2">Requirements</div>
                    ${matReqHtml}
                    <div class="flex justify-between text-xs mt-2 pt-2 border-t border-slate-200">
                        <span class="text-slate-600">Gold Cost</span>
                        <span class="${gameState.gold >= recipe.cost ? 'text-yellow-600' : 'text-red-500'} font-bold">${formatNumber(recipe.cost)} G</span>
                    </div>
                </div>
                
                <button class="btn w-full ${canCraft ? 'btn-primary' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}" 
                        onclick="${canCraft ? `craftItem('${recipe.id}')` : ''}" ${!canCraft ? 'disabled' : ''}>
                    <i class="fa-solid fa-hammer"></i> Craft
                </button>
            </div>
        `;
    }).join('');
}

// ===========================
// CRAFTING LOGIC
// ===========================

window.craftItem = function(recipeId) {
    const gameState = window.gameState; // Access global state
    const recipe = FORGE_DATABASE.recipes.find(r => r.id === recipeId);
    
    if (!recipe) return;
    
    // Double Check Costs
    if (gameState.gold < recipe.cost) {
        showToast('Not enough Gold!', 'error');
        return;
    }
    
    for (const [matId, qty] of Object.entries(recipe.materials)) {
        if (gameState.getItemCount('materials', matId) < qty) {
            showToast('Missing Materials!', 'error');
            return;
        }
    }
    
    // Deduct Resources
    gameState.gold -= recipe.cost;
    for (const [matId, qty] of Object.entries(recipe.materials)) {
        gameState.removeItem('materials', matId, qty);
    }
    
    // Grant Item (Placeholder logic: We don't have a full inventory UI for equipment yet, so we just log it)
    // In a full implementation, we would add this to gameState.inventory.equipment
    showToast(`Crafted ${recipe.name}! (Equipped to inventory)`, 'success');
    
    // Play Effect
    playParticleEffect(event.target);
    
    // Save & Refresh
    saveGame(gameState);
    updateUI(gameState);
    renderForge(gameState);
};