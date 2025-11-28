# 🌸 Sakura Chronicles - Anime Gacha RPG

A fully-featured browser-based Gacha RPG with anime aesthetics, built with pure HTML/CSS/JavaScript.

## 🎮 Features

### Core Systems
- **Auto-Battle System**: Watch your heroes fight automatically with strategic team composition
- **Gacha Summoning**: 50+ unique heroes with 5 rarity tiers (N, R, SR, SSR, UR)
- **Pity System**: Guaranteed SSR after 50 pulls without one
- **Yggdrasil Skill Tree**: 20+ permanent passive upgrades
- **Daily Quests**: Complete tasks for rewards
- **Expedition System**: Earn resources while offline
- **Equipment System**: Weapons, Armor, and Accessories
- **Awakening System**: Use duplicate heroes to increase star rating
- **Bond System**: Heroes gain stats through battle experience

### Heroes
- 55 Unique Heroes with Japanese names
- 5 Elements: Fire, Water, Wind, Light, Dark
- 5 Classes: Tank, Healer, DPS (Single), DPS (AoE), Buffer
- Element advantage system (Fire > Wind > Water > Fire)
- Unique ultimate abilities per hero

### Enemies
- 25 Different enemy types
- Progressive difficulty scaling
- Boss waves every 10 waves
- Enemy variety from slimes to legendary dragons

### Progression
- Level up heroes with Gold
- Unlock skill tree nodes with Spirit Orbs
- Complete daily quests for Petals
- Team of 5 heroes with strategic positioning
- Endless wave-based combat

## 🚀 Setup Instructions

### For GitHub Pages

1. Create a new repository on GitHub
2. Upload all these files to the repository
3. Go to Settings > Pages
4. Select "Deploy from branch" and choose your main branch
5. Your game will be live at `https://yourusername.github.io/repository-name/`

### For Local Testing

1. Download all files to a folder
2. Open `index.html` in a modern web browser
3. That's it! No build process required.

## 📁 File Structure

```
sakura-chronicles/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── data.js             # Hero and enemy databases
├── classes.js          # Game state, Hero, and Enemy classes
├── storage.js          # LocalStorage management
├── gacha.js            # Summoning system
├── battle.js           # Combat system
├── skillTree.js        # Yggdrasil skill tree
├── ui.js               # UI rendering and management
├── utils.js            # Helper functions
└── main.js             # Game initialization
```

## 🎨 Image Support

The game is designed to work with character images stored in:
- `/images/{hero_id}.jpg` for heroes
- `/images/enemies/{enemy_id}.jpg` for enemies

**Fallback System**: If images are not available, the game automatically generates beautiful CSS-based placeholder cards with:
- Character initials
- Element-based gradient backgrounds
- Proper rarity borders

This means the game is **fully playable immediately** even without any image assets!

## 🎯 Getting Started

1. **Initial Resources**: 
   - 100 Gold
   - 150 Petals (enough for one 10-pull)
   - 3 Starter heroes

2. **First Steps**:
   - Build your team in the Battle tab
   - Start battles to earn Gold
   - Complete daily quests for Petals
   - Use Petals to summon new heroes

3. **Progression Tips**:
   - Balance your team with Tanks, Healers, and DPS
   - Use element advantage in battles
   - Level up heroes regularly
   - Invest in the Yggdrasil skill tree early
   - Complete daily quests every day

## ⌨️ Keyboard Shortcuts

- `1-6`: Switch between tabs
- `Ctrl+S`: Manual save
- `ESC`: Close modal windows

## 🛠️ Debug Commands

Open browser console and type:

```javascript
// View available commands
debug.help()

// Add currencies
debug.addGold(1000)
debug.addPetals(500)
debug.addOrbs(100)

// Testing commands
debug.unlockAllHeroes()
debug.maxLevel()
debug.skipWaves(10)

// Utility commands
sakura.help()
sakura.save()
sakura.export()
```

## 💾 Save System

- **Auto-save**: Every 30 seconds
- **Manual save**: Use `Ctrl+S` or close the browser
- **Export/Import**: Save files can be exported and shared
- **LocalStorage**: All progress is saved in your browser

## 🎨 Customization

### Changing Colors
Edit `styles.css` variables at the top:
```css
:root {
    --sakura-pink: #FFB7C5;
    --soft-gold: #FFD700;
    /* ... more colors */
}
```

### Adding Heroes
Edit `data.js` and add new entries to `HEROES_DATABASE`:
```javascript
{ id: 'h056', name: 'YourHero', rarity: 'SSR', element: 'Fire', ... }
```

### Modifying Balance
- Hero stats: `data.js` (baseStats)
- Enemy scaling: `classes.js` (Enemy constructor)
- Gacha rates: `data.js` (GACHA_RATES)
- Skill tree costs: `classes.js` (initializeSkillTree)

## 🌟 Features Breakdown

### Battle System
- Turn-based auto-battler
- Speed-based turn order
- Critical hits (15% chance)
- Dodge mechanics (10% chance)
- Element advantage multipliers
- Ultimate abilities with mana system
- Manual ultimate activation available
- Detailed battle log

### Gacha System
- Single and 10-pull options
- Animated summoning shrine
- Pity counter display
- Duplicate protection (converts to shards)
- Rarity-based light beam colors
- NEW/Duplicate indicators

### Skill Tree
- 20 unique passive upgrades
- Multiple levels per node
- Percentage-based bonuses
- Element-specific boosts
- Class-specific boosts
- Resource gain multipliers

### UI/UX
- Fully responsive design
- Mobile-friendly interface
- Glassmorphism effects
- Cherry blossom petal animations
- Smooth transitions and animations
- Particle effects on special events
- Toast notifications
- Modal dialogs

## 📊 Stats Tracking

The game tracks:
- Total battles fought
- Total summons performed
- Total gold earned
- Play time
- Highest wave reached
- Enemies defeated

## 🐛 Known Limitations

- Images must be manually added to work (fallback placeholders provided)
- Browser localStorage has size limits (~5-10MB depending on browser)
- No multiplayer features (single-player experience)
- Auto-battle only (no manual combat control)

## 🔄 Updates & Maintenance

To update the game:
1. Modify the relevant `.js` files
2. Test locally
3. Commit and push to GitHub
4. GitHub Pages will auto-deploy

## 📝 License

This is a showcase project. Feel free to use, modify, and distribute as needed.

## 🎮 Gameplay Tips

1. **Team Composition**: Always include at least 1 healer and 1 tank
2. **Element Synergy**: Match elements against enemy weaknesses
3. **Resource Management**: Save Petals for 10-pulls (better value)
4. **Daily Routine**: Complete quests > Claim expedition > Battle > Summon
5. **Long-term**: Invest in skill tree before hero levels
6. **Awakening**: Focus on awakening your best SSR/UR heroes first
7. **Equipment**: Boss waves have higher equipment drop rates

## 🌸 Enjoy the Game!

Built with love for anime and gaming enthusiasts. May the gacha gods bless your pulls! 🎲✨
