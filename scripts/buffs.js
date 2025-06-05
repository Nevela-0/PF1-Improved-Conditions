/**
 * Buff Automation Module for PF1 Improved Conditions
 * Handles automatic application of buffs when spells or consumables are used
 */


import { MODULE } from './config.js';
import { socket } from './sockets.js';

/**
 * Main function to handle buff automation from the pf1PreActionUse hook
 * @param {Object} action - The action object from the hook
 */
export async function handleBuffAutomation(action) {
  if (action.item.type !== "spell" && action.item.type !== "consumable") return;
  
  const modifierNames = game.settings.get(MODULE.ID, 'modifierNames') || {};
  const communalString = modifierNames.communal || 'Communal';
  let searchName = action.item.name;
  let isCommunal = false;
  const communalEndRegex = new RegExp(`(?:,\\s*|\\s*\\(|\\s*\\[|\\s+)${communalString}\\s*(?:\\)|\\])?$`, 'i');
  const communalStartRegex = new RegExp(`^${communalString}[,\s]+`, 'i');

  if (communalStartRegex.test(searchName)) {
    isCommunal = true;
    searchName = searchName.replace(communalStartRegex, '').trim();
  } else if (communalEndRegex.test(searchName)) {
    isCommunal = true;
    searchName = searchName.replace(communalEndRegex, '').trim();
    searchName = searchName.replace(/[\s,]+$/, '').trim();
  }
  
  const hasTargets = action.shared.targets && action.shared.targets.length > 0;
  
  const rangeUnits = action.action?.range?.units;
  const targetValue = action.action?.target?.value;
  const isSelfTargeting = rangeUnits === "personal" || targetValue === "you";
  
  if (!hasTargets && !isSelfTargeting) {
    const mode = game.settings.get(MODULE.ID, 'buffAutomationMode');
    
    if (mode === "strict") {
      console.warn(`${MODULE.ID} | Buff automation canceled: No targets selected for ${action.item.name}`);
      action.shared.reject = true;
      ui.notifications.warn(game.i18n.format('PF1-Improved-Conditions.Buffs.NoTargetsSelected', { name: action.item.name }));
      return;
    } else if (mode === "lenient") {
      console.warn(`${MODULE.ID} | Buff automation skipped: No targets selected for ${action.item.name}`);
      ui.notifications.info(game.i18n.format('PF1-Improved-Conditions.Buffs.UnableToApplyAutomaticBuffs', { name: action.item.name }));
    }
  }
  
  let communalPromptForManual = false;
  let communalIncrement = null;
  let communalTotalDuration = null;
  let communalDurationUnit = null;
  let communalDurationFormula = null;

  if (isCommunal) {
    const communalHandling = game.settings.get(MODULE.ID, 'communalHandling');
    const filteringMode = game.settings.get(MODULE.ID, 'buffTargetFiltering');
    if (communalHandling === 'even') {
      let increment = null;
      let totalDuration = null;
      let durationUnit = action.action?.duration?.units;
      let durationFormula = action.action?.duration?.value;
      let casterLevel = action.shared.rollData?.cl;
      if (typeof durationFormula === 'string' && durationFormula.includes('@cl')) {
        const match = durationFormula.match(/(\d+)\s*\*\s*@cl/i);
        if (match) {
          increment = parseInt(match[1], 10);
          totalDuration = increment * (casterLevel || 0);
        }
      }
      if (increment && totalDuration) {
        communalIncrement = increment;
        communalTotalDuration = totalDuration;
        communalDurationUnit = durationUnit;
        communalDurationFormula = durationFormula;
        communalPromptForManual = true;
      }
    }
  }
  
  if (
    action.item.type === "spell" &&
    !isCommunal &&
    action.shared?.targets?.length > 1
  ) {
    const numTargets = action.shared.targets.length;
    const spellbook = action.item.system.spellbook;
    const spellLevel = action.item.system.level;
    const actor = action.token?.actor;

    const spellbookData = actor?.system?.attributes?.spells?.spellbooks?.[spellbook];
    const spellLevelKey = `spell${spellLevel}`;
    const spellLevelData = spellbookData?.spells?.[spellLevelKey];

    if (spellLevelData) {
      const maxSlots = spellLevelData.max ?? 0;
      const remainingSlots = spellLevelData.value ?? 0;
      const usedSlots = maxSlots - remainingSlots;
      const extraSlotsNeeded = numTargets - 1;
      if (remainingSlots < extraSlotsNeeded + 1) {
        action.shared.reject = true;
        ui.notifications.warn(
          game.i18n.format("PF1-Improved-Conditions.Buffs.NotEnoughSpellSlots", {
            remaining: remainingSlots,
            needed: extraSlotsNeeded + 1
          })
        );
        return false;
      } else {
        action._multiTargetSlotConsumption = {
          spellbook,
          spellLevel,
          spellLevelKey,
          extraSlotsNeeded
        };
      }
    }
  }
  
  const matchingBuffs = await findMatchingBuffs(searchName);
  
  if (matchingBuffs.length > 0) {
    let selectedBuff = null;
    
    const categorizedMatches = categorizeBuffMatches(action.item.name, matchingBuffs);
    
    if (categorizedMatches.exact.length === 1) {
      selectedBuff = categorizedMatches.exact[0];
    } 
    else if (categorizedMatches.variants.length > 0) {
      selectedBuff = await promptBuffSelection(categorizedMatches.variants, action);
    }
    else if (categorizedMatches.versions.length > 0 && categorizedMatches.exact.length === 0) {
      const exactNameMatch = categorizedMatches.versions.find(
        b => b.name.toLowerCase() === action.item.name.toLowerCase()
      );
      
      if (exactNameMatch) {
        selectedBuff = exactNameMatch;
      } else {
        selectedBuff = await promptBuffSelection(categorizedMatches.versions, action);
      }
    }
    else if (matchingBuffs.length > 0) {
      selectedBuff = await promptBuffSelection(matchingBuffs, action);
    }
    
    if (selectedBuff) {
      const casterLevel = action.shared.rollData?.cl;
      
      const durationUnits = action.action?.duration?.units;
      
      const rawDurationValue = action.action?.duration?.value;
      let durationValue;
      
      if (rawDurationValue === "@cl") {
        durationValue = casterLevel;
      } else if (!isNaN(Number(rawDurationValue))) {
        durationValue = Number(rawDurationValue);
      } else if (typeof rawDurationValue === 'string' && rawDurationValue.includes('@cl')) {
        try {
          const formula = rawDurationValue.replace(/@cl/g, casterLevel || 0);
          
          const sanitizedFormula = formula
            .replace(/[^0-9+\-*/().]/g, '')
            .replace(/\s+/g, '');
            
          if (sanitizedFormula) {
            durationValue = new Function(`return ${sanitizedFormula}`)();
          } else {
            durationValue = rawDurationValue;
          }
        } catch (error) {
          console.error(`${MODULE.ID} | Error calculating duration:`, error);
          durationValue = rawDurationValue;
        }
      } else {
        durationValue = rawDurationValue;
      }
      
      let filteredTargets = action.shared.targets || [];
      const filteringMode = game.settings.get(MODULE.ID, 'buffTargetFiltering');
      
      if (filteringMode === "byDisposition") {
        filteredTargets = filteredTargets.filter(target => {
          const targetDisposition = target.document ? target.document.disposition : target.disposition;
          const actionDisposition = action.token.disposition;
          return targetDisposition === actionDisposition;
        });
        
      } else if (filteringMode === "manualSelection") {
        if (communalPromptForManual && communalIncrement && communalTotalDuration) {
          const communalResult = await promptTargetSelection(filteredTargets, action, {
            communal: true,
            increment: communalIncrement,
            total: communalTotalDuration,
            unit: communalDurationUnit
          });
          if (communalResult.length > 0 && communalResult[0].target && communalResult[0].duration !== undefined) {
            for (const entry of communalResult) {
              await applyBuffToTargets(selectedBuff, [entry.target], {
                units: communalDurationUnit,
                value: String(entry.duration)
              });
            }
            return;
          } else {
            filteredTargets = communalResult;
          }
        } else {
          filteredTargets = await promptTargetSelection(filteredTargets, action);
        }
      }

      if (isCommunal && filteredTargets && filteredTargets.length > 0) {
        const communalHandling = game.settings.get(MODULE.ID, 'communalHandling');
        const n = filteredTargets.length;
        if ((durationUnits === 'hour' || durationUnits === 'hours') && Number(durationValue) === 24) {
          const increment = 1;
          const total = 24;
          if (communalHandling === 'prompt') {
            const communalResult = await promptTargetSelection(filteredTargets, action, {
              communal: true,
              increment: increment,
              total: total,
              unit: durationUnits
            });
            if (communalResult.length > 0 && communalResult[0].target && communalResult[0].duration !== undefined) {
              for (const entry of communalResult) {
                await applyBuffToTargets(selectedBuff, [entry.target], {
                  units: durationUnits,
                  value: String(entry.duration)
                });
              }
              return;
            } else {
              filteredTargets = communalResult;
            }
          } else if (communalHandling === 'even') {
            const perTarget = Math.floor(total / n);
            const assignedTotal = perTarget * n;
            if (assignedTotal === total && perTarget > 0) {
              for (const target of filteredTargets) {
                await applyBuffToTargets(selectedBuff, [target], {
                  units: durationUnits,
                  value: String(perTarget)
                });
              }
              return;
            } else {
              const communalResult = await promptTargetSelection(filteredTargets, action, {
                communal: true,
                increment: increment,
                total: total,
                unit: durationUnits
              });
              if (communalResult.length > 0 && communalResult[0].target && communalResult[0].duration !== undefined) {
                for (const entry of communalResult) {
                  await applyBuffToTargets(selectedBuff, [entry.target], {
                    units: durationUnits,
                    value: String(entry.duration)
                  });
                }
                return;
              } else {
                filteredTargets = communalResult;
              }
            }
          }
        } else if (communalIncrement && communalTotalDuration) {
          if (communalHandling === 'prompt') {
            const communalResult = await promptTargetSelection(filteredTargets, action, {
              communal: true,
              increment: communalIncrement,
              total: communalTotalDuration,
              unit: communalDurationUnit
            });
            if (communalResult.length > 0 && communalResult[0].target && communalResult[0].duration !== undefined) {
              for (const entry of communalResult) {
                await applyBuffToTargets(selectedBuff, [entry.target], {
                  units: communalDurationUnit,
                  value: String(entry.duration)
                });
              }
              return;
            } else {
              filteredTargets = communalResult;
            }
          } else if (communalHandling === 'even') {
            const perTarget = Math.floor(communalTotalDuration / n / communalIncrement) * communalIncrement;
            const assignedTotal = perTarget * n;
            if (assignedTotal === communalTotalDuration && perTarget > 0) {
              for (const target of filteredTargets) {
                await applyBuffToTargets(selectedBuff, [target], {
                  units: communalDurationUnit,
                  value: String(perTarget)
                });
              }
              return;
            } else {
              const communalResult = await promptTargetSelection(filteredTargets, action, {
                communal: true,
                increment: communalIncrement,
                total: communalTotalDuration,
                unit: communalDurationUnit
              });
              if (communalResult.length > 0 && communalResult[0].target && communalResult[0].duration !== undefined) {
                for (const entry of communalResult) {
                  await applyBuffToTargets(selectedBuff, [entry.target], {
                    units: communalDurationUnit,
                    value: String(entry.duration)
                  });
                }
                return;
              } else {
                filteredTargets = communalResult;
              }
            }
          }
        }
      }
      
      let targets = [];
      const personalTargeting = game.settings.get(MODULE.ID, 'personalTargeting');
      if (isSelfTargeting) {
        if (personalTargeting === 'deny') {
          targets = [action.token];
        } else {
          targets = [action.token];
          if (action.shared.targets.length > 0) {
            for (const t of action.shared.targets) {
              if (t.id !== action.token.id) targets.push(t);
            }
          }
        }
      } else {
        targets = filteredTargets;
      }
      
      await applyBuffToTargets(selectedBuff, targets, {
        units: durationUnits,
        value: String(durationValue)
      });
    }
  }
}

