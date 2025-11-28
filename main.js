/* =========================================
   SAKURA CHRONICLES - MAIN CONTROLLER
   App Initialization & Navigation Logic
   ========================================= */

let gameState = null;

// Navigation Configuration
const APP_NAVIGATION = [
    { id: 'battle', label: 'Battle', icon: 'fa-solid fa-khanda', color: 'text-red-500' },
    { id: 'garden', label: 'Garden', icon: 'fa-solid fa-leaf', color: 'text-green-500' },
    { id: 'forge', label: 'Forge', icon: 'fa-solid fa-hammer', color: 'text-indigo-500' },
    { id: 'roster', label: 'Heroes', icon: 'fa-solid fa-users', color: 'text-blue-500' },
    { id: 'gacha', label: 'Summon', icon: 'fa-solid fa-gem', color: 'text-pink-500' },
    { id: 'skill-tree', label: 'Yggdrasil', icon: 'fa-solid fa-tree', color: 'text-emerald-600' },
    { id: 'expedition', label: 'Expedition', icon: 'fa-solid fa-map-location-dot', color: 'text-amber-600' },
    { id: 'quests', label: 'Quests', icon: 'fa-solid fa-scroll', color: 'text-yellow-600' },
    { id: 'settings', label: 'Settings', icon: 'fa-solid fa-gear', color: 'text-slate-400' }
];

// ===========================
// INITIALIZATION
// ===========================

function initializeGame() {
    initializeLogging();
    createCherryBlossomPetals();
    
    // Load or Create State
    const savedGame = loadGame();
    if (savedGame) {
        gameState = savedGame;
        showToast('Welcome back to Sakura Chronicles!', 'success');
    } else {
        gameState = new GameState();
        showToast('Welcome, Traveler! Starting new journey...', 'info');
        setTimeout(() => showWelcomeMessage(), 1000);
    }
    
    // CRITICAL: Expose state to window for other modules (storage.js, forge.js)
    window.gameState = gameState;
    
    // Setup App Shell
    renderNavigation();
    setupEventListeners();
    
    // Initialize UI Wrapper
    updateUI(gameState);
    
    // Start Loops
    startAutoSave(gameState);
    startUIUpdateLoop(gameState);
    
    // Initial Route
    switchView('battle');
    
    // Quest Check
    gameState.checkQuestReset();
}

// ===========================
// NAVIGATION SYSTEM
// ===========================

function renderNavigation() {
    const desktopNav = document.getElementById('desktop-nav');
    const mobileNav = document.getElementById('mobile-nav');
    
    if (!desktopNav || !mobileNav) return;
    
    desktopNav.innerHTML = '';
    mobileNav.innerHTML = '';
    
    APP_NAVIGATION.forEach(nav => {
        // Desktop Item
        const dItem = document.createElement('div');
        dItem.className = 'nav-item';
        dItem.dataset.target = nav.id;
        dItem.onclick = () => switchView(nav.id);
        dItem.innerHTML = `
            <i class="${nav.icon} w-6 text-center ${nav.color}"></i>
            <span>${nav.label}</span>
        `;
        desktopNav.appendChild(dItem);
        
        // Mobile Item
        if (['battle', 'garden', 'forge', 'roster', 'gacha'].includes(nav.id)) {
            const mItem = document.createElement('div');
            mItem.className = 'mobile-nav-item';
            mItem.dataset.target = nav.id;
            mItem.onclick = () => switchView(nav.id);
            mItem.innerHTML = `
                <i class="${nav.icon}"></i>
                <span>${nav.label}</span>
            `;
            mobileNav.appendChild(mItem);
        }
    });
}

function switchView(viewId) {
    // 1. Update Navigation State
    document.querySelectorAll('.nav-item, .mobile-nav-item').forEach(el => {
        if (el.dataset.target === viewId) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
    
    // 2. Hide all Views
    document.querySelectorAll('.view-content').forEach(el => {
        el.classList.add('hidden', 'opacity-0');
        el.classList.remove('active', 'animate-entry');
    });
    
    // 3. Show Target View with Animation
    const targetView = document.getElementById(`${viewId}-tab`);
    if (targetView) {
        targetView.classList.remove('hidden');
        requestAnimationFrame(() => {
            targetView.classList.remove('opacity-0');
            targetView.classList.add('active', 'animate-entry');
        });
        
        // Trigger specific render functions based on view
        refreshViewContent(viewId);
    }
    
    // Mobile: Scroll to top
    const contentArea = document.getElementById('content-area');
    if (contentArea) contentArea.scrollTop = 0;
}

function refreshViewContent(viewId) {
    if (!gameState) return;
    
    // Call render functions from their respective files
    switch(viewId) {
        case 'battle':
            if (typeof renderBattleDashboard === 'function') renderBattleDashboard(gameState);
            break;
        case 'roster':
            if (typeof renderRoster === 'function') renderRoster(gameState);
            break;
        case 'garden':
            if (typeof renderGarden === 'function') renderGarden(gameState);
            break;
        case 'gacha':
            if (typeof renderGacha === 'function') renderGacha(gameState);
            break;
        case 'forge':
            if (typeof renderForge === 'function') renderForge(gameState);
            break;
        case 'skill-tree':
            if (typeof renderSkillTree === 'function') renderSkillTree(gameState);
            break;
        case 'expedition':
            if (typeof updateExpeditionUI === 'function') updateExpeditionUI(gameState);
            break;
        case 'quests':
            if (typeof renderQuests === 'function') renderQuests(gameState);
            break;
        case 'settings':
            if (typeof renderProfile === 'function') renderProfile(gameState);
            break;
    }
}

// ===========================
// EVENT LISTENERS
// ===========================

function setupEventListeners() {
    // Mobile Menu Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.onclick = () => {
            showToast('Sidebar menu coming soon!', 'info');
        };
    }
    
    // Sidebar Profile Click
    const profileBtn = document.getElementById('sidebar-profile-btn');
    if (profileBtn) {
        profileBtn.onclick = () => switchView('settings');
    }
    
    // Save on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && gameState) saveGame(gameState);
    });
    
    // Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

// ===========================
// UTILITIES & LOOP
// ===========================

function startUIUpdateLoop(gameState) {
    setInterval(() => {
        if (gameState && typeof updateCurrencyDisplay === 'function') {
            updateCurrencyDisplay(gameState);
        }
    }, 500);
}

function showToast(message, type = 'info') {
    if (typeof showNotification === 'function') {
        showNotification(message, type);
    }
}

function closeModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) {
        modal.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }
}

// ===========================
// BOOTSTRAP
// ===========================

// Debug Commands
window.debug = {
    addGold: (amt) => { gameState.gold += amt; updateUI(gameState); },
    addPetals: (amt) => { gameState.petals += amt; updateUI(gameState); },
    
    // FIXED RESET FUNCTION
    reset: () => { 
        deleteSave(); 
        // Critical: Nullify the global state so 'beforeunload' in storage.js 
        // doesn't see it and try to save the old data back to storage!
        window.gameState = null; 
        gameState = null;
        
        location.reload(); 
    }
};

// Initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}