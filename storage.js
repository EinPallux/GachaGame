/* =========================================
   SAKURA CHRONICLES - STORAGE MANAGER
   Save/Load & Persistence Logic
   ========================================= */

const STORAGE_KEY = 'sakuraChronicles_saveData_v1'; // Updated key for new version
const AUTO_SAVE_INTERVAL = 30000; // 30 Seconds

// ===========================
// CORE SAVE/LOAD
// ===========================

function saveGame(gameState, silent = true) {
    try {
        if (!gameState) return false;

        const saveData = {
            version: '1.2', // Matches our new "Forge" update versioning
            timestamp: Date.now(),
            state: gameState.toJSON()
        };
        
        const json = JSON.stringify(saveData);
        localStorage.setItem(STORAGE_KEY, json);
        
        if (!silent) {
            // Use the utility function if available, otherwise console
            if (typeof showNotification === 'function') {
                showNotification('Game Saved Successfully', 'success');
            } else {
                console.log('Game saved.');
            }
        }
        return true;
    } catch (error) {
        console.error('Save failed:', error);
        if (typeof showNotification === 'function') {
            showNotification('Failed to save game! Storage might be full.', 'error');
        }
        return false;
    }
}

function loadGame() {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        
        if (!json) {
            console.log('No save data found. New game.');
            return null;
        }
        
        const saveData = JSON.parse(json);
        
        // Version Migration Logic could go here
        // For now, we just load the state
        
        if (!saveData.state) return null;
        
        const gameState = GameState.fromJSON(saveData.state);
        console.log(`Game loaded (v${saveData.version})`);
        return gameState;

    } catch (error) {
        console.error('Load failed:', error);
        if (typeof showNotification === 'function') {
            showNotification('Corrupted save file detected.', 'error');
        }
        return null;
    }
}

function deleteSave() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Save deleted.');
        if (typeof showNotification === 'function') {
            showNotification('Save data deleted.', 'warning');
        }
        return true;
    } catch (e) {
        return false;
    }
}

function saveExists() {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

// ===========================
// AUTO-SAVE SYSTEM
// ===========================

let autoSaveIntervalId = null;

function startAutoSave(gameState) {
    stopAutoSave();
    
    console.log('Auto-save enabled.');
    autoSaveIntervalId = setInterval(() => {
        saveGame(gameState, true); // Silent save
    }, AUTO_SAVE_INTERVAL);
}

function stopAutoSave() {
    if (autoSaveIntervalId) {
        clearInterval(autoSaveIntervalId);
        autoSaveIntervalId = null;
    }
}

// ===========================
// EXPORT / IMPORT
// ===========================

function exportSave() {
    try {
        const json = localStorage.getItem(STORAGE_KEY);
        if (!json) {
            showNotification('No save data to export.', 'warning');
            return;
        }

        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sakura_chronicles_save_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Save file downloaded!', 'success');
    } catch (error) {
        console.error('Export failed:', error);
        showNotification('Failed to export save.', 'error');
    }
}

function importSave(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            const parsed = JSON.parse(content);
            
            // Basic validation
            if (!parsed.version || !parsed.state) {
                throw new Error('Invalid save format');
            }

            localStorage.setItem(STORAGE_KEY, content);
            showNotification('Save imported! Reloading...', 'success');
            
            setTimeout(() => {
                location.reload();
            }, 1000);
            
        } catch (error) {
            console.error('Import failed:', error);
            showNotification('Invalid save file!', 'error');
        }
    };
    reader.readAsText(file);
}

// ===========================
// SAFETY
// ===========================

window.addEventListener('beforeunload', () => {
    // Attempt one final save before closing
    // Note: Async operations are unreliable here, but localStorage is sync
    if (window.gameState) {
        saveGame(window.gameState, true);
    }
});

// Expose for debug/console use
window.sakuraStorage = {
    save: saveGame,
    load: loadGame,
    clear: deleteSave,
    export: exportSave
};