/**
 * Categorize buff matches into exact matches, versions (with commas), and variants (with parentheses)
 * 
 * @param {String} spellName - The name of the spell or consumable
 * @param {Array} buffs - Array of matching buff items
 * @returns {Object} Object with categorized matches
 */
function categorizeBuffMatches(spellName, buffs) {
  const normalizedSpellName = spellName.toLowerCase();
  const result = {
    exact: [],
    versions: [],
    variants: []
  };
  
  buffs.forEach(buff => {
    const buffName = buff.name.toLowerCase();
    
    if (buffName === normalizedSpellName) {
      result.exact.push(buff);
    } 
    else if (buffName.includes('(') && buffName.includes(')')) {
      result.variants.push(buff);
    } 
    else if (buffName.includes(',')) {
      result.versions.push(buff);
    } 
    else {
      result.exact.push(buff);
    }
  });
  
  return result;
}

/**
 * Search for buffs in compendia that match the given name
 * @param {String} name - The name of the spell or consumable to find matching buffs for
 * @returns {Promise<Array>} Array of matching buff items
 */
export async function findMatchingBuffs(name) {
  if (!game.settings.get(MODULE.ID, 'automaticBuffs')) {
    return [];
  }

  const normalizedName = name.toLowerCase();
  let exactMatches = [];
  let partialMatches = [];

  try {
    const customCompendia = game.settings.get(MODULE.ID, 'customBuffCompendia') || [];
    const useWorldBuffs = customCompendia.includes("__world__");
    const compendia = customCompendia.filter(packPath => packPath && packPath !== "__world__" && game.packs.get(packPath));

    for (const packKey of compendia) {
      const pack = game.packs.get(packKey);
      if (!pack) {
        console.warn(`${MODULE.ID} | Compendium ${packKey} not found`);
        continue;
      }

      const index = await pack.getIndex();

      const exactEntries = index.filter(i => i.name.toLowerCase() === normalizedName);
      const partialEntries = index.filter(i =>
        i.name.toLowerCase().includes(normalizedName) &&
        !exactEntries.some(em => em._id === i._id)
      );

      for (const entry of exactEntries) {
        const document = await pack.getDocument(entry._id);
        if (document.type !== "buff") continue;
        exactMatches.push({
          name: document.name,
          id: document.id,
          pack: packKey,
          document: document
        });
      }

      for (const entry of partialEntries) {
        const document = await pack.getDocument(entry._id);
        if (document.type !== "buff") continue;
        partialMatches.push({
          name: document.name,
          id: document.id,
          pack: packKey,
          document: document
        });
      }
    }

    let worldExactMatches = [];
    let worldPartialMatches = [];
    if (useWorldBuffs) {
      const worldBuffs = game.items.filter(item => item.type === "buff");
      worldExactMatches = worldBuffs.filter(item => item.name.toLowerCase() === normalizedName).map(item => ({
        name: item.name,
        id: item.id,
        pack: null,
        document: item
      }));
      worldPartialMatches = worldBuffs.filter(item =>
        item.name.toLowerCase().includes(normalizedName) &&
        !worldExactMatches.some(em => em.id === item.id)
      ).map(item => ({
        name: item.name,
        id: item.id,
        pack: null,
        document: item
      }));
    }

    if (exactMatches.length > 0 || worldExactMatches.length > 0) {
      return [...exactMatches, ...worldExactMatches];
    }

    if (partialMatches.length > 0 || worldPartialMatches.length > 0) {
      return [...partialMatches, ...worldPartialMatches];
    }

    function normalizeTokens(str) {
      return str
        .toLowerCase()
        .replace(/[,()]/g, '')
        .split(/\s+/)
        .filter(Boolean)
        .sort()
        .join(' ');
    }

    const normalizedSpellTokens = normalizeTokens(name);

    for (const packKey of compendia) {
      const pack = game.packs.get(packKey);
      if (!pack) continue;
      const index = await pack.getIndex();
      for (const entry of index) {
        const buffTokens = normalizeTokens(entry.name);
        if (buffTokens === normalizedSpellTokens) {
          const document = await pack.getDocument(entry._id);
          if (document.type === "buff") {
            return [{
              name: document.name,
              id: document.id,
              pack: packKey,
              document: document
            }];
          }
        }
      }
    }
    
    if (useWorldBuffs) {
      const worldBuffs = game.items.filter(item => item.type === "buff");
      for (const item of worldBuffs) {
        const buffTokens = normalizeTokens(item.name);
        if (buffTokens === normalizedSpellTokens) {
          return [{
            name: item.name,
            id: item.id,
            pack: null,
            document: item
          }];
        }
      }
    }
  } catch (error) {
    console.error(`${MODULE.ID} | Error searching for buffs:`, error);
  }

  return [];
}

