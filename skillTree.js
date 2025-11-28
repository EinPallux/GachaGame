/* ===========================
   SAKURA CHRONICLES - SKILL TREE
   Yggdrasil System
   =========================== */

// ===========================
// RENDER SKILL TREE
// ===========================

function renderSkillTree(gameState) {
    const container = document.getElementById('skill-tree-grid');
    if (!container) return;
    
    container.innerHTML = '';
    
    gameState.skillTree.forEach(node => {
        const nodeElement = createSkillNode(node, gameState);
        container.appendChild(nodeElement);
    });
}

// ===========================
// CREATE SKILL NODE
// ===========================

function createSkillNode(node, gameState) {
    const nodeDiv = document.createElement('div');
    nodeDiv.className = 'skill-node';
    
    // Determine node state
    if (node.level >= node.maxLevel) {
        nodeDiv.classList.add('maxed');
    } else if (node.level > 0) {
        nodeDiv.classList.add('unlocked');
    }
    
    // Icon
    const icon = document.createElement('div');
    icon.className = 'skill-node-icon';
    icon.textContent = node.icon;
    nodeDiv.appendChild(icon);
    
    // Name
    const name = document.createElement('div');
    name.className = 'skill-node-name';
    name.textContent = node.name;
    nodeDiv.appendChild(name);
    
    // Description
    const desc = document.createElement('div');
    desc.className = 'skill-node-desc';
    desc.textContent = node.desc;
    nodeDiv.appendChild(desc);
    
    // Level display
    const level = document.createElement('div');
    level.className = 'skill-node-level';
    
    if (node.level >= node.maxLevel) {
        level.innerHTML = '<span class="text-amber-500">★ MAX ★</span>';
    } else {
        level.textContent = `Level: ${node.level} / ${node.maxLevel}`;
    }
    
    nodeDiv.appendChild(level);
    
    // Current bonus display
    if (node.level > 0) {
        const currentBonus = document.createElement('div');
        currentBonus.className = 'text-center text-sm font-semibold text-green-600 mt-2';
        currentBonus.textContent = `+${node.value * node.level}%`;
        nodeDiv.appendChild(currentBonus);
    }
    
    // Cost display
    if (node.level < node.maxLevel) {
        const cost = document.createElement('div');
        cost.className = 'skill-node-cost';
        const upgradeCost = node.cost * (node.level + 1);
        cost.innerHTML = `<span class="text-lg">🔮</span> ${upgradeCost} Orbs`;
        nodeDiv.appendChild(cost);
        
        // Check if can afford
        if (gameState.spiritOrbs < upgradeCost) {
            nodeDiv.style.opacity = '0.6';
        }
    }
    
    // Click handler
    if (node.level < node.maxLevel) {
        nodeDiv.onclick = () => {
            handleSkillNodeClick(node, gameState);
        };
    }
    
    return nodeDiv;
}

// ===========================
// HANDLE SKILL NODE CLICK
// ===========================

function handleSkillNodeClick(node, gameState) {
    if (node.level >= node.maxLevel) {
        showNotification('This skill is already maxed!', 'error');
        return;
    }
    
    const upgradeCost = node.cost * (node.level + 1);
    
    if (gameState.spiritOrbs < upgradeCost) {
        showNotification(`Not enough Spirit Orbs! Need ${upgradeCost} Orbs.`, 'error');
        return;
    }
    
    // Confirm upgrade
    const confirmed = confirm(
        `Upgrade ${node.name} to Level ${node.level + 1}?\n\n` +
        `Cost: ${upgradeCost} Spirit Orbs\n` +
        `Effect: ${node.desc}\n` +
        `New Bonus: +${node.value * (node.level + 1)}%`
    );
    
    if (!confirmed) return;
    
    // Upgrade
    const success = gameState.upgradeSkillNode(node.id);
    
    if (success) {
        showNotification(`✨ ${node.name} upgraded to Level ${node.level}!`, 'success');
        
        // Recalculate all hero stats
        gameState.roster.forEach(hero => {
            hero.calculateStats(gameState.getSkillTreeBonuses());
        });
        
        // Re-render skill tree and update UI
        renderSkillTree(gameState);
        updateCurrencyDisplay(gameState);
        saveGame(gameState);
        
        // Visual effect
        playParticleEffect(event.target);
    } else {
        showNotification('Failed to upgrade skill!', 'error');
    }
}

// ===========================
// SETUP SKILL TREE LISTENERS
// ===========================

function setupSkillTreeListeners(gameState) {
    // Listeners are attached in createSkillNode
    // This function can be used for global skill tree controls if needed
}

// ===========================
// GET SKILL TREE SUMMARY
// ===========================

function getSkillTreeSummary(gameState) {
    const bonuses = gameState.getSkillTreeBonuses();
    const summary = [];
    
    // Convert bonuses to readable format
    for (const [key, value] of Object.entries(bonuses)) {
        let displayName = key;
        
        // Format the key name
        if (key === 'allStatsPercent') displayName = 'All Stats';
        else if (key === 'goldBonus') displayName = 'Gold Gain';
        else if (key === 'petalBonus') displayName = 'Petal Drops';
        else if (key === 'orbBonus') displayName = 'Orb Drops';
        else if (key === 'critChance') displayName = 'Critical Chance';
        else if (key === 'startingMana') displayName = 'Starting Mana';
        else if (key.includes('Bonus')) {
            displayName = key.replace('Bonus', '').replace(/([A-Z])/g, ' $1').trim();
            displayName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
        }
        
        summary.push({
            name: displayName,
            value: value
        });
    }
    
    return summary;
}

// ===========================
// RESET SKILL TREE (ADMIN)
// ===========================

function resetSkillTree(gameState) {
    const confirmed = confirm(
        'Are you sure you want to reset the entire skill tree?\n\n' +
        'This will refund all Spirit Orbs but reset all bonuses.'
    );
    
    if (!confirmed) return;
    
    let totalOrbs = 0;
    
    gameState.skillTree.forEach(node => {
        // Calculate total orbs spent on this node
        for (let i = 1; i <= node.level; i++) {
            totalOrbs += node.cost * i;
        }
        node.level = 0;
    });
    
    gameState.spiritOrbs += totalOrbs;
    
    // Recalculate all hero stats
    gameState.roster.forEach(hero => {
        hero.calculateStats(gameState.getSkillTreeBonuses());
    });
    
    showNotification(`✨ Skill tree reset! Refunded ${totalOrbs} Spirit Orbs.`, 'success');
    renderSkillTree(gameState);
    updateCurrencyDisplay(gameState);
    saveGame(gameState);
}
