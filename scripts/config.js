export const MODULE = {ID: "pf1-improved-conditions"};

Hooks.once('init', () => {
  game.settings.register(MODULE.ID, 'reorderAllConditions', {
    name: "Reorder All Conditions Alphabetically",
    hint: 'Toggle to reorder all conditions alphabetically or only new conditions added by this module.',
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE.ID, 'automaticBuffs', {
    name: 'Enable Automatic Buffs',
    hint: 'When enabled, the module will attempt to find and apply matching buffs when spells or consumables are used.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });
  
  game.settings.register(MODULE.ID, 'buffAutomationMode', {
    name: 'Buff Automation Mode',
    hint: 'Choose how strict the buff automation should be when no targets are selected.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "strict": "Strict (Block actions without targets)",
      "lenient": "Lenient (Allow, but notify if no targets)"
    },
    default: "strict"
  });
  
  game.settings.register(MODULE.ID, 'buffTargetFiltering', {
    name: 'Buff Target Filtering',
    hint: 'Choose how buff targets are filtered. "By Disposition" only applies buffs to targets with the same disposition as the caster, "All Targets" applies buffs to all selected targets, and "Manual Selection" prompts you to choose which targets receive the buff.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "byDisposition": "By Disposition (Only same disposition)",
      "allTargets": "All Targets (No filtering)",
      "manualSelection": "Manual Selection (Choose targets)"
    },
    default: "byDisposition"
  });
  
  game.settings.registerMenu(MODULE.ID, 'buffCompendiaSelector', {
    name: 'Select Buff Compendia',
    label: 'Select Compendia',
    hint: 'Choose which compendia to include when searching for buff items.',
    icon: 'fas fa-book',
    type: BuffCompendiaSelector,
    restricted: true
  });

  game.settings.register(MODULE.ID, 'customBuffCompendia', {
    name: 'Custom Buff Compendia',
    hint: 'Select additional compendia containing buffs to include in the automated buff search.',
    scope: 'world',
    config: false,
    type: Array,
    default: [],
  });

  game.settings.register(MODULE.ID, 'handleConfused', {
    name: 'Automate Confused Condition Actions',
    hint: 'Enable to automatically generate a message at the start of each round to determine the actions of confused tokens.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE.ID, 'restrictMovement', {
    name: "Restrict Movement",
    hint: "Enable to prevent token movement when affected by any of the following conditions: 'anchored', 'cowering', 'dazed', 'dying', 'helpless', 'paralyzed', 'petrified', or 'pinned'.",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
  });

  game.settings.register(MODULE.ID, 'autoApplyFF', {
    name: "Auto Apply Flat-Footed Condition",
    hint: "Enable to automatically apply the flat-footed condition to any token with an initiative roll result lower than the highest when combat begins.",
    scope: "world",
    config: true,
    type: Boolean,
    default: true,
  });

  game.settings.register(MODULE.ID, 'blindMovementCheck', {
    name: 'Enable Blind Movement Notification',
    hint: 'Enable to notify users to roll an Acrobatics check when a blind token attempts to move.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE.ID, 'disableAtZeroHP', {
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

  game.settings.register(MODULE.ID, 'autoApplyED', {
    name: 'Auto Apply Energy Drain',
    hint: 'Enable to automatically apply the energy drain condition to any token with negative levels.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE.ID, 'handleEntangledGrappled', {
    name: 'Concentration Check for Entangled and Grappled',
    hint: 'Enable to prompt users to roll a concentration check when tokens with the entangled or grappled condition attempt to cast spells.',
    scope: 'world',
    config: true,
    type: Boolean,
    default: true
  });

  game.settings.register(MODULE.ID, 'grappledHandling', {
    name: 'Grappled Action Handling',
    hint: 'Choose how actions requiring two hands should be handled when grappled: Strict, Lenient, or Disabled.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "disabled": "Disabled (No restrictions)",
      "strict": "Strict (Block two-handed actions)",
      "lenient": "Lenient (Allow with warning)"
    },
    default: "strict"
  });  
  
  game.settings.register(MODULE.ID, 'nauseatedHandling', {
    name: 'Nauseated Action Handling',
    hint: 'Choose how actions are handled when affected by the nauseated condition: Strict, Lenient, or Disabled.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "disabled": "Disabled (No restrictions)",
      "strict": "Strict (Block non-move actions)",
      "lenient": "Lenient (Allow with warning)"
    },
    default: "strict"
  });
  
  game.settings.register(MODULE.ID, 'squeezingHandling', {
    name: 'Squeezing Action Handling',
    hint: 'Choose how actions are handled when affected by the squeezing condition: Strict, Lenient, or Disabled.',
    scope: 'world',
    config: true,
    type: String,
    choices: {
      "disabled": "Disabled (No restrictions)",
      "strict": "Strict (Block attack actions)",
      "lenient": "Lenient (Allow with warning)"
    },
    default: "strict"
  });  

  game.settings.register(MODULE.ID, 'unconsciousAtNegativeHP', {
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
  
  game.settings.register(MODULE.ID, 'applyDeadCondition', {
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
            await game.settings.set(MODULE.ID, 'applyDeadCondition', 'none');
            ui.notifications.warn("Apply Dead Condition setting has been disabled.");
        };
      };
    }
  });
});