/**
 * Prompt the user to select a buff variant when multiple matches are found
 * @param {Array} buffs - Array of matching buff items
 * @param {Object} action - The action that triggered the buff search
 * @returns {Promise<Object|null>} The selected buff or null if cancelled
 */
export async function promptBuffSelection(buffs, action) {
  if (!buffs || buffs.length === 0) return null;
  if (buffs.length === 1) return buffs[0];
  
  return new Promise(resolve => {
    const baseItemName = action.item.name;
    let content = `<p>${game.i18n.format('PF1-Improved-Conditions.Buffs.MultipleBuffOptionsFound', { name: baseItemName })}</p>`;
    
    content += `<div class="form-group"><select id="buff-select" name="buff-select" style="width: 100%;">`;
    
    buffs.forEach((buff, index) => {
      let displayName = buff.name;
      const match = buff.name.match(/\((.*?)\)/);
      
      if (match) {
        displayName = match[1];
      } else if (buff.name.includes(',')) {
        displayName = buff.name;
      }
      
      const pack = game.packs.get(buff.pack);
      let packName = buff.pack;
      
      if (pack) {
        const label = pack.metadata.label;
        if (label && label.includes('.')) {
          packName = game.i18n.localize(label);
        } else {
          packName = label;
        }
      }
      
      content += `<option value="${index}">${displayName} (${packName})</option>`;
    });
    
    content += `</select></div>`;
    
    const dialog = new Dialog({
      title: game.i18n.localize('PF1-Improved-Conditions.Buffs.SelectBuffVariant'),
      content: content,
      buttons: {
        select: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('PF1-Improved-Conditions.Buffs.Select'),
          callback: html => {
            let selectedIndex;
            if (typeof html.find === 'function') {
              selectedIndex = Number(html.find('#buff-select').val());
            } else {
              const select = html.querySelector('#buff-select');
              selectedIndex = select ? Number(select.value) : 0;
            }
            resolve(buffs[selectedIndex]);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('PF1-Improved-Conditions.Common.Cancel'),
          callback: () => resolve(null)
        }
      },
      default: "select",
      close: () => resolve(null)
    });
    
    dialog.render(true);
  });
}

