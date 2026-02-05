# Copilot Instructions for DM Roll

This is a Foundry Virtual Tabletop (FVTT) module that provides GM-controlled ability check rolling for players.

## Project Context

- **Purpose**: Allows DMs to roll ability checks for players in a Foundry VTT game session
- **Type**: Client-side JavaScript module for Foundry VTT v10+ (verified with v13)
- **System Target**: Currently assumes dnd5e system
- **Tech Stack**: JavaScript (ES6 modules), Handlebars templates, Foundry VTT API

## Development Setup

**No build process required.** This is a plain JavaScript module.

### Module Installation
Place the module folder in your Foundry VTT `Modules` directory and enable it in world settings.

### Code Style
- Uses Prettier with 120 character print width, 2-space indentation
- Run `prettier --check .` to verify formatting
- Run `prettier --write .` to auto-format
- Configuration: `.prettierrc`

### Manual Testing
- Load Foundry VTT with the module enabled
- Check browser console for debug output (look for `dm-roll |` prefix logs)
- Test with both GM and Player accounts
- Module adds a control button in the scene controls when user is GM

## Architecture

### Module Initialization Flow
1. **`init` hook** (`scripts/module.js`):
   - Registers two settings: `enableModule` (Boolean) and `rollVisibility` (String: "self" or "public")
   - Settings are world-scoped (globally accessible)

2. **`ready` hook** (`scripts/module.js`):
   - Calls `initializeUI()` to set up the dialog system
   - Exposes `window.dmRollAbilityForPlayers(abilityId, playerIds)` for macro use

3. **UI Setup** (`scripts/ui/ui.js`):
   - Hooks into `getSceneControlButtons` to add the DM Roll button
   - Button only visible to GM users
   - Clicking button opens a dialog with ability/player selection

### Key Functions

**`window.dmRollAbilityForPlayers(abilityId, playerIds)`** (`scripts/module.js`)
- Entry point for rolling ability checks
- Parameters:
  - `abilityId` (string): Ability code like "str", "dex", "con", "int", "wis", "cha"
  - `playerIds` (array): User IDs to roll for
- Validates GM status and module enablement
- Respects `rollVisibility` setting (whispers to GM only if "self", public if "public")
- Calls `actor.rollAbilityTest()` on each player's character
- Posts notifications for success/failure

**`initializeUI()`** (`scripts/ui/ui.js`)
- Creates the dialog opener function
- Filters active players for selection list
- Renders dialog using Handlebars template: `modules/dm-roll/templates/dm-roll-dialog.hbs`
- Attaches click handler to launch the dialog

## Key Conventions

### Module ID
- Module ID is `dm-roll` (used in settings paths, console logs, template paths)
- All console logs prefixed with `${MODULE_ID} |` for easy filtering

### Dialog System
- Uses Foundry's native `Dialog` class for UI (not a custom component)
- Handlebars template for form markup
- Multiple select dropdown for players (`.val()` returns array)
- Single select dropdown for abilities

### Localization
- Strings are in `lang/en.json`
- Template uses `{{localize "KEY"}}` syntax
- Currently minimal localization; extensible to other languages

### Game Settings
- Use `game.settings.register()` in `init` hook
- Access with `game.settings.get(MODULE_ID, 'settingName')`
- Both settings use `scope: 'world'` for global persistence

### Error Handling & User Feedback
- Use `ui.notifications.warn/error/info()` for user-facing messages
- Use `console.warn/error()` for debug logging
- Validate GM status before performing actions
- Handle missing characters gracefully (skip user, log warning)

### System Assumptions
- Currently hardcoded to dnd5e system (uses `actor.rollAbilityTest()`)
- Comments note this may need abstraction for other systems
- Rolling happens through Foundry's native chat system

## File Structure
```
dm-roll/
├── .github/
│   └── copilot-instructions.md     # This file
├── .prettierrc                      # Formatter config
├── module.json                      # FVTT manifest
├── scripts/
│   ├── module.js                    # Main initialization & API
│   └── ui/
│       └── ui.js                    # Dialog & button UI
├── templates/
│   └── dm-roll-dialog.hbs           # Dialog form template
├── lang/
│   └── en.json                      # Localization strings
├── GEMINI.md                        # AI assistant instructions
└── QWEN.md                          # AI assistant instructions
```

## Module Manifest
Key entries in `module.json`:
- `esmodules`: Entry points are `scripts/module.js` and `scripts/ui/ui.js`
- `languages`: Only English (en) is configured
- `compatibility.minimum`: v10, `verified`: v13

## Common Tasks

### Adding a New Setting
1. Register in `init` hook in `scripts/module.js` using `game.settings.register()`
2. Access with `game.settings.get(MODULE_ID, 'settingName')`
3. Add UI label to `lang/en.json` for localization

### Extending Ability Checks
- Ability options are in the `abilityChoices` object in `scripts/ui/ui.js` (lines 12-19)
- Ability codes (str, dex, etc.) must match the system's ability naming

### Adding Template Strings
- Add to `lang/en.json`
- Reference in templates/JS with `{{localize "KEY"}}` or `game.i18n.localize()`

### Using Macros
The module exposes a global function for macro automation:
```javascript
window.dmRollAbilityForPlayers('str', ['userId1', 'userId2']);
```
Get player IDs with: `game.users.filter(u => u.isPlayer).map(u => u.id)`
