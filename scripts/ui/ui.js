const MODULE_ID = 'dm-roll';

export function initializeUI() {
  // Define a function to open the dialog and trigger the roll
  const openDmRollDialog = async () => {
    if (!game.user.isGM) {
      ui.notifications.error(`You are not the GM.`);
      return;
    }

    // Define common abilities, can be extended or made configurable
    const abilityChoices = {
      str: 'Strength',
      dex: 'Dexterity',
      con: 'Constitution',
      int: 'Intelligence',
      wis: 'Wisdom',
      cha: 'Charisma',
    };

    // Get active players to populate the selection
    const players = game.users.filter(u => u.isPlayer && u.active).map(u => ({ value: u.id, label: u.name }));

    if (players.length === 0) {
      ui.notifications.warn('No active players found to roll for.');
      return;
    }

    // Render the dialog content using the template
    const templateData = {
      abilityChoices,
      players,
    };

    const content = await renderTemplate('modules/dm-roll/templates/dm-roll-dialog.hbs', templateData);

    // Show a dialog to the GM to select ability and players
    new Dialog({
      title: 'DM Roll Ability',
      content: content,
      buttons: {
        roll: {
          icon: '<i class="fas fa-dice"></i>',
          label: 'Roll',
          callback: async html => {
            const abilityId = html.find('#ability-select').val();
            const selectedPlayerIds = Array.from(html.find('#player-select').val()); // .val() for multiple select returns an array

            if (!abilityId || selectedPlayerIds.length === 0) {
              ui.notifications.warn('Please select an ability and at least one player.');
              return;
            }

            // Call the module's function to perform the roll
            await window.dmRollAbilityForPlayers(abilityId, selectedPlayerIds);
          },
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: 'Cancel',
          callback: () => {},
        },
      },
      default: 'roll',
      render: () => {
        // Foundry's Dialog handles rendering, no specific action needed here for basic usage.
      },
    }).render(true);
  };

  // Add the button using the correct Foundry VTT v13 approach
  Hooks.on('getSceneControlButtons', controls => {
    console.log(`${MODULE_ID} | getSceneControlButtons hook called, user is GM:`, game.user.isGM);

    if (game.user.isGM) {
      console.log(`${MODULE_ID} | Adding DM Roll control button`);

      // Add a top-level control button that directly opens the dialog
      // Since controls is a Record<string, SceneControl>, we assign by name
      controls['dm-roll'] = {
        name: 'dm-roll',
        title: 'DM Roll',
        icon: 'fas fa-dice-d20',
        layer: 'controls',
        tool: 'ability-check', // Default active tool
        tools: [
          {
            name: 'ability-check',
            title: 'Roll Ability Check for Players',
            icon: 'fas fa-dice',
            visible: game.user.isGM,
            onClick: () => {
              openDmRollDialog();
            },
          },
        ],
      };
      console.log(`${MODULE_ID} | DM Roll control button added`);
    } else {
      console.log(`${MODULE_ID} | User is not GM, skipping button addition`);
    }
  });
}