class BuffCompendiaSelector extends FormApplication {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      id: "buff-compendia-selector",
      title: "Select Buff Compendia",
      template: `modules/${MODULE.ID}/templates/buff-compendia-selector.html`,
      classes: ["sheet"],
      width: 500,
      height: "auto",
      closeOnSubmit: true
    });
  }
  
  /** @override */
  async getData() {
    const selectedCompendia = game.settings.get(MODULE.ID, 'customBuffCompendia');
    
    const availableCompendia = game.packs.filter(pack => {
      return (pack.metadata.type === "Item" || pack.documentName === "Item");
    }).map(pack => {
      return {
        id: pack.collection,
        name: pack.metadata.label,
        isSelected: selectedCompendia.includes(pack.collection)
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
    
    return {
      compendia: availableCompendia
    };
  }
  
  /** @override */
  async _updateObject(event, formData) {
    const selectedCompendia = [];
    for (const [key, value] of Object.entries(formData)) {
      if (key.startsWith('compendium-') && value) {
        const compendiumId = key.substring(11);
        selectedCompendia.push(compendiumId);
      }
    }
    
    await game.settings.set(MODULE.ID, 'customBuffCompendia', selectedCompendia);
    ui.notifications.info(`${MODULE.ID} | Saved custom buff compendia (${selectedCompendia.length} selected)`);
  }
}

Hooks.on('renderSettingsConfig', (app, html, data) => {
  let tab;
  if (typeof html.find === 'function') {
    tab = html.find('section.tab[data-tab="pf1-improved-conditions"]');
  } else {
    tab = html.querySelector('section.tab[data-tab="pf1-improved-conditions"]');
  }

  function findFormGroup(selector) {
    if (!tab) return null;
    if (typeof html.find === 'function') {
      return tab.find(selector).closest('.form-group');
    } else {
      const el = tab.querySelector(selector);
      return el ? el.closest('.form-group') : null;
    }
  }

  const automaticBuffsRow = findFormGroup('input[name="pf1-improved-conditions.automaticBuffs"]');
  const buffSelectorRow = findFormGroup('button[data-key="pf1-improved-conditions.buffCompendiaSelector"]');
  const buffAutomationModeRow = findFormGroup('select[name="pf1-improved-conditions.buffAutomationMode"]');
  const buffTargetFilteringRow = findFormGroup('select[name="pf1-improved-conditions.buffTargetFiltering"]');

  if (automaticBuffsRow && buffSelectorRow) {
    if (typeof html.find === 'function') {
      buffSelectorRow.detach().insertAfter(automaticBuffsRow);
    } else {
      automaticBuffsRow.parentNode.insertBefore(buffSelectorRow, automaticBuffsRow.nextSibling);
    }
  }

  let automaticBuffsCheckbox;
  if (typeof html.find === 'function') {
    automaticBuffsCheckbox = automaticBuffsRow.find('input');
  } else {
    automaticBuffsCheckbox = automaticBuffsRow ? automaticBuffsRow.querySelector('input') : null;
  }

  const isEnabled = automaticBuffsCheckbox
    ? (typeof html.find === 'function'
        ? automaticBuffsCheckbox.prop('checked')
        : automaticBuffsCheckbox.checked)
    : false;

  toggleBuffSettingsVisibility(isEnabled, [buffSelectorRow, buffAutomationModeRow, buffTargetFilteringRow]);

  if (automaticBuffsCheckbox) {
    if (typeof html.find === 'function') {
      automaticBuffsCheckbox.on('change', function() {
        const isChecked = $(this).prop('checked');
        toggleBuffSettingsVisibility(isChecked, [buffSelectorRow, buffAutomationModeRow, buffTargetFilteringRow]);
      });
    } else {
      automaticBuffsCheckbox.addEventListener('change', function() {
        toggleBuffSettingsVisibility(this.checked, [buffSelectorRow, buffAutomationModeRow, buffTargetFilteringRow]);
      });
    }
  }

  function toggleBuffSettingsVisibility(show, elements) {
    elements.forEach(element => {
      if (!element) return;
      if (typeof html.find === 'function') {
        if (show) element.show();
        else element.hide();
      } else {
        element.style.display = show ? '' : 'none';
      }
    });
  }
});