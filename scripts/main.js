import './config.js';
import { socket, initializeConditionIds } from './sockets.js';

Hooks.on("pf1RegisterConditions", (registry) => {
  registry.tracks.push("immobilize");

  const conditions = [
      {
          namespace: "pf1-improved-conditions",
          key: "anchored",
          value: {
              journal: "Compendium.pf1-improved-conditions.Improved-Conditions.JournalEntry.aRktpe0E6gArf9Gi",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Anchored.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/anchored.png",
              track: "immobilize"
          }
      },
      {
          namespace: "pf1-improved-conditions",
          key: "energyDrained",
          value: {
              journal: "Compendium.pf1.pf1e-rules.JournalEntry.NSqfXaj4MevUR2uJ.JournalEntryPage.onMPh2re6fIeNgNr",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.EnergyDrained.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/drained.png",
              track: ""
          }
      },
      {
          namespace: "pf1-improved-conditions",
          key: "fascinated",
          value: {
              journal: "Compendium.pf1.pf1e-rules.JournalEntry.NSqfXaj4MevUR2uJ.JournalEntryPage.Hy0MHwpRRr5QxVj5",
              flags: {},
              mechanics: {
                  changes: [
                      { formula: '-4', target: 'skill.per', type: 'untyped' }
                  ],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Fascinated.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/fascinated.png",
              track: ""
          }
      },
      {
          namespace: "pf1-improved-conditions",
          key: "immobilized",
          value: {
              journal: "Compendium.pf1-improved-conditions.Improved-Conditions.JournalEntry.EveE8ceyzqbicqT0",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: ["loseDexToAC"]
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Immobilized.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/immobilized.png",
              track: ""
          }
      },
      {
          namespace: "pf1-improved-conditions",
          key: "slowed",
          value: {
              journal: "Compendium.pf1-improved-conditions.Improved-Conditions.JournalEntry.a6akglSId5Isu25j",
              flags: {},
              mechanics: {
                  changes: [
                    {
                        "type": "untyped",
                        "operator": "set",
                        "formula": "@attributes.speed.land.total / 2",
                        "target": "landSpeed"
                    },
                    {
                        "type": "untyped",
                        "operator": "set",
                        "formula": "@attributes.speed.climb.total / 2",
                        "target": "climbSpeed"
                    },
                    {
                        "type": "untyped",
                        "operator": "set",
                        "formula": "@attributes.speed.swim.total / 2",
                        "target": "swimSpeed",
                    },
                    {
                        "type": "untyped",
                        "operator": "set",
                        "formula": "@attributes.speed.burrow.total / 2",
                        "target": "burrowSpeed",
                    },
                    {
                        "type": "untyped",
                        "operator": "set",
                        "formula": "@attributes.speed.fly.total / 2",
                        "target": "flySpeed",
                    }
                ],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Slowed.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/slowed.png",
              track: ""
          }
      }
  ];

  conditions.forEach(condition => {
      registry.register(condition.namespace, condition.key, condition.value);
  });

  const entangled = registry.get("entangled");
  if (entangled) {
      entangled.updateSource({ track: "immobilize" });
  }
});

Hooks.on("init", (app, html, data) => {
  initializeConditionIds();
});

Hooks.on('little-helper.i18n', (t) => {
	t.conditions.anchored = "PF1-Improved-Conditions.Anchored.description";
	t.conditions.energyDrained = "PF1-Improved-Conditions.EnergyDrained.description";
	t.conditions.fascinated = 'Entranced by a supernatural or spell effect.<br><br>Stands or sits quietly, taking no actions other than paying attention to the effect.<br><br>-4 penalty on skill checks made as reactions (e.g., Perception checks).<br><br>Any potential threat (e.g., hostile creature approaching) allows a new saving throw.<br>Any obvious threat (e.g., drawing a weapon, casting a spell, aiming a ranged weapon) automatically breaks the effect.<br><br>An ally can shake the fascinated creature free as a standard action.';
	t.conditions.immobilized = "PF1-Improved-Conditions.Slowed.description";
	t.conditions.slowed = "PF1-Improved-Conditions.Slowed.description";
});

Hooks.on('renderTokenHUD', (app, html, data) => {
  const conditions = html.find('.status-effects');
  const reorderAllConditions = game.settings.get('pf1-improved-conditions', 'reorderAllConditions');

  const allConditions = pf1.registry.conditions.map(condition => condition._id);

  const conditionEffects = Object.values(data.statusEffects).filter(effect => allConditions.includes(effect.id));
  const buffEffects = Object.values(data.statusEffects).filter(effect => !allConditions.includes(effect.id) && effect.id !== "dead");

  const deadCondition = Object.values(data.statusEffects).filter(effect => effect.id === "dead");

  let sortedEffects;
  if (reorderAllConditions) {
      sortedEffects = Object.values(data.statusEffects).sort((a, b) => a.title.localeCompare(b.title));
  } else {
      const otherConditions = conditionEffects.filter(effect => effect.id !== "dead");
      sortedEffects = otherConditions.sort((a, b) => a.title.localeCompare(b.title));
  }

  conditions.empty();

  if (deadCondition && !reorderAllConditions) {
      const deadIcon = `<img class="effect-control ${deadCondition[0].cssClass}" data-status-id="${deadCondition[0].id}" src="${deadCondition[0].src}" title="${deadCondition[0].title}"/>`;
      conditions.append(deadIcon);
  }

  for (const effect of sortedEffects) {
      const conditionIcon = `<img class="effect-control ${effect.cssClass}" data-status-id="${effect.id}" src="${effect.src}" title="${effect.title}"/>`;
      conditions.append(conditionIcon);
  }

  if (!reorderAllConditions) {
    for (const effect of buffEffects) {
      const buffIcon = `<img class="effect-control ${effect.cssClass}" data-status-id="${effect.id}" src="${effect.src}" title="${effect.title}"/>`;
      conditions.append(buffIcon);
    }
  }
});

// Handle the "Confused" condition at the start of each round
Hooks.on("updateWorldTime", function(worldTime, dt) {
  if (!game.settings.get('pf1-improved-conditions', 'handleConfused')) return;
  const tokens = canvas.tokens.placeables;
  let content = `<div class="card-content">`;
  let hasContent = false;

  const privateMessages = {};
  const tokenContents = [];

  tokens.forEach(token => {
    if (token.inCombat) return;
    const actor = token.actor;
    if (!actor || !actor.statuses.has("confused")) return;

    const confusedEffects = actor.effects.filter(effect => effect.name === "Confused");
    confusedEffects.forEach(effect => {
      const startTime = effect.duration?.startTime;
      if ((worldTime - startTime) % 6 !== 0) return;

      const roll = new Roll("1d100").roll({async: false});
      const rollResult = roll.total;

      const behaviorData = getBehaviorData(actor, rollResult);
      if (!behaviorData) return;

      const { behavior, damageRoll, encodedRollData, tooltip, itemUsed } = behaviorData;

      let tokenContent = createTokenContent(token, behavior, damageRoll, encodedRollData, tooltip, itemUsed);

      const isHiddenOrInvisible = token.document.hidden || actor.statuses.has("invisible");
      if (isHiddenOrInvisible && (actor.hasPlayerOwner || actor.activeOwner?.active)) {
        handlePrivateMessage(actor, token, tokenContent, privateMessages);
      } else {
        tokenContents.push(tokenContent);
        hasContent = true;
      }
    });
  });

  if (hasContent && content.trim() !== `<div class="card-content"></div>`) {
    content += tokenContents.length > 1 ? tokenContents.join('<div style="border-top: 2px solid black; margin: 8px 0;"></div>') : tokenContents[0];
    content += `</div>`;
    ChatMessage.create({
      content: content,
      speaker: { alias: "Confusion Effect" }
    });
  }

  sendPrivateMessages(privateMessages);
});

function getBehaviorData(actor, rollResult) {
  let behavior, damageRoll = null, encodedRollData = null, tooltip = null, itemUsed = null;
  const damageType = "bludgeoning"; // Default damage type

  if (rollResult <= 25) {
    behavior = game.i18n.localize("PF1-Improved-Conditions.Confused.Effects.1");
  } else if (rollResult <= 50) {
    behavior = game.i18n.localize("PF1-Improved-Conditions.Confused.Effects.2");
  } else if (rollResult <= 75) {
    const strMod = actor.system?.abilities?.str.mod;
    damageRoll = new Roll(`1d8 + ${strMod}`).roll({async: false});
    encodedRollData = encodeRollData(damageRoll, strMod);
    tooltip = `1d8 + ${strMod}[Strength]`;

    itemUsed = chooseRandomItem(actor, ["weapon", "attack"]);
    const itemDescription = itemUsed ? (itemUsed.system?.baseTypes?.[0]?.toLowerCase() || itemUsed?.name.toLowerCase()) : "their fists";

    behavior = itemUsed ? 
      // Weapon available 
      game.i18n.format("PF1-Improved-Conditions.Confused.Effects.3a", {itemName: itemDescription, damage: damageRoll.total}) :
      // No weapon available 
      game.i18n.format("PF1-Improved-Conditions.Confused.Effects.3b", {damage: damageRoll.total}) ;
  } else {
    // Attack nearest target
    behavior = game.i18n.localize("PF1-Improved-Conditions.Confused.Effects.4");
  }

  return { behavior, damageRoll, encodedRollData, tooltip, itemUsed };
}

// Function to handle confusion condition during combat turns
function handleConfusionCondition(combat, combatData) {
  const turnOrder = combat.turns;
  const currentCombatant = turnOrder[combatData.turn]?.tokenId;

  if (!currentCombatant) return;

  const token = canvas.tokens.get(currentCombatant);
  const actor = token.actor;
  if (!actor || !actor.statuses.has("confused")) return;

  const roll = new Roll("1d100").roll({async: false});
  const rollResult = roll.total;

  const behaviorData = getBehaviorData(actor, rollResult);
  if (!behaviorData) return;

  const { behavior, damageRoll, encodedRollData, tooltip, itemUsed } = behaviorData;

  let tokenContent = createTokenContent(token, behavior, damageRoll, encodedRollData, tooltip, itemUsed);
  let content = `<div class="card-content">${tokenContent}</div>`;

  ChatMessage.create({
    content: content,
    speaker: { alias: "Confusion Effect" }
  });
}

// Function to encode roll data for tooltip
function encodeRollData(damageRoll, strMod) {
  const rollData = {
    class: "DamageRoll",
    options: {
      damageType: {
        values: ["bludgeoning"],
        custom: ""
      },
      type: "normal"
    },
    dice: [],
    formula: `1d8 + (${strMod})[Strength]`,
    terms: [
      { class: "Die", options: {}, evaluated: true, number: 1, faces: 8, modifiers: [], results: damageRoll.terms[0].results },
      { class: "OperatorTerm", options: {}, evaluated: true, operator: " + " },
      { class: "NumericTerm", options: { flavor: "Strength" }, evaluated: true, number: strMod }
    ],
    total: damageRoll.total,
    evaluated: true
  };
  return encodeURIComponent(JSON.stringify(rollData));
}

// Function to create token content for chat messages
function createTokenContent(token, behavior, damageRoll, encodedRollData, tooltip, itemUsed) {
  let tokenContent = `<div class="IC-token" data-uuid="${token.document.uuid}" style="margin-bottom: 8px;">
                        <div style="display: flex; justify-content: center;">
                          <img src="${token.document.texture.src}" title="${token.name}" width="72" height="72" style="margin-bottom: 8px;"/>
                        </div>
                        <span style="text-align: center; display: block;">${token.name} ${behavior}</span>
                      </div>`;

  if (damageRoll) {
    const halfDamage = Math.floor(damageRoll.total / 2);
    tokenContent += `
      <div class="pf1 chat-card damage-card damage" data-token-id="${token.document.uuid}">
        <table>
          <thead>
            <tr><th>Damage</th></tr>
          </thead>
          <tbody>
            <tr><td>
              <a class="inline-roll inline-dsn-hidden inline-result" data-roll="${encodedRollData}" data-tooltip="${tooltip}">
                <i class="fas fa-dice-d20"></i> ${damageRoll.total}
              </a>
            </td></tr>
          </tbody>
        </table>
        <div class="flexcol card-buttons">
          <div class="card-button-group flexcol">
            <label>Damage</label>
            <div class="flexrow">
              <button type="button" data-action="applyDamage" data-value="${damageRoll.total}">Apply</button>
              <button type="button" data-action="applyDamage" data-value="${halfDamage}">Apply Half</button>
            </div>
          </div>
        </div>
      </div>`;
  }

  return tokenContent;
}

// Function to choose a random item from the actor's inventory
function chooseRandomItem(actor, types) {
  const items = actor?.items?.filter(item => types.includes(item.type));
  return items?.length ? items[Math.floor(Math.random() * items.length)] : null;
}

// Function to handle private messages
function handlePrivateMessage(actor, token, tokenContent, privateMessages) {
  const activeOwner = actor.activeOwner?.id;
  const gmId = game.users.find(user => user.isGM).id;
  const whisperIds = new Set([activeOwner, gmId]);
  const whisperKey = Array.from(whisperIds).sort().join(',');

  if (!privateMessages[whisperKey]) {
    privateMessages[whisperKey] = {
      content: `<div class="card-content">`,
      whisper: Array.from(whisperIds),
      tokenCount: 0
    };
  }
  privateMessages[whisperKey].content += tokenContent;
  privateMessages[whisperKey].tokenCount += 1;
}

// Function to send private messages
function sendPrivateMessages(privateMessages) {
  Object.values(privateMessages).forEach(message => {
    if (message.tokenCount > 1) {
      message.content = message.content.replace(/<\/div><div class="IC-token"/g, '</div><div style="border-top: 2px solid black; margin: 8px 0;"></div><div class="IC-token"');
    }
    message.content += `</div>`;
    ChatMessage.create({
      content: message.content,
      speaker: { alias: "Confusion Effect" },
      whisper: message.whisper
    });
  });
}

// Event listener for clicking the token image in the chat card
Hooks.on("renderChatMessage", (message, html, data) => {
  if (!game.settings.get('pf1-improved-conditions', 'handleConfused')) return;
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

Hooks.on("pf1PreActionUse", (action) => {
  if (game.settings.get('pf1-improved-conditions', 'handleNauseated') ||
  game.settings.get('pf1-improved-conditions', 'handleEntangledGrappled')) {
    const activationTypes = ["nonaction", "passive", "free", "swift", "immediate", "move", "standard", "full", "attack", "aoo", "round", "minute", "hour", "special"]
    const actionType = action.action.activation?.type;
    const held = action.action.data.held || action.item.system.held;
    const token = action.token;
    const actor = token.actor;

    if (game.settings.get('pf1-improved-conditions', 'handleEntangledGrappled') && actor.statuses.has("grappled") && held === "2h") {
      action.shared.reject=true
      ui.notifications.info(`${token.name} cannot perform this action due to being grappled and it requires two hands.`);
    }

    if (game.settings.get('pf1-improved-conditions', 'handleNauseated') && actor.statuses.has("nauseated") && actionType !== "move") {
      action.shared.reject = true;
      ui.notifications.info(`${token.name} cannot perform this action due to being nauseated and only move actions are allowed.`);
    }

    if (game.settings.get('pf1-improved-conditions', 'handleSqueezing') && actor.statuses.has("squeezing") && (actionType == "attack" || actionType == "aoo")) {
      action.shared.reject = true;
      ui.notifications.info(`${token.name} cannot perform attacks while squeezing.`);
    }
  }
});

Hooks.on('pf1PreActorRollConcentration', (actor, rollContext) => {
  if (game.settings.get('pf1-improved-conditions', 'handleNauseated') && rollContext.token?.actor?.statuses?.has("nauseated")) {
    const token = rollContext.token
    ui.notifications.info(`${token.name} cannot perform this action due to being nauseated and only move actions are allowed.`);
    return false;
  }
});

Hooks.on("pf1PostActionUse", async (action) => {
  if (game.settings.get('pf1-improved-conditions', 'disableAtZeroHP') ||
  game.settings.get('pf1-improved-conditions', 'handleEntangledGrappled')) {
    const itemSource = action.item;
    const token = action.token;
    const actor = token.actor;

    if (game.settings.get('pf1-improved-conditions', 'disableAtZeroHP')) {
      const activationTypes = ["nonaction", "passive", "free", "swift", "immediate", "move", "standard", "full", "attack", "aoo", "round", "minute", "hour", "special"]
      const strenuousTypes = ["standard", "full", "attack", "aoo", "round", "minute", "hour"]
      if (strenuousTypes.includes(action.action?.activation?.type)) {
        if (actor && actor?.statuses?.has("disabled")) {
          let hp = actor.system?.attributes?.hp;
          const conScore = actor.system?.abilities?.con?.total;
          const hardToKill = ["diehard", "ferocity (orc)", "orc ferocity", "ferocity"]
          const ability = actor.items.find(item => hardToKill.some(htk => htk === item.name.toLowerCase()));
          let newHp = hp.value - 1;
          
          if(hp.max > 0 && hp.value == 0 && !actor.statuses.has("unconscious")) {
            handleHTK(ability, newHp, conScore);
          } else if(hp.max > 0 && hp.value < 0 && !actor.statuses.has("unconscious") && hp.value >= (conScore * -1)) {
            handleHTK(ability, newHp, conScore);
          }
        }

        async function handleHTK(ability, newHp, conScore) {
          if (ability && ability.isActive) {
            if (newHp <= (conScore * -1)) {
              actor.update({ "system.attributes.hp.value": newHp });
              actor.setCondition("disabled", false);
              if (!game.settings.get('pf1-improved-conditions', 'applyDeadCondition')) {
                token.toggleEffect(CONFIG.statusEffects.find(e => e.id == "dead"), { overlay: true });
              };
              ui.notifications.info(`${token.name} takes 1 damage for performing a strenuous activity and dies.`);
            } else {
              if (actor.hasPlayerOwner) {
                const playerOwnerId = actor.activeOwner.id;
                const choice = await socket.executeAsUser("promptHTKChoice", playerOwnerId, actor.id);

                if (choice === "fight") {
                    await actor.setFlag('pf1-improved-conditions', 'continueFighting', true);
                    actor.update({ "system.attributes.hp.value": newHp });
                    ui.notifications.info(`${token.name} takes 1 damage for performing a strenuous activity.`);
                } else {
                    await actor.setFlag('pf1-improved-conditions', 'continueFighting', false);
                    actor.setCondition("disabled", false);
                    actor.setCondition("dying", true);
                    actor.update({ "system.attributes.hp.value": newHp });
                    if (!game.settings.get('pf1-improved-conditions', 'unconsciousAtNegativeHP')) {
                      actor.setCondition("unconscious", true);
                    };
                    ui.notifications.info(`${token.name} falls unconscious.`);
                }
              } else {
                ui.notifications.info(`${token.name} takes 1 damage for performing a strenuous activity.`);
              }
            };
          } else {
            actor.update({
              "system.attributes.hp.value": newHp
            });
            ui.notifications.info(`${token.name} takes 1 damage for performing a strenuous activity and falls unconscious.`);
            actor.setCondition("disabled", false);
            actor.setCondition("dying", true)
            if (!game.settings.get('pf1-improved-conditions', 'unconsciousAtNegativeHP')) {
              actor.setCondition("unconscious", true);
            };
          };
        };
      };
    };

    if (game.settings.get('pf1-improved-conditions', 'handleEntangledGrappled')) {
      if (itemSource.type == "spell") {
  
          const handleConcentrationCheck = async (spellbook, skipDialog) => {
              if (actor.statuses.has("entangled")) {
                  await actor.rollConcentration(spellbook, { skipDialog });
              }
  
              if (actor.statuses.has("grappled") && itemSource.system.components?.somatic) {
                  await actor.rollConcentration(spellbook, { skipDialog });
              }
          };
  
          const skipDialog = game.user.isGM;
  
          await handleConcentrationCheck(itemSource.system.spellbook, skipDialog);
      }
  }
  
  };
});

const flatFootedTracker = new Map();

Hooks.on('combatStart', async (combat) => {
  console.log(combat);
  restoreFlatFootedTracker(combat);

  const turnOrder = combat.turns;
  const isSurprise = combat.getFlag('pf1-improved-conditions', 'isSurprise') || false;
  const highestInitiative = Math.max(...combat.combatants.map(c => c.initiative));

  for (const combatant of combat.combatants) {
    const token = canvas.tokens.get(combatant.tokenId);
    if (!token) continue;

    const turnIndex = turnOrder.findIndex(turn => turn.tokenId === combatant.tokenId);

    if (turnIndex !== -1) {
      if (game.settings.get('pf1-improved-conditions', 'autoApplyFF')) {
        await handleFlatFootedOnCombatStart(combat, combatant, token, turnIndex, highestInitiative, isSurprise);
      }

      if (game.settings.get('pf1-improved-conditions', 'handleConfused')) {
        await handleConfusionOnCombatStart(combatant, token, turnOrder);
      }
    }
  }

  updateFlatFootedTracker(combat);
});

async function handleFlatFootedOnCombatStart(combat, combatant, token, turnIndex, highestInitiative, isSurprise) {
  const ffImmunity = ["Uncanny Dodge"];
  const ability = combatant.actor.items.find(item => item.name == ffImmunity);

  if ((!ability && !ability?.isActive) && (isSurprise || combatant.initiative < highestInitiative)) {
    const exemptFromSurprise = token.actor.getFlag('pf1-improved-conditions', 'exemptFromSurprise') || false;

    const isFlatFootedUntilTurn = exemptFromSurprise && combat.current.turn !== turnIndex;

    if (!exemptFromSurprise || isFlatFootedUntilTurn) {
      await token.actor.setCondition("flatFooted", true);
      const isFF = token.actor.statuses.has("flatFooted");
      flatFootedTracker.set(combatant.tokenId, {
        token: token,
        wasFlatFooted: isFF,
        onRound: 1, // Always round 1 during combat start
        onTurn: turnIndex,
      });
    }
  }
}

async function handleConfusionOnCombatStart(combatant, token, turnOrder) {
  const firstTurn = turnOrder[0];
  if (combatant.tokenId !== firstTurn.tokenId) return;

  const actor = token.actor;
  if (!actor || !actor.statuses.has("confused")) return;

  const roll = await new Roll("1d100").roll({async: true});
  const rollResult = roll.total;

  const behaviorData = getBehaviorData(actor, rollResult);
  if (!behaviorData) return;

  const { behavior, damageRoll, encodedRollData, tooltip, itemUsed } = behaviorData;

  let tokenContent = createTokenContent(token, behavior, damageRoll, encodedRollData, tooltip, itemUsed);
  let content = `<div class="card-content">${tokenContent}</div>`;

  await ChatMessage.create({
    content: content,
    speaker: { alias: "Confusion Effect" }
  });
}

Hooks.on('combatTurn', (combat, combatData, options) => {
  handleCombatTurn(combat, combatData);
});

Hooks.on('combatRound', (combat, round) => {
  handleCombatRound(combat, round);
});

function restoreFlatFootedTracker(combat) {
  const trackerData = combat.getFlag('pf1-improved-conditions', 'flatFootedTracker') || {};
  flatFootedTracker.clear();
  for (const [tokenId, data] of Object.entries(trackerData)) {
    flatFootedTracker.set(tokenId, data);
  }
}

// Function to update the flatFootedTracker flag
function updateFlatFootedTracker(combat) {
  const trackerData = Object.fromEntries(flatFootedTracker);
  combat.setFlag('pf1-improved-conditions', 'flatFootedTracker', trackerData);
}

function handleCombatTurn(combat, combatData) {
  if (game.settings.get('pf1-improved-conditions', 'autoApplyFF')) {
    handleFlatFootedCondition(combat, combatData);
  }

  if (game.settings.get('pf1-improved-conditions', 'handleConfused')) {
    handleConfusionCondition(combat, combatData);
  }
}

// Function to handle flat-footed condition logic
function handleFlatFootedCondition(combat, combatData) {
  const combatTurn = combatData.turn; // Gets the combat's turn
  const combatRound = combatData.round; // Gets the combat's round
  const turnOrder = combat.turns; // Gets the combat's turn order (array)

  const currentCombatant = turnOrder[combatTurn - 1]?.tokenId || null; // The current combatant (if exists)
  const nextCombatant = turnOrder[combatTurn]?.tokenId; // The next combatant whose turn it is
  const previousCombatant = turnOrder[combatTurn + 1]?.tokenId || null; // The previous combatant when moving backwards

  const nextToken = canvas.tokens.get(nextCombatant);
  const isFF = nextToken.actor.statuses.has("flatFooted");
  const isSurprise = combat.getFlag('pf1-improved-conditions', 'isSurprise') || false;
  
  const exemptFromSurprise = nextToken.actor.getFlag('pf1-improved-conditions', 'exemptFromSurprise') || false;
  const targetRound = isSurprise ? (exemptFromSurprise ? 1 : 2) : 1;

  if (previousCombatant) {
    const previousToken = canvas.tokens.get(previousCombatant);
    const trackerData = flatFootedTracker.get(previousCombatant);
    
    if (trackerData && trackerData.removalInfo) {
      const { removedOnRound, removedOnTurn } = trackerData.removalInfo;

      if (removedOnRound > combatRound || 
          (removedOnRound === combatRound && removedOnTurn >= combatTurn)) {
        previousToken.actor.setCondition("flatFooted", true);
      }
    }
  }

  if (combatRound === targetRound && combatTurn >= 0) {
    if (nextToken && nextCombatant === turnOrder[combatTurn].tokenId && isFF) {
      nextToken.actor.setCondition("flatFooted", false);

      let trackerData = flatFootedTracker.get(nextCombatant) || {};
      trackerData.removalInfo = {
        removedOnRound: combatRound,
        removedOnTurn: combatTurn
      };
      flatFootedTracker.set(nextCombatant, trackerData);
    } else {
      let trackerData = flatFootedTracker.get(nextCombatant) || {};
      trackerData.wasFlatFooted = false;
      flatFootedTracker.set(nextCombatant, trackerData);
    }
  }

  updateFlatFootedTracker(combat);
}

// Function to handle the logic in combatRound
async function handleCombatRound(combat, round) {
  const turnOrder = combat.turns;
  const combatTurn = round.turn;

  const nextCombatant = turnOrder[combatTurn]?.tokenId;
  const nextToken = canvas.tokens.get(nextCombatant);
  const isFF = nextToken?.actor.statuses.has("flatFooted");
  const isSurprise = combat.getFlag('pf1-improved-conditions', 'isSurprise') || false;
  
  const targetRound = isSurprise ? 2 : 1;

  if (round.round === targetRound && nextToken && isFF) {
    nextToken.actor.setCondition("flatFooted", false);

    let trackerData = flatFootedTracker.get(nextCombatant) || {};
    trackerData.removalInfo = {
      removedOnRound: round.round,
      removedOnTurn: combatTurn
    };
    flatFootedTracker.set(nextCombatant, trackerData);
  }

  const previousCombatant = turnOrder[0]?.tokenId;
  const previousToken = canvas.tokens.get(previousCombatant);

  if (previousToken) {
    const trackerData = flatFootedTracker.get(previousCombatant);
    
    if (trackerData && trackerData.removalInfo) {
      const { removedOnRound, removedOnTurn } = trackerData.removalInfo;

      if (removedOnRound > round.round || 
          (removedOnRound === round.round && removedOnTurn >= combatTurn)) {
        previousToken.actor.setCondition("flatFooted", true);
      }
    }
  }

  if (game.settings.get('pf1-improved-conditions', 'handleConfused')) {
    const firstCombatant = turnOrder[0]?.tokenId;
    const firstToken = canvas.tokens.get(firstCombatant);
  
    if (firstToken) {
      await handleConfusionForFirstToken(firstToken);
    };
  };

  updateFlatFootedTracker(combat);
}

async function handleConfusionForFirstToken(token) {
  const actor = token.actor;
  if (!actor || !actor.statuses.has("confused")) return;

  const roll = await new Roll("1d100").roll({async: true});
  const rollResult = roll.total;

  const behaviorData = getBehaviorData(actor, rollResult);
  if (!behaviorData) return;

  const { behavior, damageRoll, encodedRollData, tooltip, itemUsed } = behaviorData;

  let tokenContent = createTokenContent(token, behavior, damageRoll, encodedRollData, tooltip, itemUsed);
  let content = `<div class="card-content">${tokenContent}</div>`;

  await ChatMessage.create({
    content: content,
    speaker: { alias: "Confusion Effect" }
  });
}

Hooks.on('renderCombatTracker', (app, html, data) => {
  if (!game.settings.get('pf1-improved-conditions', 'autoApplyFF')) return;
  const combatControls = html.find('#combat-controls');

  if (combatControls.length && data.combat?.current?.round === 0) {
    combatControls.css('flex-direction', 'column');

    const surpriseRoundButton = $(`
      <a class="combat-control" aria-label="Surprise Round" role="button">
        Surprise Round
      </a>
    `);

    const beginCombatButton = combatControls.find('a[data-control="startCombat"]');

    if (beginCombatButton.length) {
      beginCombatButton.before(surpriseRoundButton);
    } else {
      combatControls.prepend(surpriseRoundButton);
    }

    const resetExemptFlags = async (combat) => {
      const selectedTokens = canvas.tokens.controlled.map(token => token.id);

      const flagPromises = combat.turns.map(async turn => {
        const tokenId = turn.tokenId;
        const token = canvas.tokens.get(tokenId);

        if (token) {
          const isSelected = selectedTokens.includes(tokenId);
          return token.actor.setFlag('pf1-improved-conditions', 'exemptFromSurprise', isSelected);
        }
      });

      await Promise.all(flagPromises);
    };

    surpriseRoundButton.click(async () => {
      const isSurprise = data.combat?.getFlag('pf1-improved-conditions', 'isSurprise') || false;

      await resetExemptFlags(data.combat);

      if (!isSurprise) {
        await data.combat?.setFlag('pf1-improved-conditions', 'isSurprise', true);
      }
      data.combat?.startCombat();
    });

    combatControls.on('click', 'a[data-control="startCombat"]', async () => {
      const isSurprise = data.combat?.getFlag('pf1-improved-conditions', 'isSurprise') || false;

      await resetExemptFlags(data.combat);

      if (isSurprise) {
        await data.combat?.setFlag('pf1-improved-conditions', 'isSurprise', false);
      }
    });
  }
});

Hooks.on('updateActor', async (actorDocument, change, options, userId) => { 
    if (game.settings.get('pf1-improved-conditions', 'disableAtZeroHP')) {
        const hp = actorDocument.system?.attributes?.hp;
        if (hp.value == 0 && hp.max > 0) {
            actorDocument.setCondition("disabled", true);
        };
    };

    if (game.settings.get('pf1-improved-conditions', 'autoApplyED')) {
      let token = canvas.tokens.placeables.find(t => t.actor.id === actorDocument.id);
      const ed = actorDocument.system?.attributes?.energyDrain;
      const hd = actorDocument.system?.attributes?.hd.total
      if (ed > 0) {
        actorDocument.setCondition("energyDrained", true);
        if (ed >= hd) token.toggleEffect(CONFIG.statusEffects.find(e => e.id == "dead"), { overlay: true });
      } else {
        actorDocument.setCondition("energyDrained", false);
      };
    };

    if (game.settings.get('pf1-improved-conditions', 'unconsciousAtNegativeHP')) {
      const hp = actorDocument.system?.attributes?.hp;
      const continueFighting = await actorDocument.getFlag('pf1-improved-conditions', 'continueFighting');
      if (hp.max > 0 && hp.value < 0 && !continueFighting) {
          actorDocument.setCondition("unconscious", true);
      }
    }

    if (game.settings.get('pf1-improved-conditions', 'applyDeadCondition')) {
      const hp = actorDocument.system?.attributes?.hp;
      const conScore = actorDocument.system?.abilities?.con?.total;
      if (hp.max > 0 && hp.value <= (conScore * -1)) {
          actorDocument.toggleEffect(CONFIG.statusEffects.find(e => e.id == "dead"), { overlay: true });
          ui.notifications.info(`${actorDocument.name} has died due to reaching HP equal to or below their negative Constitution score.`);
      }
  }
});