/* ===========================
   SAKURA CHRONICLES - MAIN
   Game Initialization & Entry Point
   =========================== */

let gameState = null;

// ===========================
// INITIALIZE GAME
// ===========================

function initializeGame() {
    // Initialize logging
    initializeLogging();
    
    // Create cherry blossom petals
    createCherryBlossomPetals();
    
    // Try to load saved game
    const savedGame = loadGame();
    
    if (savedGame) {
        gameState = savedGame;
        showNotification('Welcome back! Game loaded successfully.', 'success');
    } else {
        gameState = new GameState();
        showNotification('Welcome to Sakura Chronicles!', 'success');
        
        // Show welcome message for new players
        setTimeout(() => {
            showWelcomeMessage();
        }, 1000);
    }
    
    // Setup all event listeners
    setupEventListeners();
    
    // Initial UI render
    updateUI(gameState);
    renderTeamSelection(gameState);
    
    // Start auto-save
    startAutoSave(gameState);
    setupAutoSaveBeforeUnload(gameState);
    
    // Start auto-refresh for UI values
    startUIUpdateLoop(gameState);
    
    // Quest reset check
    gameState.checkQuestReset();
    
    // Ensure Battle state is consistent
    if (gameState.isBattleActive) {
        gameState.isBattleActive = false; 
        showNotification('Game loaded. Please start your run step again.', 'info');
    }
}

// ===========================
// AUTO REFRESH LOOP
// ===========================

function startUIUpdateLoop(gameState) {
    setInterval(() => {
        if (gameState) {
            updateCurrencyDisplay(gameState);
            updateBattleStats(gameState);
        }
    }, 500); // Update every 0.5s
}

// ===========================
// SETUP EVENT LISTENERS
// ===========================

function setupEventListeners() {
    // Tab navigation
    setupTabListeners(gameState);
    
    // Modal
    setupModalListeners();
    
    // Battle system
    setupBattleListeners(gameState, () => updateUI(gameState));
    
    // Gacha system
    setupGachaListeners(gameState, () => updateUI(gameState));
    
    // Filters
    setupFilterListeners(gameState);
    
    // Skill tree
    setupSkillTreeListeners(gameState);
    
    // Profile system (NEW)
    setupProfileListeners(gameState);
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Window resize handler
    window.addEventListener('resize', debounce(() => {
        updateUI(gameState);
    }, 250));
}

// ===========================
// SETUP PROFILE LISTENERS (NEW)
// ===========================

function setupProfileListeners(gameState) {
    // Save Username
    const saveNameBtn = document.getElementById('save-username-btn');
    if (saveNameBtn) {
        saveNameBtn.onclick = () => {
            const input = document.getElementById('username-input');
            if (input && input.value.trim() !== '') {
                gameState.username = input.value.trim();
                showNotification(`Username saved as ${gameState.username}!`, 'success');
                updateUI(gameState); // Updates header
                saveGame(gameState);
            } else {
                showNotification('Please enter a valid username.', 'error');
            }
        };
    }

    // Reset Game
    const resetBtn = document.getElementById('reset-game-btn');
    if (resetBtn) {
        resetBtn.onclick = () => {
            const confirmed = confirm(
                '⚠️ DANGER ZONE ⚠️\n\n' +
                'Are you sure you want to RESET your game?\n' +
                'This will delete ALL progress, heroes, and items.\n' +
                'This action cannot be undone!'
            );
            
            if (confirmed) {
                // Double confirmation
                const doubleCheck = confirm('Really? All your progress will be lost forever.');
                if (doubleCheck) {
                    deleteSave();
                    location.reload();
                }
            }
        };
    }
}

// ===========================
// SETUP KEYBOARD SHORTCUTS
// ===========================

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // ESC to close modal
        if (e.key === 'Escape') {
            const modal = document.getElementById('hero-modal');
            if (modal && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        }
        
        // Number keys 1-8 for tab navigation
        if (e.key >= '1' && e.key <= '8' && !e.ctrlKey && !e.altKey) {
            const tabNames = ['battle', 'garden', 'roster', 'gacha', 'skill-tree', 'expedition', 'quests', 'profile'];
            const index = parseInt(e.key) - 1;
            if (index < tabNames.length) {
                switchTab(tabNames[index], gameState);
            }
        }
        
        // Ctrl+S to save manually
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveGame(gameState);
            showNotification('Game saved!', 'success');
        }
    });
}

// ===========================
// SHOW WELCOME MESSAGE
// ===========================

