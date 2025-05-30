/*
This module enhances the Pathfinder 1e system in Foundry VTT by improving condition handling.
It adds new conditions, automates condition effects, and enhances the token UI.
*/

import { MODULE } from './config.js';
import { socket, initializeConditionIds } from './sockets.js';
import { registerConditions, reorderTokenHUDConditions, setupConditionsI18n } from './conditions.js';
import { handleCombatTurn, handleCombatRound, updateFlatFootedTracker, handleFlatFootedOnCombatStart } from './combat.js';
import { handleConfusionForFirstToken, handleConfusionOnCombatStart, getBehaviorData, createConfusionEffectMessage } from './confusion.js';
import { handleBuffAutomation } from './buffs.js';

// Initialize the module
Hooks.on("init", (app, html, data) => {
  initializeConditionIds();
});

// Register custom conditions with the system
Hooks.on("pf1RegisterConditions", (registry) => {
  registerConditions(registry);
});

// Set up localization for conditions
Hooks.on('little-helper.i18n', (t) => {
  setupConditionsI18n(t);
});

// Reorder conditions in the token HUD
Hooks.on('renderTokenHUD', (app, html, data) => {
  reorderTokenHUDConditions(html, data);
});

// Handle combat start
Hooks.on('combatStart', async (combat) => {
  restoreFlatFootedTracker(combat);

  const turnOrder = combat.turns;
  const isSurprise = combat.getFlag(MODULE.ID, 'isSurprise') || false;
  const highestInitiative = Math.max(...combat.combatants.map(c => c.initiative));

  // Loop through each combatant to check if they are flat-footed
  for (const combatant of combat.combatants) {
    const token = canvas.tokens.get(combatant.tokenId);
    if (!token) continue;

    const turnIndex = turnOrder.findIndex(turn => turn.tokenId === combatant.tokenId);

    if (turnIndex !== -1) {
      if (game.settings.get(MODULE.ID, 'autoApplyFF')) {
        await handleFlatFootedOnCombatStart(combat, combatant, token, turnIndex, highestInitiative, isSurprise);
      }

      if (game.settings.get(MODULE.ID, 'handleConfused')) {
        await handleConfusionOnCombatStart(combatant, token, turnOrder);
      }
    }
  }

  // Save the tracker to flags after all processing is complete
  updateFlatFootedTracker(combat);
});

// Handle combat related hooks
Hooks.on('updateCombat', (combat, update, options, userId) => {
  // For round updates, only let GM handle it
  if (update.round !== undefined && game.user.isGM && userId === game.user.id) {
    handleCombatRound(combat, update.round);
  }
  
  // For turn updates - also handle the case where there's only one token and advancing turn updates the round instead
  if ((update.turn !== undefined && update.turn !== null && combat.combatant) || 
      (update.round !== undefined && combat.turns.length === 1 && combat.combatant)) {
    const combatData = {
      combatantId: combat.combatant.id,
      tokenId: combat.combatant.token.id,
      turn: combat.turn, // Use combat.turn instead of update.turn as it's always correct
      round: combat.round
    };
    
    if (game.user.isGM) {
      // GM handles it directly
    handleCombatTurn(combat, combatData);
    updateFlatFootedTracker(combat);
    } else if (!game.user.isGM) {
      // Non-GM users should check for flat-footed tokens in the turn order
      // and request the GM to handle it if needed
      checkNextTokenFlatFooted(combat, combatData);
    }
  }
});

/**
 * Check if the token whose turn it is has the flat-footed condition
 * and request the GM to handle it if needed
 * @param {Object} combat - The combat object
 * @param {Object} combatData - The combat data
 */
function checkNextTokenFlatFooted(combat, combatData) {
  const token = canvas.tokens.get(combatData.tokenId);
  if (!token || !token.actor) return;
  
  // Check if the token whose turn it is has the flat-footed condition
  if (token.actor.statuses.has("flatFooted")) {
    // Request the GM to handle the condition removal through the socket
    socket.executeAsGM("handleFlatFootedRemoval", combatData.tokenId, combatData.round, combatData.turn);
  }
}

