/* ===========================
   SAKURA CHRONICLES - STORAGE
   LocalStorage Management
   =========================== */

const STORAGE_KEY = 'sakuraChronicles_saveData';
const AUTO_SAVE_INTERVAL = 30000; // Auto-save every 30 seconds

// ===========================
// SAVE GAME
// ===========================

function saveGame(gameState) {
    try {
        const saveData = {
            version: '1.0',
            timestamp: Date.now(),
            state: gameState.toJSON()
        };
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
        console.log('Game saved successfully!');
        return true;
    } catch (error) {
        console.error('Failed to save game:', error);
        return false;
    }
}

// ===========================
// LOAD GAME
// ===========================

function loadGame() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (!savedData) {
            console.log('No save data found. Starting new game.');
            return null;
        }
        
        const saveData = JSON.parse(savedData);
        const gameState = GameState.fromJSON(saveData.state);
        
        console.log('Game loaded successfully!');
        return gameState;
    } catch (error) {
        console.error('Failed to load game:', error);
        return null;
    }
}

// ===========================
// DELETE SAVE
// ===========================

function deleteSave() {
    try {
        localStorage.removeItem(STORAGE_KEY);
        console.log('Save data deleted.');
        return true;
    } catch (error) {
        console.error('Failed to delete save:', error);
        return false;
    }
}

// ===========================
// CHECK IF SAVE EXISTS
// ===========================

function saveExists() {
    return localStorage.getItem(STORAGE_KEY) !== null;
}

// ===========================
// GET SAVE INFO
// ===========================

function getSaveInfo() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (!savedData) {
            return null;
        }
        
        const saveData = JSON.parse(savedData);
        
        return {
            version: saveData.version,
            timestamp: saveData.timestamp,
            lastPlayed: new Date(saveData.timestamp).toLocaleString(),
            heroCount: saveData.state.roster?.length || 0,
            highestWave: saveData.state.highestWave || 0,
            gold: saveData.state.gold || 0,
            petals: saveData.state.petals || 0
        };
    } catch (error) {
        console.error('Failed to get save info:', error);
        return null;
    }
}

// ===========================
// AUTO-SAVE SYSTEM
// ===========================

let autoSaveInterval = null;

function startAutoSave(gameState) {
    // Clear any existing interval
    stopAutoSave();
    
    // Start new auto-save interval
    autoSaveInterval = setInterval(() => {
        saveGame(gameState);
    }, AUTO_SAVE_INTERVAL);
    
    console.log('Auto-save enabled (every 30 seconds)');
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
        console.log('Auto-save disabled');
    }
}

// ===========================
// EXPORT/IMPORT SAVE
// ===========================

function exportSave() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (!savedData) {
            console.log('No save data to export.');
            return null;
        }
        
        // Create a downloadable file
        const blob = new Blob([savedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sakura_chronicles_save_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('Save exported successfully!');
        return true;
    } catch (error) {
        console.error('Failed to export save:', error);
        return false;
    }
}

function importSave(fileContent) {
    try {
        // Validate JSON
        const saveData = JSON.parse(fileContent);
        
        if (!saveData.version || !saveData.state) {
            throw new Error('Invalid save file format');
        }
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, fileContent);
        console.log('Save imported successfully!');
        return true;
    } catch (error) {
        console.error('Failed to import save:', error);
        return false;
    }
}

// ===========================
// SAVE BEFORE UNLOAD
// ===========================

function setupAutoSaveBeforeUnload(gameState) {
    window.addEventListener('beforeunload', (event) => {
        saveGame(gameState);
    });
}