function showWelcomeMessage() {
    const modal = document.getElementById('hero-modal');
    const detailContainer = document.getElementById('hero-detail');
    
    if (!modal || !detailContainer) return;
    
    detailContainer.innerHTML = `
        <div class="text-center">
            <div class="text-6xl mb-4">🌸</div>
            <h2 class="text-3xl font-bold gradient-text mb-4">Welcome to Sakura Chronicles!</h2>
            <div class="text-left space-y-4 text-slate-700">
                <p>Embark on an epic journey in this anime-styled Gacha RPG with new Roguelike mechanics!</p>
                
                <div class="bg-pink-50 border border-pink-200 rounded-lg p-4">
                    <h3 class="font-semibold mb-2">⚔️ New Roguelike Battle System:</h3>
                    <ul class="text-sm space-y-1">
                        <li>• <strong>Runs:</strong> Start at Wave 1. Fight until you die!</li>
                        <li>• <strong>Progression:</strong> How far can you go in a single run?</li>
                        <li>• <strong>Rewards:</strong> Earn Gold and Seeds based on waves cleared.</li>
                    </ul>
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 class="font-semibold mb-2">🍵 Sakura Spirit Garden:</h3>
                    <ul class="text-sm space-y-1">
                        <li>• <strong>Plant:</strong> Use seeds found in battle to grow magical plants.</li>
                        <li>• <strong>Brew:</strong> Harvest plants to create powerful Teas.</li>
                        <li>• <strong>Consume:</strong> Drink Teas in battle to Heal, Restore Mana, or Executed enemies!</li>
                    </ul>
                </div>
                
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h3 class="font-semibold mb-2">💎 Core Features:</h3>
                    <ul class="text-sm space-y-1">
                        <li>• <strong>Gacha:</strong> Summon 50+ unique heroes.</li>
                        <li>• <strong>Yggdrasil:</strong> Permanent stat upgrades for your account.</li>
                        <li>• <strong>Expedition:</strong> Passive income while offline.</li>
                    </ul>
                </div>
            </div>
            
            <button class="btn btn-primary w-full mt-6" onclick="document.getElementById('hero-modal').classList.remove('active')">
                Start My Adventure! 🌸
            </button>
        </div>
    `;
    
    modal.classList.add('active');
}

// ===========================
// DEBUG COMMANDS (for testing)
// ===========================

window.debug = {
    addGold: (amount) => {
        gameState.gold += amount;
        updateUI(gameState);
        saveGame(gameState);
        showNotification(`Added ${amount} Gold`, 'success');
    },
    
    addPetals: (amount) => {
        gameState.petals += amount;
        updateUI(gameState);
        saveGame(gameState);
        showNotification(`Added ${amount} Petals`, 'success');
    },
    
    addOrbs: (amount) => {
        gameState.spiritOrbs += amount;
        updateUI(gameState);
        saveGame(gameState);
        showNotification(`Added ${amount} Spirit Orbs`, 'success');
    },

    // NEW DEBUG COMMANDS
    addSeeds: () => {
        gameState.addItem('seeds', 's001', 5);
        gameState.addItem('seeds', 's002', 5);
        gameState.addItem('seeds', 's003', 5);
        gameState.addItem('seeds', 's004', 5);
        updateUI(gameState);
        saveGame(gameState);
        showNotification('Added 5 of each Seed!', 'success');
    },

    addTeas: () => {
        gameState.addItem('teas', 't001', 5);
        gameState.addItem('teas', 't002', 5);
        gameState.addItem('teas', 't003', 5);
        gameState.addItem('teas', 't004', 5);
        updateUI(gameState);
        saveGame(gameState);
        showNotification('Added 5 of each Tea!', 'success');
    },
    
    unlockAllHeroes: () => {
        HEROES_DATABASE.forEach(heroData => {
            const existing = gameState.roster.find(h => h.id === heroData.id);
            if (!existing) {
                const hero = new Hero(heroData);
                gameState.roster.push(hero);
            }
        });
        updateUI(gameState);
        saveGame(gameState);
        showNotification('All heroes unlocked!', 'success');
    },
    
    maxLevel: () => {
        gameState.roster.forEach(hero => {
            hero.level = 100;
            hero.calculateStats(gameState.getSkillTreeBonuses());
        });
        updateUI(gameState);
        saveGame(gameState);
        showNotification('All heroes maxed!', 'success');
    },
    
    resetSave: () => {
        if (confirm('Are you sure you want to reset all progress?')) {
            deleteSave();
            location.reload();
        }
    },
    
    help: () => {
        console.log('%c🌸 Debug Commands 🌸', 'color: #FFB7C5; font-weight: bold; font-size: 16px;');
        console.log('%cdebug.addGold(amount)', 'color: #3b82f6;', '- Add gold');
        console.log('%cdebug.addPetals(amount)', 'color: #3b82f6;', '- Add petals');
        console.log('%cdebug.addOrbs(amount)', 'color: #3b82f6;', '- Add spirit orbs');
        console.log('%cdebug.addSeeds()', 'color: #10b981;', '- Add 5 of each seed');
        console.log('%cdebug.addTeas()', 'color: #10b981;', '- Add 5 of each tea');
        console.log('%cdebug.unlockAllHeroes()', 'color: #3b82f6;', '- Unlock all heroes');
        console.log('%cdebug.maxLevel()', 'color: #3b82f6;', '- Max all hero levels');
        console.log('%cdebug.resetSave()', 'color: #ef4444;', '- Reset all progress');
    }
};

