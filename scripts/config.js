Hooks.once('init', () => {
  game.settings.register('pf1-improved-conditions', 'reorderAllConditions', {
    name: "Reorder All Conditions Alphabetically",
    hint: 'Toggle to reorder all conditions alphabetically or only new conditions added by this module.',
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('pf1-improved-conditions', 'handleConfused', {
    name: 'Automate Confused Condition Actions',
    hint: 'Enable to automatically generate a message at the start of each round to determine the actions of confused tokens.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register('pf1-improved-conditions', 'restrictMovement', {
    name: "Restrict Movement",
    hint: "Enable to prevent token movement when affected by any of the following conditions: 'anchored', 'cowering', 'dazed', 'dying', 'helpless', 'paralyzed', 'petrified', or 'pinned'.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register('pf1-improved-conditions', 'autoApplyFF', {
    name: "Auto Apply Flat-Footed Condition",
    hint: "Enable to automatically apply the flat-footed condition to any token with an initiative roll result lower than the highest when combat begins.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register('pf1-improved-conditions', 'blindMovementCheck', {
    name: 'Enable Blind Movement Notification',
    hint: 'Enable to notify users to roll an Acrobatics check when a blind token attempts to move.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register('pf1-improved-conditions', 'disableAtZeroHP', {
    name: 'Apply Disabled Condition at 0 HP',
    hint: 'Automatically apply the disabled condition based on the selected option.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
        "none": "No one",
        "npc": "NPC Only",
        "player": "Player Only",
        "everyone": "Everyone"
    },
    default: "everyone"
  });

  game.settings.register('pf1-improved-conditions', 'autoApplyED', {
    name: 'Auto Apply Energy Drain',
    hint: 'Enable to automatically apply the energy drain condition to any token with negative levels.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register('pf1-improved-conditions', 'handleEntangledGrappled', {
    name: 'Concentration Check for Entangled and Grappled',
    hint: 'Enable to prompt users to roll a concentration check when tokens with the entangled or grappled condition attempt to cast spells.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register('pf1-improved-conditions', 'grappledHandling', {
    name: 'Grappled Action Handling',
    hint: 'Choose how actions requiring two hands should be handled when grappled: Strict, Lenient, or Disabled.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "disabled": "Disabled",
      "strict": "Strict",
      "lenient": "Lenient"
    },
    default: "strict"
  });  
  
  game.settings.register('pf1-improved-conditions', 'nauseatedHandling', {
    name: 'Nauseated Action Handling',
    hint: 'Choose how actions are handled when affected by the nauseated condition: Strict, Lenient, or Disabled.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "disabled": "Disabled",
      "strict": "Strict",
      "lenient": "Lenient"
    },
    default: "strict"
  });
  
  game.settings.register('pf1-improved-conditions', 'squeezingHandling', {
    name: 'Squeezing Action Handling',
    hint: 'Choose how actions are handled when affected by the squeezing condition: Strict, Lenient, or Disabled.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "disabled": "Disabled",
      "strict": "Strict",
      "lenient": "Lenient"
    },
    default: "strict"
  });  

  game.settings.register('pf1-improved-conditions', 'unconsciousAtNegativeHP', {
    name: 'Apply Unconscious Condition at Negative HP',
    hint: 'Automatically apply the unconscious condition based on the selected option.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
        "none": "No one",
        "npc": "NPC Only",
        "player": "Player Only",
        "everyone": "Everyone"
    },
    default: "everyone"
});

const isMonksCombatDetailsActive = game.modules.get('monks-combat-details')?.active;
const monksAutoDefeatedSetting = isMonksCombatDetailsActive ? game.settings.get('monks-combat-details', 'auto-defeated') : 'none';
const defaultApplyDeadCondition = monksAutoDefeatedSetting !== 'none' ? false : true;

game.settings.register('pf1-improved-conditions', 'applyDeadCondition', {
  name: 'Apply Dead Condition at Negative Constitution HP',
  hint: `Automatically apply the dead condition based on the selected option.${isMonksCombatDetailsActive ? ' Enabling this option will disable the Monks Combat Details auto defeated setting.' : ''}`,
  scope: 'world',
  config: true,
  type: String,
  choices: {
      "none": "No one",
      "npc": "NPC Only",
      "player": "Player Only",
      "player-negative-con-npc-negative-hp": "Player (Negative Con), NPC (Negative HP)",
      "everyone": "Everyone"
  },
  default: defaultApplyDeadCondition ? "everyone" : "none",
  onChange: async (value) => {
    if (value !== "none" && isMonksCombatDetailsActive) {
      const choice = await Dialog.confirm({
          title: "Conflict with Monks Combat Details",
          content: "Enabling this setting will disable the auto-defeated setting of Monks Combat Details. Do you want to proceed?",
          yes: () => true,
          no: () => false,
          defaultYes: false
      });
      if (choice) {
          await game.settings.set('monks-combat-details', 'auto-defeated', 'none');
          ui.notifications.info("Monks Combat Details auto-defeated setting has been disabled.");
      } else {
          await game.settings.set('pf1-improved-conditions', 'applyDeadCondition', 'none');
          ui.notifications.warn("Apply Dead Condition setting has been disabled.");
      };
    };
  }
});
});