// Handle combat tracker rendering
Hooks.on('renderCombatTracker', (app, html, data) => {
  if (!game.settings.get(MODULE.ID, 'autoApplyFF')) return;
  const combatControls = html.find('#combat-controls');

  // Check if this is a surprise round
  const isSurprise = data.combat?.getFlag(MODULE.ID, 'isSurprise') || false;
  const isRoundOne = data.combat?.current?.round === 1;
  
  // Modify the round display if this is a surprise round
  if (isSurprise && isRoundOne) {
    // Find the round display element with the correct class
    const roundDisplay = html.find('.encounter-title');
    
    if (roundDisplay.length) {
      // Replace "Round 1" with "Surprise Round" in red
      roundDisplay.html(`<span style="color: red; font-weight: bold;">Surprise Round</span>`);
    }
  }

  // Only proceed with Surprise Round button if the current round is 0 (meaning combat hasn't started yet)
  // AND the user is a GM
  if (combatControls.length && data.combat?.current?.round === 0 && game.user.isGM) {
    // Ensure the buttons are stacked vertically by setting flex-direction to column
    combatControls.css('flex-direction', 'column');

    // Create the "Surprise Round" button without an icon
    const surpriseRoundButton = $(`
      <a class="combat-control" aria-label="Surprise Round" role="button">
        Surprise Round
      </a>
    `);

    // Insert the "Begin Combat" button after the "Surprise Round" button
    const beginCombatButton = combatControls.find('a[data-control="startCombat"]');

    if (beginCombatButton.length) {
      beginCombatButton.before(surpriseRoundButton);
    } else {
      combatControls.prepend(surpriseRoundButton);  // Fallback in case "Begin Combat" button isn't found
    }

    // Async function to manage the exemptFromSurprise flag for all tokens in the combat turn order
    const resetExemptFlags = async (combat) => {
      const selectedTokens = canvas.tokens.controlled.map(token => token.id); // Get the IDs of selected tokens

      // Collect all the setFlag promises
      const flagPromises = combat.turns.map(async turn => {
        const tokenId = turn.tokenId;
        const token = canvas.tokens.get(tokenId);

        if (token) {
          // Set the exemptFromSurprise flag to true for selected tokens and false for non-selected tokens
          const isSelected = selectedTokens.includes(tokenId);
          return token.actor.setFlag(MODULE.ID, 'exemptFromSurprise', isSelected);
        }
      });

      // Wait for all flag setting promises to complete
      await Promise.all(flagPromises);
    };

    // Add click event listener to handle the surprise round logic
    surpriseRoundButton.click(async () => {
      const isSurprise = data.combat?.getFlag(MODULE.ID, 'isSurprise') || false;

      // Reset the exempt flags for all tokens in the turn order
      await resetExemptFlags(data.combat);

      // Proceed to start the combat
      if (!isSurprise) {
        await data.combat?.setFlag(MODULE.ID, 'isSurprise', true);
      }
      data.combat?.startCombat();
    });

    // Delegated event listener for the "Begin Combat" button
    combatControls.on('click', 'a[data-control="startCombat"]', async () => {
      const isSurprise = data.combat?.getFlag(MODULE.ID, 'isSurprise') || false;

      // Reset the exempt flags for all tokens in the turn order
      await resetExemptFlags(data.combat);

      if (isSurprise) {
        await data.combat?.setFlag(MODULE.ID, 'isSurprise', false);
      }
    });
  }
});

