/* ===========================
   SAKURA CHRONICLES - UTILS
   Utility Functions
   =========================== */

// ===========================
// FORMAT NUMBER
// ===========================

function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// ===========================
// GET ELEMENT EMOJI
// ===========================

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
// CREATE HERO PLACEHOLDER
// ===========================

function createHeroPlaceholder(hero) {
    const placeholder = document.createElement('div');
    placeholder.className = 'hero-card-placeholder';
    
    // Get color based on element
    const colors = {
        'Fire': 'linear-gradient(135deg, #ef4444, #dc2626)',
        'Water': 'linear-gradient(135deg, #3b82f6, #2563eb)',
        'Wind': 'linear-gradient(135deg, #10b981, #059669)',
        'Light': 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        'Dark': 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    };
    
    placeholder.style.background = colors[hero.element] || 'linear-gradient(135deg, #64748b, #475569)';
    
    // Get initials
    const initials = hero.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    placeholder.textContent = initials;
    
    return placeholder;
}

// ===========================
// CREATE ENEMY PLACEHOLDER
// ===========================

function createEnemyPlaceholder(enemy) {
    const placeholder = document.createElement('div');
    placeholder.className = 'battle-card-placeholder';
    
    // Get color based on element
    const colors = {
        'Fire': 'linear-gradient(135deg, #ef4444, #dc2626)',
        'Water': 'linear-gradient(135deg, #3b82f6, #2563eb)',
        'Wind': 'linear-gradient(135deg, #10b981, #059669)',
        'Light': 'linear-gradient(135deg, #fbbf24, #f59e0b)',
        'Dark': 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
    };
    
    placeholder.style.background = colors[enemy.element] || 'linear-gradient(135deg, #64748b, #475569)';
    
    // Get emoji based on enemy type
    let emoji = '👹';
    if (enemy.name.includes('Slime')) emoji = '🟢';
    else if (enemy.name.includes('Dragon')) emoji = '🐉';
    else if (enemy.name.includes('Demon')) emoji = '😈';
    else if (enemy.name.includes('Oni')) emoji = '👺';
    else if (enemy.name.includes('Golem')) emoji = '🗿';
    else if (enemy.name.includes('Eagle') || enemy.name.includes('Bat')) emoji = '🦅';
    else if (enemy.name.includes('Knight') || enemy.name.includes('Samurai')) emoji = '⚔️';
    else if (enemy.name.includes('Wraith') || enemy.name.includes('Shadow')) emoji = '👻';
    else if (enemy.name.includes('Fairy')) emoji = '🧚';
    else if (enemy.name.includes('Angel') || enemy.name.includes('Seraph')) emoji = '👼';
    else if (enemy.name.includes('Kraken') || enemy.name.includes('Leviathan') || enemy.name.includes('Hydra')) emoji = '🐙';
    else if (enemy.name.includes('Phoenix')) emoji = '🔥';
    else if (enemy.name.includes('Titan')) emoji = '⚡';
    
    placeholder.textContent = emoji;
    placeholder.style.fontSize = '3rem';
    
    return placeholder;
}