// ===========================
// PERFORMANCE MONITORING
// ===========================

let lastFrameTime = performance.now();
let fps = 60;

function monitorPerformance() {
    const now = performance.now();
    const delta = now - lastFrameTime;
    lastFrameTime = now;
    
    fps = Math.round(1000 / delta);
    
    // Log performance issues
    if (fps < 30) {
        console.warn('Performance warning: FPS dropped to', fps);
    }
}

// Monitor performance every second
setInterval(monitorPerformance, 1000);

// ===========================
// GAME STATS TRACKING
// ===========================

function trackPlayTime() {
    if (gameState) {
        gameState.stats.playTime += 1;
    }
}

// Track play time every second
setInterval(trackPlayTime, 1000);

// ===========================
// EXPORT GAME STATE (for debugging)
// ===========================

window.exportGameState = function() {
    if (!gameState) return;
    
    const stateJSON = JSON.stringify(gameState.toJSON(), null, 2);
    const blob = new Blob([stateJSON], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sakura_chronicles_state_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Game state exported!', 'success');
};

// ===========================
// IMPORT GAME STATE (for debugging)
// ===========================

window.importGameState = function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const stateData = JSON.parse(event.target.result);
                gameState = GameState.fromJSON(stateData);
                updateUI(gameState);
                saveGame(gameState);
                showNotification('Game state imported!', 'success');
            } catch (error) {
                console.error('Failed to import game state:', error);
                showNotification('Failed to import game state', 'error');
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
};

// ===========================
// VISIBILITY CHANGE HANDLER
// ===========================

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        if (gameState) {
            saveGame(gameState);
        }
    } else {
        if (gameState) {
            gameState.checkQuestReset();
            updateExpeditionUI(gameState);
            updateUI(gameState);
        }
    }
});

// ===========================
// HANDLE PAGE RELOAD/CLOSE
// ===========================

window.addEventListener('beforeunload', (event) => {
    if (gameState) {
        saveGame(gameState);
    }
});

// ===========================
// CONSOLE WELCOME MESSAGE
// ===========================

console.log('%c🌸 Sakura Chronicles 🌸', 'color: #FFB7C5; font-weight: bold; font-size: 24px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);');
console.log('%cWelcome to the console!', 'color: #64748b; font-size: 14px;');
console.log('%cType debug.help() for debug commands', 'color: #3b82f6; font-size: 12px;');
console.log('');

// ===========================
// INITIALIZE ON DOM LOAD
// ===========================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}

// ===========================
// GAME VERSION INFO
// ===========================

window.GAME_VERSION = '1.1.0'; 
window.GAME_NAME = 'Sakura Chronicles';
window.GAME_DESCRIPTION = 'An anime-styled Gacha RPG with Roguelike mechanics and Garden system';

// Log game info
console.log(`%cGame: ${window.GAME_NAME} v${window.GAME_VERSION}`, 'color: #64748b;');
console.log(`%c${window.GAME_DESCRIPTION}`, 'color: #64748b;');
console.log('');

// ===========================
// ADDITIONAL UTILITY EXPORTS
// ===========================

window.sakura = {
    save: () => saveGame(gameState),
    load: () => {
        const loaded = loadGame();
        if (loaded) {
            gameState = loaded;
            updateUI(gameState);
            showNotification('Game loaded!', 'success');
        }
    },
    export: () => exportSave(),
    version: window.GAME_VERSION,
    state: () => gameState,
    help: () => {
        console.log('%c🌸 Sakura Chronicles Commands 🌸', 'color: #FFB7C5; font-weight: bold; font-size: 16px;');
        console.log('%csakura.save()', 'color: #10b981;', '- Manually save game');
        console.log('%csakura.load()', 'color: #10b981;', '- Reload saved game');
        console.log('%csakura.export()', 'color: #10b981;', '- Export save file');
        console.log('%csakura.state()', 'color: #10b981;', '- View current game state');
        console.log('%csakura.version', 'color: #10b981;', '- Show game version');
        console.log('');
        console.log('%cFor debug commands, type: debug.help()', 'color: #3b82f6;');
    }
};