// Handle clicking the token image in the chat card
Hooks.on("renderChatMessage", (message, html, data) => {
  if (!game.settings.get(MODULE.ID, 'handleConfused')) return;
  
  // Adds the click and hover targeting functionalities to the confused messages.
  html.find(".IC-token img").click(async ev => {
    const tokenUuid = $(ev.currentTarget).closest(".IC-token").data("uuid");
    const tokenDocument = await fromUuid(tokenUuid);
    const token = canvas.tokens.get(tokenDocument.id);
    if (token) {
      token.control({releaseOthers: true});
      canvas.animatePan({x: token.center?.x, y: token.center?.y, duration: 1000});
    }
  });

  html.find(".IC-token img").hover(
    async ev => {
      const tokenUuid = $(ev.currentTarget).closest(".IC-token").data("uuid");
      const tokenDocument = await fromUuid(tokenUuid);
      const token = canvas.tokens.get(tokenDocument.id);
      if (token) token._onHoverIn(ev);
    },
    async ev => {
      const tokenUuid = $(ev.currentTarget).closest(".IC-token").data("uuid");
      const tokenDocument = await fromUuid(tokenUuid);
      const token = canvas.tokens.get(tokenDocument.id);
      if (token) token._onHoverOut(ev);
    }
  );
});

// Handle health conditions
Hooks.on('updateActor', async (actorDocument, change, options, userId) => {
  if (!actorDocument.isOwner) return;

  // Get all users who have owner permissions on the actorDocument
  let ownerUsers = game.users.filter(u => actorDocument.testUserPermission(u, 'OWNER'));

  // Prefer non-GM users
  let nonGMOwners = ownerUsers.filter(u => !u.isGM);

  let preferredUserId;
  if (nonGMOwners.length > 0) {
    // Use the first non-GM owner
    preferredUserId = nonGMOwners[0].id;
  } else {
    // No non-GM owners, use the first owner (probably the GM)
    preferredUserId = ownerUsers[0].id;
  }

  // If the current user is not the preferred user or a GM, exit the hook
  if (game.user.id !== preferredUserId && !game.user.isGM) return;
  
  // Check for disabled condition setting
  const disableSetting = game.settings.get(MODULE.ID, 'disableAtZeroHP');
  const actorType = actorDocument.type;  // Check whether it's a player character or NPC

  if ((disableSetting === 'everyone' || 
     (disableSetting === 'player' && actorType === 'character') || 
     (disableSetting === 'npc' && actorType === 'npc')) && 
    hasHpUpdate(change)) {
    const newHp = getNewHp(actorDocument, change);
    if (newHp === 0) {
        await actorDocument.setCondition("disabled", true);
    }
  }

  if (game.settings.get(MODULE.ID, 'autoApplyED') && hasNegativeLevelUpdate(change)) {
    const newNegativeLevels = getNewNegativeLevels(actorDocument, change);
    if (newNegativeLevels > 0) {
      await actorDocument.setCondition("energyDrained", true);
    } else {
      await actorDocument.setCondition("energyDrained", false);
    }
  }

  // Handle unconscious condition at negative HP
  const unconsciousSetting = game.settings.get(MODULE.ID, 'unconsciousAtNegativeHP');
  if (unconsciousSetting !== 'none' && hasHpUpdate(change)) {
    const newHp = getNewHp(actorDocument, change);
    if (newHp < 0) {
      const isNPC = actorDocument.type === 'npc';
      const shouldApply = 
        unconsciousSetting === 'everyone' || 
        (unconsciousSetting === 'npc' && isNPC) ||
        (unconsciousSetting === 'player' && !isNPC);
      
      if (shouldApply) {
        // Check for hard to kill ability
        const hardToKill = ["diehard", "ferocity (orc)", "orc ferocity", "ferocity"];
        const hasHTK = actorDocument.items.some(i => 
          i.type === 'feat' && 
          hardToKill.some(htk => htk === i.name.toLowerCase())
        );
        
        if (!hasHTK) {
          await actorDocument.setCondition('unconscious', true);
        }
      }
    }
  }

  const deadConditionSetting = game.settings.get(MODULE.ID, 'applyDeadCondition');

  if (deadConditionSetting !== 'none' && hasHpUpdate(change)) {
    const newHp = getNewHp(actorDocument, change);
    const conScore = actorDocument.system.abilities.con.total;
    const isNPC = actorDocument.type === 'npc';
    
    let shouldApply = false;
    
    // Determine if we should apply the dead condition based on settings
    if (deadConditionSetting === 'everyone') {
      shouldApply = newHp <= -conScore;
    } else if (deadConditionSetting === 'npc' && isNPC) {
      shouldApply = newHp <= -conScore;
    } else if (deadConditionSetting === 'player' && !isNPC) {
      shouldApply = newHp <= -conScore;
    } else if (deadConditionSetting === 'player-negative-con-npc-negative-hp') {
      if (isNPC) {
        shouldApply = newHp < 0;
      } else {
        shouldApply = newHp <= -conScore;
      }
    }
    
    if (shouldApply) {
      await actorDocument.setCondition('dead', {overlay: true});
    }
  }
});

