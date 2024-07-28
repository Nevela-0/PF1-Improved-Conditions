import './config.js';
import { socket } from './sockets.js';

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
          key: "disabled",
          value: {
              journal: "Compendium.pf1.pf1e-rules.JournalEntry.NSqfXaj4MevUR2uJ.JournalEntryPage.dtHHibCiKZzdjyvp",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Disabled.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/disabled.png",
              track: ""
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
          key: "dying",
          value: {
              journal: "Compendium.pf1.pf1e-rules.JournalEntry.NSqfXaj4MevUR2uJ.JournalEntryPage.zG6xEGMIerpbnND0",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Dying.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/dying.png",
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
          key: "flatFooted",
          value: {
              journal: "Compendium.pf1.pf1e-rules.JournalEntry.NSqfXaj4MevUR2uJ.JournalEntryPage.eSvkrrl3US7RJTai",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.FlatFooted.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/flat-footed.png",
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
          key: "petrified",
          value: {
              journal: "Compendium.pf1.pf1e-rules.JournalEntry.NSqfXaj4MevUR2uJ.JournalEntryPage.ayGQWwbrhAc99pkH",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: ["loseDexToAC"]
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Petrified.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/petrified.png",
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
      },
      {
          namespace: "pf1-improved-conditions",
          key: "stable",
          value: {
              journal: "Compendium.pf1.pf1e-rules.JournalEntry.NSqfXaj4MevUR2uJ.JournalEntryPage.krgVb43Vd62dqpYr",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Stable.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/stable.png",
              track: ""
          }
      },
      {
          namespace: "pf1-improved-conditions",
          key: "unconscious",
          value: {
              journal: "Compendium.pf1.pf1e-rules.JournalEntry.NSqfXaj4MevUR2uJ.JournalEntryPage.kHwbZ38VHCa1wkUF",
              flags: {},
              mechanics: {
                  changes: [],
                  flags: []
              },
              name: game.i18n.localize("PF1-Improved-Conditions.Unconscious.label"),
              showInAction: true,
              showInDefense: true,
              texture: "modules/pf1-improved-conditions/icons/unconscious.png",
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

Hooks.on('little-helper.i18n', (t) => {
	t.conditions.anchored = "PF1-Improved-Conditions.Anchored.description";
	t.conditions.disabled = "PF1-Improved-Conditions.Disabled.description";
	t.conditions.energyDrained = "PF1-Improved-Conditions.EnergyDrained.description";
	t.conditions.dying = "PF1-Improved-Conditions.Dying.description";
	t.conditions.flatFooted = "PF1-Improved-Conditions.FlatFooted.description";
	t.conditions.immobilized = "PF1-Improved-Conditions.Immobilized.description";
	t.conditions.petrified = "PF1-Improved-Conditions.Petrified.description";
	t.conditions.slowed = "PF1-Improved-Conditions.Slowed.description";
	t.conditions.stable = "PF1-Improved-Conditions.Stable.description";
	t.conditions.unconscious = "PF1-Improved-Conditions.Unconscious.description";
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

Hooks.on("updateWorldTime", function(worldTime, dt) {
  if (!game.settings.get('pf1-improved-conditions', 'handleConfused')) return;
  const tokens = canvas.tokens.placeables;
  let content = `<div class="card-content">`;
  let hasContent = false;

  const privateMessages = {};
  const tokenContents = [];
  let encodedRollData;
  let tooltip;

  tokens.forEach(token => {
    const actor = token.actor;
    if (actor && actor.statuses.some(effect => effect === "confused")) {
      const confusedEffects = actor.effects.filter(effect => effect.name == "Confused");

      confusedEffects.forEach(effect => {
        const startTime = effect.duration.startTime;
        if ((worldTime - startTime) % 6 !== 0) return;

        const roll = new Roll("1d100").roll({async: false});
        const rollResult = roll.total;

        let behavior;
        let damageRoll = null;
        let damageType = "bludgeoning";
        let itemUsed = null;

        const items = token.actor.items.filter(item => item.type === "weapon" || item.type === "attack");

        function chooseRandomItem(items) {
          return items[Math.floor(Math.random() * items.length)];
        }

        const weaponItems = items.filter(item => item.type === "weapon" && item.system.equipped);
        if (weaponItems.length > 0) {
          const weapon = chooseRandomItem(weaponItems);
          itemUsed = weapon;
          damageType = [...weapon.system.actions[0].damage.parts[0].type.values, weapon.system.actions[0].damage.parts[0].type.custom].join(", ");
        } else {
          const attackItems = items.filter(item => item.type === "attack");
          if (attackItems.length > 0) {
            const attack = chooseRandomItem(attackItems);
            itemUsed = attack;
            damageType = [...attack.system.actions[0].damage.parts[0].type.values, attack.system.actions[0].damage.parts[0].type.custom].join(", ");
          }
        }

        if (rollResult <= 25) {
          // acts normally
          behavior = game.i18n.localize("PF1-Improved-Conditions.Confused.Effects.1");
        } else if (rollResult <= 50) {
          // does nothing
          behavior = game.i18n.localize("PF1-Improved-Conditions.Confused.Effects.2");
        } else if (rollResult <= 75) {
          const strMod = actor.system.abilities.str.mod;
          damageRoll = new Roll(`1d8 + ${strMod}`).roll({async: false});

          const rollData = {
            class: "DamageRoll",
            options: {
              damageType: {
                values: [damageType],
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
          encodedRollData = encodeURIComponent(JSON.stringify(rollData));
          tooltip = `1d8 + ${strMod}[Strength]`;

          const itemDescription = itemUsed ? 
            (itemUsed.system.baseTypes && itemUsed.system.baseTypes.length > 0 ? 
              itemUsed.system.baseTypes[0].toLowerCase() : itemUsed.name.toLowerCase()) : 
            // "Their Fists to be removed as it's covered in localization now"
              "their fists"; 

          behavior = itemUsed ? 
            // Weapon available 
            game.i18n.format("PF1-Improved-Conditions.Confused.Effects.3a", {itemName: itemDescription, damage: damageRoll.total}) :
            // No weapon available 
            game.i18n.format("PF1-Improved-Conditions.Confused.Effects.3b", {damage: damageRoll.total}) ;
        } else {
          // Attack nearest target
          behavior = game.i18n.localize("PF1-Improved-Conditions.Confused.Effects.4");
        }

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

        const isHiddenOrInvisible = token.document.hidden || actor.statuses.has("invisible");
        if (isHiddenOrInvisible && (actor.hasPlayerOwner || actor.activeOwner?.active)) {
          const activeOwner = actor.activeOwner.id;
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
        } else {
          tokenContents.push(tokenContent);
          hasContent = true;
        }
      });
    }
  });

  if (tokenContents.length > 1) {
    content += tokenContents.join('<div style="border-top: 2px solid black; margin: 8px 0;"></div>');
  } else if (tokenContents.length === 1) {
    content += tokenContents[0];
  }
  content += `</div>`;

  if (hasContent && content.trim() !== `<div class="card-content"></div>`) {
    ChatMessage.create({
      content: content,
      speaker: { alias: "Confusion Effect" }
    });
  }

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
});

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

    if (game.settings.get('pf1-improved-conditions', 'handleEntangledGrappled') && actor.statuses.has("grappled") && held !== "2h") {
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
        if (actor && actor?.statuses?.some(effect => effect === "disabled")) {
          let hp = actor.system?.attributes?.hp;
          const conScore = actor.system?.abilities?.con?.total;
          const hardToKill = ["diehard", "ferocity (orc)", "orc ferocity", "ferocity"]
          const ability = actor.items.find(item => hardToKill.some(htk => htk === item.name.toLowerCase()));
          let newHp = hp.value - 1;
          
          if(hp.value == 0 && actor.statuses.some(effect => effect !== "unconcsious")) {
            handleHTK(ability, newHp, conScore);
          } else if(hp.value < 0 && actor.statuses.some(effect => effect !== "unconcsious") && hp.value >= (conScore * -1)) {
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
  
        const handleConcentrationCheck = async (spellbook) => {
            if (actor.statuses.has("entangled")) {
                await actor.rollConcentration(spellbook, { skipDialog: true });
            }
  
            if (actor.statuses.has("grappled") && itemSource.system.components?.somatic) {
                await actor.rollConcentration(spellbook, { skipDialog: true });
            }
        };
  
        if (actor.hasPlayerOwner && !actor.activeOwner.isGM) {
            const playerOwnerId = actor.activeOwner.id;
            await socket.executeAsUser("requestConcentrationCheck", playerOwnerId, actor.id, itemSource.system.spellbook, itemSource);
        } else {
            await handleConcentrationCheck(itemSource.system.spellbook);
        };
      };
    };
  };
});

Hooks.on('combatStart', (combat) => {
  const highestInitiative = Math.max(...combat.combatants.map(c => c.initiative));

  combat.combatants.forEach(combatant => {
    if (combatant.initiative < highestInitiative) {
      const ffImmunity = ["Uncanny Dodge"]
      const ability = combatant.actor.items.find(item => item.name == ffImmunity)
      if (!ability && !ability?.isActive) {
        combatant.actor.setCondition("flatFooted", true);
      };
    };
  });
});

const removedFlatFooted = new Map();
let previousToken;
let previousTurn;

Hooks.on('combatTurn', (combat, combatData, options) => {
  const combatTurn = combatData.turn; // Gets the combat's turn
  const combatRound = combatData.round; // Gets the combat's round
  const turnOrder = combat.turns; // Gets the combat's turn order (array)
  const currentCombatant = turnOrder[combatTurn].tokenId; // Gets the token id of the combatant of the current turn
  const token = canvas.tokens.get(currentCombatant);  // Gets the token data
  const isFF = token.actor.statuses.some(effect => effect == "flatFooted") // Gets the token's flat-footed status if it exists

  if (combatRound == 1 && combatTurn > 0 && (previousTurn == undefined || previousTurn < combatTurn)) {
      previousTurn = combatTurn;
      if (token && currentCombatant == turnOrder[combatTurn].tokenId && isFF) {
          token.actor.setCondition("flatFooted", false);
          removedFlatFooted.set(currentCombatant, { token, wasFlatFooted: true });
          previousToken = token;
      } else {
        removedFlatFooted.set(currentCombatant, { token, wasFlatFooted: false });
        previousToken = token;
      }
  } else if (combatRound == 1 && previousTurn >= combatTurn) {
      previousTurn = combatTurn;
      if (previousToken && removedFlatFooted.get(previousToken.id).wasFlatFooted) {
          previousToken.actor.setCondition("flatFooted", true);
          removedFlatFooted.delete(previousToken.id);
          previousToken = token;
      } else {
        removedFlatFooted.delete(previousToken.id);
        previousToken = token;
      }
  }
});

Hooks.on('updateActor', async (actorDocument, change, options, userId) => { 
    if (game.settings.get('pf1-improved-conditions', 'disableAtZeroHP')) {
        const hp = actorDocument.system?.attributes?.hp;
        if (hp.value == 0) {
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
      if (hp.value < 0 && !continueFighting) {
          actorDocument.setCondition("unconscious", true);
      }
    }

    if (game.settings.get('pf1-improved-conditions', 'applyDeadCondition')) {
      const hp = actorDocument.system?.attributes?.hp;
      const conScore = actorDocument.system?.abilities?.con?.total;
      if (hp.value <= (conScore * -1)) {
          actorDocument.toggleEffect(CONFIG.statusEffects.find(e => e.id == "dead"), { overlay: true });
          ui.notifications.info(`${actorDocument.name} has died due to reaching HP equal to or below their negative Constitution score.`);
      }
  }
});