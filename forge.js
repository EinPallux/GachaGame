/* =========================================
   SAKURA CHRONICLES - FORGE SYSTEM
   Equipment Crafting & Management
   ========================================= */

let activeForgeTab = 'craft'; // 'craft' or 'inventory'

// ===========================
// RENDER FORGE VIEW
// ===========================

function renderForge(gameState) {
    const container = document.getElementById('forge-tab');
    if (!container) return;

    // Generate Sub-Components
    const materialsHtml = generateMaterialsList(gameState);
    
    // Determine which view to show
    let mainContentHtml = '';
    if (activeForgeTab === 'craft') {
        mainContentHtml = generateRecipesGrid(gameState);
    } else {
        mainContentHtml = generateEquipmentInventory(gameState);
    }

    container.innerHTML = `
        <div class="max-w-7xl mx-auto space-y-6 animate-entry">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center text-3xl shadow-sm border border-indigo-100">
                        <i class="fa-solid fa-hammer"></i>
                    </div>
                    <div>
                        <h2 class="text-2xl font-heading font-bold text-slate-800">The Divine Forge</h2>
                        <p class="text-slate-500 text-sm max-w-lg">
                            Craft legendary gear to empower your heroes. <br>
                            <span class="text-xs text-indigo-400 font-bold"><i class="fa-solid fa-circle-info"></i> Materials drop from Battle Waves & Expeditions.</span>
                        </p>
                    </div>
                </div>
                
                <div class="flex gap-2 bg-slate-100 p-1 rounded-lg">
                    <button class="px-6 py-2 rounded-md text-sm font-bold transition-all ${activeForgeTab === 'craft' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}" 
                            onclick="switchForgeTab('craft')">
                        <i class="fa-solid fa-fire-burner mr-2"></i> Forge
                    </button>
                    <button class="px-6 py-2 rounded-md text-sm font-bold transition-all ${activeForgeTab === 'inventory' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}" 
                            onclick="switchForgeTab('inventory')">
                        <i class="fa-solid fa-box-open mr-2"></i> Inventory
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div class="lg:col-span-1">
                    <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-100 sticky top-4">
                        <h3 class="font-bold text-slate-700 mb-4 text-xs uppercase tracking-wide border-b border-slate-100 pb-2 flex justify-between items-center">
                            <span>Material Storage</span>
                            <i class="fa-solid fa-sack-dollar text-slate-300"></i>
                        </h3>
                        <div class="space-y-2 h-[calc(100vh-350px)] overflow-y-auto pr-2 custom-scrollbar">
                            ${materialsHtml}
                        </div>
                    </div>
                </div>

                <div class="lg:col-span-3">
                    ${mainContentHtml}
                </div>
            </div>
        </div>
    `;
}

function switchForgeTab(tab) {
    activeForgeTab = tab;
    renderForge(window.gameState);
}

// ===========================
// RENDER HELPERS
// ===========================

function generateMaterialsList(gameState) {
    const allMaterials = FORGE_DATABASE.materials;
    const userMats = gameState.inventory.materials || {};
    
    return allMaterials.map(mat => {
        const count = userMats[mat.id] || 0;
        const hasSome = count > 0;
        
        return `
            <div class="flex items-center justify-between p-2.5 rounded-lg border transition-colors ${hasSome ? 'bg-slate-50 border-slate-200' : 'bg-white border-transparent opacity-50'}">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-500 text-sm shadow-sm">
                        <i class="fa-solid ${mat.icon}"></i>
                    </div>
                    <div>
                        <div class="text-xs font-bold text-slate-700 leading-tight">${mat.name}</div>
                        <div class="text-[10px] text-slate-400 leading-tight">${mat.desc}</div>
                    </div>
                </div>
                <div class="font-mono text-xs font-bold ${hasSome ? 'text-indigo-600' : 'text-slate-300'}">
                    x${formatNumber(count)}
                </div>
            </div>
        `;
    }).join('');
}

