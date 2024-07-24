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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.anchored"),
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.disabled"),
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
              name: "Energy Drained",
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.dying"),
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.fascinated"),
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.flatFooted"),
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.immobilized"),
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.petrified"),
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.slowed"),
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.stable"),
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
              name: game.i18n.localize("PF1-Improved-Conditions.Conditions.unconscious"),
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
	t.conditions.anchored = 'Fixed to a particular location.<br><br>Cannot be moved by any external force, including spells like telekinesis.<br><br>Cannot perform actions requiring movement.<br>Can still attack or cast spells if they do not involve changing position.';
	t.conditions.disabled = 'Character with 0 or stable negative hit points.<br><br>Can take a single move or standard action each round (but not both).<br>Moves at half speed.<br><br>Standard actions deal 1 damage after completion, risking negative hit points and dying.<br><br>Can take swift, immediate, and free actions.<br><br>Recovers hit points naturally if helped.<br>Otherwise, DC 10 Constitution check after 8 hours rest to start natural recovery.<br>Penalty on check equals negative hit point total.<br><br>Failure causes 1 hit point loss but does not cause unconsciousness.';
	t.conditions.energyDrained = 'Gains one or more negative levels.<br><br>Each negative level:<br>- Cumulative -1 penalty on ability checks, attack rolls, CMB, CMD, saves, and skill checks.<br>- Reduces current and total HP by 5.<br>- Treated as one level lower for level-dependent variables (e.g., spellcasting).<br><br>If negative levels equal Hit Dice, the character dies.<br><br>Temporary energy drains:<br>- New save each day to remove (DC same as original effect).<br><br>Permanent energy drains:<br>- No daily save to remove.<br>- Can be removed by spells like restoration.<br>- Remain after revival.<br>- Must be removed for effective revival if they equal Hit Dice.<br><br>Energy drain is not a death effect.<br>Death ward grants immunity to energy drain and suspends penalties while active.';
	t.conditions.dying = 'Unconscious and near death.<br><br>Negative hit points and not stabilized.<br><br>Can take no actions.<br><br>On next turn after being reduced to negative hit points, and all subsequent turns:<br>- DC 10 Constitution check to become stable.<br>- Penalty on roll equals negative hit point total.<br>- Natural 20 is an automatic success.<br>- Failure results in losing 1 hit point.<br><br>Stable characters do not need to make this check.<br><br>If negative hit points equal Constitution score, the character dies.';
	t.conditions.fascinated = 'Entranced by a supernatural or spell effect.<br><br>Stands or sits quietly, taking no actions other than paying attention to the effect.<br><br>-4 penalty on skill checks made as reactions (e.g., Perception checks).<br><br>Any potential threat (e.g., hostile creature approaching) allows a new saving throw.<br>Any obvious threat (e.g., drawing a weapon, casting a spell, aiming a ranged weapon) automatically breaks the effect.<br><br>An ally can shake the fascinated creature free as a standard action.';
	t.conditions.flatFooted = 'Has not yet acted during combat.<br><br>Loses Dexterity bonus to AC and CMD.<br>Cannot make attacks of opportunity, unless having Combat Reflexes feat or Uncanny Dodge class ability.<br><br>Characters with Uncanny Dodge retain Dexterity bonus to AC and can make attacks of opportunity before acting in the first round.<br><br>Cannot take immediate actions while flat-footed.';
	t.conditions.immobilized = 'Unable to move from current location.<br><br>Cannot take any move actions.<br>Cannot reposition itself.<br><br>Can still perform actions that do not require movement (e.g., attacking, casting spells).';
	t.conditions.petrified = 'Turned to stone and considered unconscious.<br><br>If cracked or broken, but pieces are joined with the body upon returning to flesh, the character is unharmed.<br><br>If the petrified body is incomplete when returning to flesh, the body remains incomplete, resulting in permanent hit point loss and/or debilitation.';
	t.conditions.slowed = 'Movement is significantly hindered.<br><br>Movement speed is typically reduced by half.<br><br>May take fewer actions per turn, often limited to one standard action or move action.';
	t.conditions.stable = 'No longer dying but still unconscious.<br><br>Stopped losing hit points each round while still having negative hit points.<br><br>If stabilized by aid (e.g., Heal check or magical healing), no longer loses hit points.<br><br>Can make a DC 10 Constitution check each hour to become conscious and disabled (penalty equals negative hit point total).<br><br>If stabilized without aid, still at risk of losing hit points.<br>Can make a Constitution check each hour to become stable (as if received aid), but each failed check causes 1 hit point loss.';
	t.conditions.unconscious = 'Knocked out and helpless.<br><br>Can result from having negative hit points (but not more than the creature’s Constitution score) or from nonlethal damage exceeding current hit points.';
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
          behavior = "acts normally";
        } else if (rollResult <= 50) {
          behavior = "does nothing but babble incoherently";
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
            "their fists";

          behavior = itemUsed ? 
            `draws their ${itemDescription} and inflicts ${damageRoll.total} points of damage to themselves with it.` : 
            `strikes themselves in the face with ${itemDescription}, causing ${damageRoll.total} points of bludgeoning damage.`;
        } else {
          behavior = "attacks the nearest creature";
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