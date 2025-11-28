/* =========================================
   SAKURA CHRONICLES - UTILITIES
   Helper Functions & Effects
   ========================================= */

// ===========================
// FORMATTING
// ===========================

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

function getElementEmoji(element) {
    const emojis = {
        'Fire': '🔥',
        'Water': '💧',
        'Wind': '🌪️',
        'Light': '✨',
        'Dark': '🌑'
    };
    return emojis[element] || '❓';
}

// ===========================
// NOTIFICATIONS (TOASTS)
// ===========================

function showNotification(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // Create Toast Element
    const toast = document.createElement('div');
    toast.className = 'toast-notification animate-entry'; // Uses styles.css class
    
    // Style based on type (Icon & Border color)
    let icon = 'fa-circle-info';
    let colorClass = 'border-l-blue-500';
    
    if (type === 'success') {
        icon = 'fa-circle-check text-green-500';
        colorClass = 'border-l-green-500';
    } else if (type === 'error') {
        icon = 'fa-circle-exclamation text-red-500';
        colorClass = 'border-l-red-500';
    } else if (type === 'warning') {
        icon = 'fa-triangle-exclamation text-amber-500';
        colorClass = 'border-l-amber-500';
    } else if (type === 'special') {
        icon = 'fa-star text-yellow-400';
        colorClass = 'border-l-purple-500';
    }

    // Apply specific border color override if needed (default is primary in css)
    if (type !== 'info') {
        toast.style.borderLeftColor = type === 'success' ? '#22c55e' : 
                                      type === 'error' ? '#ef4444' : 
                                      type === 'warning' ? '#f59e0b' : '';
    }

    toast.innerHTML = `
        <i class="fa-solid ${icon} text-lg"></i>
        <div class="text-sm font-semibold text-slate-700">${message}</div>
    `;

    // Add to container
    container.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(20px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3000);
}

// ===========================
// VISUAL EFFECTS
// ===========================

function createCherryBlossomPetals() {
    const container = document.getElementById('petals-container');
    if (!container) return;
    
    const petalCount = 20; // Keep it optimized
    
    for (let i = 0; i < petalCount; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        // Randomize
        const startLeft = Math.random() * 100;
        const duration = 10 + Math.random() * 10;
        const delay = Math.random() * 10;
        const scale = 0.5 + Math.random() * 0.5;
        
        petal.style.left = `${startLeft}%`;
        petal.style.animationDuration = `${duration}s`;
        petal.style.animationDelay = `${delay}s`;
        petal.style.transform = `scale(${scale})`;
        petal.style.opacity = `${0.3 + Math.random() * 0.5}`;
        
        container.appendChild(petal);
    }
}

function playParticleEffect(element) {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create particles
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 8px;
            height: 8px;
            background: ${['#FF9EB5', '#F59E0B', '#6366F1'][Math.floor(Math.random() * 3)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(particle);
        
        // Calculate Destination
        const angle = (Math.PI * 2 * i) / 12;
        const velocity = 60 + Math.random() * 60;
        const destX = Math.cos(angle) * velocity;
        const destY = Math.sin(angle) * velocity;
        
        // Animate using Web Animations API
        const animation = particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${destX}px, ${destY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 600 + Math.random() * 200,
            easing: 'cubic-bezier(0, .9, .57, 1)',
        });
        
        animation.onfinish = () => particle.remove();
    }
}

// ===========================
// MATH & LOGIC HELPERS
// ===========================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Debounce for resize events
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// ===========================
// LOGGING
// ===========================

function initializeLogging() {
    console.log('%c🌸 Sakura Chronicles Remastered 🌸', 'color: #FF9EB5; font-weight: bold; font-size: 20px; padding: 10px;');
    console.log('%cApp initialized successfully.', 'color: #94a3b8;');
}