// ===========================
// SHOW NOTIFICATION
// ===========================

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Style based on type
    const styles = {
        'success': 'background: linear-gradient(135deg, #10b981, #059669); color: white;',
        'error': 'background: linear-gradient(135deg, #ef4444, #dc2626); color: white;',
        'info': 'background: linear-gradient(135deg, #3b82f6, #2563eb); color: white;',
        'warning': 'background: linear-gradient(135deg, #f59e0b, #d97706); color: white;'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        ${styles[type] || styles['info']}
    `;
    
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animations to document
if (!document.getElementById('notification-animations')) {
    const style = document.createElement('style');
    style.id = 'notification-animations';
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ===========================
// PLAY PARTICLE EFFECT
// ===========================

function playParticleEffect(element) {
    if (!element) return;
    
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Create 12 particles
    for (let i = 0; i < 12; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random angle
        const angle = (Math.PI * 2 * i) / 12;
        const distance = 50 + Math.random() * 50;
        
        const endX = centerX + Math.cos(angle) * distance;
        const endY = centerY + Math.sin(angle) * distance;
        
        particle.style.cssText = `
            position: fixed;
            left: ${centerX}px;
            top: ${centerY}px;
            width: 8px;
            height: 8px;
            background: ${['#FFB7C5', '#FFD700', '#FF69B4', '#FFA500'][Math.floor(Math.random() * 4)]};
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
        `;
        
        document.body.appendChild(particle);
        
        // Animate
        particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${endX - centerX}px, ${endY - centerY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 800,
            easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
        });
        
        // Remove after animation
        setTimeout(() => {
            document.body.removeChild(particle);
        }, 800);
    }
}

// ===========================
// CREATE CHERRY BLOSSOM PETALS
// ===========================

function createCherryBlossomPetals() {
    const container = document.getElementById('petals-container');
    if (!container) return;
    
    // Create 30 petals
    for (let i = 0; i < 30; i++) {
        const petal = document.createElement('div');
        petal.className = 'petal';
        
        // Random position and animation
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.animationDuration = `${8 + Math.random() * 8}s`;
        petal.style.animationDelay = `${Math.random() * 5}s`;
        petal.style.opacity = `${0.4 + Math.random() * 0.4}`;
        
        container.appendChild(petal);
    }
}

// ===========================
// RANDOM INT
// ===========================

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ===========================
// RANDOM CHOICE
// ===========================

function randomChoice(array) {
    return array[Math.floor(Math.random() * array.length)];
}

// ===========================
// SHUFFLE ARRAY
// ===========================

function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// ===========================
// CLAMP NUMBER
// ===========================

function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

// ===========================
// LERP (Linear Interpolation)
// ===========================

function lerp(start, end, t) {
    return start + (end - start) * t;
}

// ===========================
// GET TIME DIFFERENCE
// ===========================

function getTimeDifference(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return `${seconds} second${seconds > 1 ? 's' : ''} ago`;
}

// ===========================
// COPY TO CLIPBOARD
// ===========================

function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('Copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy to clipboard', 'error');
        });
    } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            showNotification('Copied to clipboard!', 'success');
        } catch (err) {
            showNotification('Failed to copy to clipboard', 'error');
        }
        document.body.removeChild(textarea);
    }
}

// ===========================
// DEBOUNCE FUNCTION
// ===========================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ===========================
// THROTTLE FUNCTION
// ===========================

function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ===========================
// CALCULATE PERCENTAGE
// ===========================

function calculatePercentage(value, total) {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
}

// ===========================
// GET RARITY COLOR
// ===========================

function getRarityColor(rarity) {
    const colors = {
        'N': '#10b981',
        'R': '#3b82f6',
        'SR': '#a855f7',
        'SSR': '#f59e0b',
        'UR': '#ec4899'
    };
    return colors[rarity] || '#64748b';
}

// ===========================
// GENERATE UNIQUE ID
// ===========================

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ===========================
// VALIDATE EMAIL
// ===========================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// ===========================
// SLEEP FUNCTION
// ===========================

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ===========================
// IS MOBILE DEVICE
// ===========================

function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ===========================
// GET BROWSER INFO
// ===========================

function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = "Unknown";
    
    if (ua.indexOf("Firefox") > -1) {
        browserName = "Firefox";
    } else if (ua.indexOf("Chrome") > -1) {
        browserName = "Chrome";
    } else if (ua.indexOf("Safari") > -1) {
        browserName = "Safari";
    } else if (ua.indexOf("Edge") > -1) {
        browserName = "Edge";
    } else if (ua.indexOf("Opera") > -1 || ua.indexOf("OPR") > -1) {
        browserName = "Opera";
    }
    
    return {
        name: browserName,
        userAgent: ua,
        isMobile: isMobileDevice()
    };
}

// ===========================
// LOG WITH STYLE
// ===========================

function logWithStyle(message, style = 'color: #FFB7C5; font-weight: bold; font-size: 14px;') {
    console.log(`%c${message}`, style);
}

// ===========================
// INITIALIZE LOGGING
// ===========================

function initializeLogging() {
    logWithStyle('🌸 Sakura Chronicles 🌸');
    logWithStyle('Game Version: 1.0', 'color: #64748b;');
    logWithStyle(`Browser: ${getBrowserInfo().name}`, 'color: #64748b;');
    logWithStyle(`Device: ${isMobileDevice() ? 'Mobile' : 'Desktop'}`, 'color: #64748b;');
}

// ===========================
// PRELOAD IMAGES
// ===========================

function preloadImages(imageUrls, callback) {
    let loaded = 0;
    const total = imageUrls.length;
    
    if (total === 0) {
        if (callback) callback();
        return;
    }
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.onload = img.onerror = () => {
            loaded++;
            if (loaded === total && callback) {
                callback();
            }
        };
        img.src = url;
    });
}

// ===========================
// HANDLE ERRORS GRACEFULLY
// ===========================

window.addEventListener('error', (event) => {
    console.error('Game Error:', event.error);
    // Could show user-friendly error message
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Promise Rejection:', event.reason);
    // Could show user-friendly error message
});