// Handle actions with condition checks
Hooks.on("pf1PreActionUse", (action) => {
  const actionType = action.action.activation?.type;
  const held = action.action.held || action.item.system.held;
  const token = action.token;
  const actor = token?.actor;

  // Handle buff automation (moved from pf1PostActionUse to allow rejecting the action)
  if (action.item && 
      (action.item.type === "spell" || action.item.type === "consumable") && 
      game.settings.get(MODULE.ID, 'automaticBuffs')) {
    handleBuffAutomation(action);
  }

  // Grappled condition
  const grappledHandling = game.settings.get(MODULE.ID, 'grappledHandling');
  if (grappledHandling && actor?.statuses.has("grappled") && held === "2h") {
    if (grappledHandling === "disabled") return;
    if (grappledHandling === "strict") {
      action.shared.reject = true;
      ui.notifications.info(`${token.name} cannot perform this action due to being grappled and it requires two hands.`);
    } else if (grappledHandling === "lenient") {
      ui.notifications.info(`${token.name} is grappled but can perform the action under lenient handling.`);
    }
  }

  // Nauseated condition
  const nauseatedHandling = game.settings.get(MODULE.ID, 'nauseatedHandling');
  if (nauseatedHandling && actor?.statuses.has("nauseated")) {
    if (nauseatedHandling === "disabled") return;
    if (nauseatedHandling === "strict" && actionType !== "move") {
      action.shared.reject = true;
      ui.notifications.info(`${token.name} cannot perform this action due to being nauseated; only move actions are allowed.`);
    } else if (nauseatedHandling === "lenient") {
      ui.notifications.info(`${token.name} is nauseated but can perform other actions under lenient handling.`);
    }
  }

  // Squeezing condition
  const squeezingHandling = game.settings.get(MODULE.ID, 'squeezingHandling');
  if (squeezingHandling && actor?.statuses.has("squeezing")) {
    if (squeezingHandling === "disabled") return;
    if (squeezingHandling === "strict" && (actionType === "attack" || actionType === "aoo")) {
      action.shared.reject = true;
      ui.notifications.info(`${token.name} cannot perform attack actions due to being squeezed.`);
    } else if (squeezingHandling === "lenient") {
      ui.notifications.info(`${token.name} is squeezing but can perform attacks under lenient handling.`);
    }
  }
});

// Handle concentration checks for actions
Hooks.on('pf1PreActorRollConcentration', (actor, rollContext) => {
  const nauseatedHandling = game.settings.get(MODULE.ID, 'nauseatedHandling');
  if (nauseatedHandling && rollContext.token?.actor?.statuses?.has("nauseated")) {
    if (nauseatedHandling === "disabled") return true; // Allow action
    const token = rollContext.token;
    if (nauseatedHandling === "strict") {
      ui.notifications.info(`${token.name} cannot perform this action due to being nauseated; only move actions are allowed.`);
      return false; // Cancel action
    } else if (nauseatedHandling === "lenient") {
      ui.notifications.info(`${token.name} is nauseated but can perform this action under lenient handling.`);
    }
  }
});