/**
 * Prompt the user to select which targets should receive the buff
 * @param {Array} targets - Array of potential target tokens
 * @param {Object} action - The action that triggered the buff
 * @returns {Promise<Array>} Array of selected target tokens
 */
export async function promptTargetSelection(targets, action, communalOptions = null) {
  if (!targets || targets.length === 0) return [];
  
  if (!communalOptions || !communalOptions.communal) {
    return new Promise(resolve => {
      const spellName = action.item.name;
      let content = `<p>${game.i18n.format('PF1-Improved-Conditions.Buffs.SelectTargets', { name: spellName })}</p>`;
      
      content += `<div class="target-selection-container" style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-top: 10px;">`;
      content += `<div style="display: flex; flex-wrap: wrap; gap: 10px;">`;
      
      targets.forEach((target, index) => {
        const tokenName = target.name || target.actor.name;
        const tokenImg = target.document?.texture?.src || target.texture?.src;
        const targetDisposition = target.document?.disposition || target?.disposition;
        const actionDisposition = action.token?.disposition;
        const isSameDisposition = targetDisposition === actionDisposition;
        
        let dispositionName = "Unknown";
        if (targetDisposition === CONST.TOKEN_DISPOSITIONS.NEUTRAL) dispositionName = "Neutral";
        else if (targetDisposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) dispositionName = "Friendly";
        else if (targetDisposition === CONST.TOKEN_DISPOSITIONS.HOSTILE) dispositionName = "Hostile";
        else if (targetDisposition === CONST.TOKEN_DISPOSITIONS.SECRET) dispositionName = "Secret";
        
        content += `
          <div class="target-option" style="display: flex; flex-direction: column; align-items: center; width: 100px;">
            <img src="${tokenImg}" style="width: 64px; height: 64px; border: 2px solid ${isSameDisposition ? 'green' : 'red'}; border-radius: 5px;" />
            <input type="checkbox" id="target-${index}" name="target-${index}" checked style="margin: 6px 0 3px 0;" />
            <label for="target-${index}" style="margin-bottom: 3px;">${tokenName}</label>
            <div style="font-size: 0.8em; color: ${isSameDisposition ? 'green' : 'red'};">${dispositionName}</div>
          </div>
        `;
      });
      
      content += `</div></div>`;
      
      const dialog = new Dialog({
        title: game.i18n.localize('PF1-Improved-Conditions.Buffs.SelectBuffTargets'),
        content: content,
        buttons: {
          apply: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize('PF1-Improved-Conditions.Buffs.ApplyBuff'),
            callback: html => {
              const selectedTargets = [];
              targets.forEach((target, index) => {
                let isChecked;
                if (typeof html.find === 'function') {
                  isChecked = html.find(`#target-${index}`).prop('checked');
                } else {
                  const checkbox = html.querySelector(`#target-${index}`);
                  isChecked = checkbox ? checkbox.checked : false;
                }
                if (isChecked) {
                  selectedTargets.push(target);
                }
              });
              resolve(selectedTargets);
            }
          },
          cancel: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize('PF1-Improved-Conditions.Common.Cancel'),
            callback: () => resolve([])
          }
        },
        default: "apply",
        close: () => resolve([])
      });
      
      dialog.render(true);
    });
  }

  const increment = communalOptions.increment;
  const total = communalOptions.total;
  const unit = communalOptions.unit;
  const n = targets.length;
  let perTarget = Math.floor(total / n / increment) * increment;
  let assigned = Array(n).fill(perTarget);
  let assignedTotal = perTarget * n;
  let remaining = total - assignedTotal;
  for (let i = 0; i < n && remaining >= increment; i++) {
    assigned[i] += increment;
    remaining -= increment;
    assignedTotal += increment;
  }

  return new Promise(resolve => {
    let content = `<p>Total available duration: <b>${total} ${unit || ''}</b></p>`;
    content += `<div class="target-selection-container" style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-top: 10px;">`;
    content += `<div style="display: flex; flex-wrap: wrap; gap: 10px;">`;
    targets.forEach((target, index) => {
      const tokenName = target.name || target.actor.name;
      const tokenImg = target.document?.texture?.src || target.texture?.src;
      content += `
        <div class="target-option" style="display: flex; flex-direction: column; align-items: center; width: 120px;">
          <div style="font-weight: bold; margin-bottom: 2px;">
            <span id="duration-${index}">${assigned[index]}</span> ${unit || ''}
          </div>
          <div style="display: flex; flex-direction: row; align-items: center; margin-bottom: 2px;">
            <button type="button" class="communal-down" data-index="${index}" style="width: 24px; height: 24px;">-</button>
            <button type="button" class="communal-up" data-index="${index}" style="width: 24px; height: 24px; margin-left: 4px;">+</button>
          </div>
          <img src="${tokenImg}" style="width: 64px; height: 64px; border: 2px solid #888; border-radius: 5px;" />
          <label style="margin-bottom: 3px;">${tokenName}</label>
        </div>
      `;
    });
    content += `</div></div>`;
    content += `<div style="margin-top: 10px;">Unassigned duration: <b><span id="unassigned">${total - assigned.reduce((a, b) => a + b, 0)}</span> ${unit || ''}</b></div>`;

    const dialog = new Dialog({
      title: game.i18n.localize('PF1-Improved-Conditions.Buffs.SelectBuffTargets'),
      content: content,
      buttons: {
        apply: {
          icon: '<i class="fas fa-check"></i>',
          label: game.i18n.localize('PF1-Improved-Conditions.Buffs.ApplyBuff'),
          callback: html => {
            resolve(targets.map((t, i) => ({ target: t, duration: assigned[i] })));
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: game.i18n.localize('PF1-Improved-Conditions.Common.Cancel'),
          callback: () => resolve([])
        }
      },
      default: "apply",
      close: () => resolve([])
    }, { width: Math.max(400, n * 140) });

    dialog.render(true);
    Hooks.once('renderDialog', (app, html) => {
      html.find('.communal-up').on('click', function() {
        const idx = Number(this.dataset.index);
        if ((assigned.reduce((a, b) => a + b, 0) + increment) <= total) {
          assigned[idx] += increment;
          html.find(`#duration-${idx}`).text(assigned[idx]);
          html.find('#unassigned').text(total - assigned.reduce((a, b) => a + b, 0));
        }
      });
      html.find('.communal-down').on('click', function() {
        const idx = Number(this.dataset.index);
        if (assigned[idx] - increment >= 0) {
          assigned[idx] -= increment;
          html.find(`#duration-${idx}`).text(assigned[idx]);
          html.find('#unassigned').text(total - assigned.reduce((a, b) => a + b, 0));
        }
      });
    });
  });
}