function generateRecipesGrid(gameState) {
    const recipes = FORGE_DATABASE.recipes;
    
    const gridHtml = recipes.map(recipe => {
        // Validation Logic
        let canCraft = true;
        let matReqHtml = '';
        
        if (gameState.gold < recipe.cost) canCraft = false;
        
        for (const [matId, qty] of Object.entries(recipe.materials)) {
            const matDef = FORGE_DATABASE.materials.find(m => m.id === matId);
            const owned = (gameState.inventory.materials && gameState.inventory.materials[matId]) || 0;
            
            if (owned < qty) canCraft = false;
            
            matReqHtml += `
                <div class="flex justify-between items-center text-[10px] mb-1">
                    <span class="text-slate-500 flex items-center gap-1">
                        <i class="fa-solid ${matDef.icon} text-slate-300"></i> ${matDef.name}
                    </span>
                    <span class="${owned >= qty ? 'text-green-600' : 'text-red-500'} font-bold font-mono">${owned}/${qty}</span>
                </div>
            `;
        }

        // Rarity Styling
        const rarityColors = {
            'Common': 'border-slate-200 bg-slate-50 text-slate-600',
            'Rare': 'border-blue-200 bg-blue-50 text-blue-600',
            'Epic': 'border-purple-200 bg-purple-50 text-purple-600',
            'Legendary': 'border-amber-200 bg-amber-50 text-amber-600',
            'Mythic': 'border-pink-200 bg-pink-50 text-pink-600'
        };
        const rColor = rarityColors[recipe.rarity] || rarityColors['Common'];

        // Stats Display
        let statsHtml = '';
        for (const [stat, val] of Object.entries(recipe.stats)) {
            statsHtml += `<span class="px-1.5 py-0.5 rounded bg-white/50 border border-current text-[10px] font-bold uppercase">${stat}: +${val}</span> `;
        }

        return `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col h-full relative group hover:shadow-md transition-shadow">
                
                <div class="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded border ${rColor}">
                    ${recipe.rarity}
                </div>

                <div class="flex items-center gap-3 mb-4">
                    <div class="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-2xl text-slate-400 group-hover:scale-110 transition-transform">
                        ${getItemIcon(recipe.type)}
                    </div>
                    <div>
                        <h4 class="font-bold text-slate-800 text-sm">${recipe.name}</h4>
                        <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wide">${recipe.type}</div>
                    </div>
                </div>
                
                <div class="flex flex-wrap gap-1 mb-4 ${rColor.split(' ')[2]} opacity-80">
                    ${statsHtml}
                </div>
                
                <div class="bg-slate-50 rounded-lg p-3 mb-4 flex-1 border border-slate-100">
                    <div class="text-[9px] font-bold text-slate-400 uppercase mb-2">Required Materials</div>
                    ${matReqHtml}
                </div>
                
                <div class="mt-auto">
                    <div class="flex justify-between items-center text-xs mb-2 px-1">
                        <span class="text-slate-400">Cost</span>
                        <span class="${gameState.gold >= recipe.cost ? 'text-yellow-600' : 'text-red-500'} font-bold">
                            <i class="fa-solid fa-coins"></i> ${formatNumber(recipe.cost)}
                        </span>
                    </div>
                    <button class="btn w-full py-2 text-sm ${canCraft ? 'btn-primary' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}" 
                            onclick="${canCraft ? `craftItem('${recipe.id}')` : ''}" ${!canCraft ? 'disabled' : ''}>
                        Craft Item
                    </button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-slate-700">Available Recipes</h3>
            <span class="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                Gold: <span class="text-yellow-600 font-bold">${formatNumber(gameState.gold)}</span>
            </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            ${gridHtml}
        </div>
    `;
}

function generateEquipmentInventory(gameState) {
    const equipment = gameState.inventory.equipment || [];
    
    if (equipment.length === 0) {
        return `
            <div class="flex flex-col items-center justify-center h-96 text-slate-300 border-2 border-dashed border-slate-200 rounded-2xl">
                <i class="fa-solid fa-box-open text-6xl mb-4"></i>
                <p class="text-lg font-bold">Inventory is Empty</p>
                <p class="text-sm">Go to the Forge tab to craft your first item!</p>
            </div>
        `;
    }

    const gridHtml = equipment.map(item => {
        // Rarity Styling
        const rarityColors = {
            'Common': 'border-slate-300 text-slate-600',
            'Rare': 'border-blue-300 text-blue-600',
            'Epic': 'border-purple-300 text-purple-600',
            'Legendary': 'border-amber-300 text-amber-600',
            'Mythic': 'border-pink-300 text-pink-600'
        };
        const rStyle = rarityColors[item.rarity] || rarityColors['Common'];

        // Stats
        let statsHtml = '';
        for (const [stat, val] of Object.entries(item.stats)) {
            statsHtml += `<div class="flex justify-between w-full text-xs"><span class="uppercase text-slate-400 font-bold">${stat}</span> <span class="font-bold text-slate-700">+${val}</span></div>`;
        }

        return `
            <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 relative group hover:-translate-y-1 transition-transform">
                <div class="absolute top-0 right-0 left-0 h-1 rounded-t-xl ${rStyle.replace('text-', 'bg-').split(' ')[1]}"></div>
                
                <div class="flex justify-between items-start mb-2 mt-2">
                    <div class="w-10 h-10 rounded bg-slate-50 border border-slate-100 flex items-center justify-center text-xl text-slate-500">
                        ${getItemIcon(item.type)}
                    </div>
                    <div class="text-[10px] font-bold px-2 py-0.5 rounded border ${rStyle}">
                        ${item.rarity}
                    </div>
                </div>

                <h4 class="font-bold text-slate-800 text-sm mb-1">${item.name}</h4>
                <div class="text-[10px] text-slate-400 uppercase font-bold tracking-wide mb-3 border-b border-slate-50 pb-2">${item.type}</div>
                
                <div class="space-y-1 bg-slate-50 p-2 rounded mb-3">
                    ${statsHtml}
                </div>

                <div class="text-[10px] text-center text-slate-400 italic">
                    Equip this in the Hero Menu
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-slate-700">Your Equipment</h3>
            <span class="text-xs text-slate-400">${equipment.length} Items</span>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            ${gridHtml}
        </div>
    `;
}

function getItemIcon(type) {
    const icons = {
        'weapon': '<i class="fa-solid fa-khanda"></i>',
        'artifact': '<i class="fa-solid fa-scroll"></i>',
        'ring': '<i class="fa-solid fa-ring"></i>',
        'cloak': '<i class="fa-solid fa-user-shield"></i>'
    };
    return icons[type] || '<i class="fa-solid fa-cube"></i>';
}


// ===========================
// ACTIONS
// ===========================

window.craftItem = function(recipeId) {
    const gameState = window.gameState;
    const recipe = FORGE_DATABASE.recipes.find(r => r.id === recipeId);
    
    if (!recipe) return;
    
    // Check Costs Again
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
    
    // Create New Item Instance
    // We clone the recipe stats but create a unique instance object
    const newItem = {
        id: recipe.id, // Base ID
        name: recipe.name,
        type: recipe.type,
        rarity: recipe.rarity,
        stats: { ...recipe.stats },
        craftedAt: Date.now()
    };
    
    gameState.addEquipment(newItem);
    
    // Success Feedback
    showToast(`Crafted ${recipe.name}!`, 'success');
    gameState.updateQuest('craft', 1);
    
    // Visual FX
    if(typeof playParticleEffect === 'function') {
        playParticleEffect(event.target);
    }
    
    // Save & Refresh
    saveGame(gameState);
    updateUI(gameState); // Updates gold display
    renderForge(gameState); // Re-renders grid with updated counts
};