// Handle strenuous activity for disabled characters
Hooks.on("pf1PostActionUse", async (action) => {
  // Check for disabled, entangled, or grappled conditions settings
  if (game.settings.get(MODULE.ID, 'disableAtZeroHP') ||
  game.settings.get(MODULE.ID, 'handleEntangledGrappled')) {
    const itemSource = action.item;
    const token = action.token;
    const actor = token?.actor;

    if (game.settings.get(MODULE.ID, 'disableAtZeroHP')) {
      const activationTypes = ["nonaction", "passive", "free", "swift", "immediate", "move", "standard", "full", "attack", "aoo", "round", "minute", "hour", "special"]
      const strenuousTypes = ["standard", "full", "attack", "aoo", "round", "minute", "hour"]
      if (strenuousTypes.includes(action.action?.activation?.type)) {
        if (actor && actor?.statuses?.has("disabled")) {
          let hp = actor.system?.attributes?.hp;
          const conScore = actor.system?.abilities?.con?.total;
          const hardToKill = ["diehard", "ferocity (orc)", "orc ferocity", "ferocity"]
          const ability = actor.items.find(item => hardToKill.some(htk => htk === item.name.toLowerCase()));
          let newHp = hp.value - 1;
          
          // Update the actor's HP
          if(hp.max > 0 && hp.value == 0 && !actor.statuses.has("unconscious")) {
            handleHTK(actor, ability, newHp, conScore);
          } else if(hp.max > 0 && hp.value < 0 && !actor.statuses.has("unconscious") && hp.value >= (conScore * -1)) {
            handleHTK(actor, ability, newHp, conScore);
          }
        }
      }
    }

    if (game.settings.get(MODULE.ID, 'handleEntangledGrappled')) {
      if (itemSource.type == "spell") {
  
          const handleConcentrationCheck = async (spellbook, skipDialog) => {
            if (!actor) return;
              if (actor.statuses.has("entangled")) {
                  await actor.rollConcentration(spellbook, { skipDialog });
              }
  
              if (actor.statuses.has("grappled") && itemSource.system.components?.somatic) {
                  await actor.rollConcentration(spellbook, { skipDialog });
              }
          };
  
          // Determine whether to skip the dialog based on whether the current user is the GM or not.
          const skipDialog = game.user.isGM;
  
          await handleConcentrationCheck(itemSource.system.spellbook, skipDialog);
      }
  }
  
  };
});

// Helper functions for health processing
function hasHpUpdate(updateData) {
  return updateData.system && 
         updateData.system.attributes && 
         updateData.system.attributes.hp && 
         (updateData.system.attributes.hp.value !== undefined || updateData.system.attributes.hp.offset !== undefined);
}

function getNewHp(actor, updateData) {
  // If the update has a direct value, use it
  if (updateData.system.attributes.hp.value !== undefined) {
    return updateData.system.attributes.hp.value;
  }
  // If we have an offset, calculate the new value
  else if (updateData.system.attributes.hp.offset !== undefined) {
    return actor.system.attributes.hp.value;
  }
  // Fallback to current value if neither is present
  return actor.system.attributes.hp.value;
}

function hasNegativeLevelUpdate(updateData) {
  return updateData.system && 
         updateData.system.attributes && 
         updateData.system.attributes.energyDrain !== undefined;
}

function getNewNegativeLevels(actor, updateData) {
  return updateData.system.attributes.energyDrain;
}

// Handle Hard to Kill ability
async function handleHTK(actor, ability, newHp, conScore) {
  if (newHp < 0 && newHp > -conScore) {
    const choice = await socket.executeAsGM("promptHTKChoice", actor.id);
    if (choice === "fight") {
      // Continue fighting, update HP, don't apply unconscious
      await actor.update({"system.attributes.hp.value": newHp});
      return;
    } else {
      // Fall unconscious - the updateActor hook will handle this
      await actor.update({"system.attributes.hp.value": newHp});
    }
  } else if (newHp <= -conScore) {
    // Character is dead regardless of HTK - the updateActor hook will handle this
    await actor.update({"system.attributes.hp.value": newHp});
  }
}

// Function to restore the flatFootedTracker from flags
function restoreFlatFootedTracker(combat) {
  const trackerData = combat.getFlag(MODULE.ID, 'flatFootedTracker') || {};
  flatFootedTracker.clear(); // Clear any existing data
  for (const [tokenId, data] of Object.entries(trackerData)) {
    flatFootedTracker.set(tokenId, data);
  }
}

// Initialize the flatFootedTracker map
const flatFootedTracker = new Map();