/**
 * Apply a buff to appropriate targets
 * @param {Object} buff - The buff item to apply
 * @param {Array} targets - Array of target tokens
 * @param {Object} duration - The duration information for the buff
 * @returns {Promise<void>}
 */
export async function applyBuffToTargets(buff, targets, duration) {
  if (!game.user.isGM) {
    await socket.executeAsGM(
      "applyBuffToTargetsSocket",
      { name: buff.name, id: buff.id, pack: buff.pack },
      targets.map(t => t.id),
      duration
    );
    return;
  }
  
  if (!buff || !targets || targets.length === 0) {
    console.warn(`${MODULE.ID} | Cannot apply buff: Invalid buff or no targets`);
    return;
  }
  
  for (const target of targets) {
    try {
      // Get the target actor
      const actor = target.actor;
      if (!actor) {
        console.warn(`${MODULE.ID} | Target has no actor, skipping buff application`);
        continue;
      }
      const existingBuff = actor.items.find(item => {
        const nameMatch = item.type === "buff" && item.name === buff.name;
        
        if (nameMatch && item._stats?.compendiumSource && buff.pack) {
          const parts = item._stats.compendiumSource.split('.');
          
          const itemIndex = parts.findIndex(part => part === "Item");
          
          if (itemIndex > 1) {
            const sourcePackId = parts.slice(1, itemIndex).join('.');
            return sourcePackId === buff.pack;
          }
          
          return nameMatch;
        }
        
        return nameMatch;
      });
      
      if (existingBuff) {
        const isActive = existingBuff.isActive;
        
        const updateData = {
          "system.duration.units": duration.units,
          "system.duration.value": String(duration.value) // Ensure it's a string
        };
        
        if (isActive) {
          await existingBuff.update({"system.active": false});
        }
        
        await existingBuff.update(updateData);
        
        if (isActive) {
          await existingBuff.update({"system.active": true});
        }
        
        ui.notifications.info(game.i18n.format('PF1-Improved-Conditions.Buffs.UpdatedExisting', { name: buff.name, actor: actor.name }));
      } else {
        const buffData = buff.document.toObject();
        
        if (duration && duration.units) {
          buffData.system = buffData.system || {};
          buffData.system.duration = buffData.system.duration || {};
          buffData.system.duration.units = duration.units;
          buffData.system.duration.value = String(duration.value);
        }
        
        const newItems = await actor.createEmbeddedDocuments("Item", [buffData]);
        
        if (newItems && newItems.length > 0) {
          const newBuff = newItems[0];
          await newBuff.update({"system.active": true});
        }
        
        ui.notifications.info(game.i18n.format('PF1-Improved-Conditions.Buffs.Applied', { name: buff.name, actor: actor.name }));
      }
    } catch (error) {
      console.error(`${MODULE.ID} | Error applying buff to target:`, error);
      ui.notifications.error(game.i18n.format('PF1-Improved-Conditions.Buffs.FailedToApply', { name: buff.name, error: error.message }));
    }
  }
}