/**
 * Buff Automation Module for PF1 Improved Conditions
 * Handles automatic application of buffs when spells or consumables are used
 */

import { MODULE } from './config.js';

/**
 * Main function to handle buff automation from the pf1PreActionUse hook
 * @param {Object} action - The action object from the hook
 */
export async function handleBuffAutomation(action) {
  if (action.item.type !== "spell" && action.item.type !== "consumable") return;
  
  const hasTargets = action.shared.targets && action.shared.targets.length > 0;
  
  const rangeUnits = action.action?.range?.units;
  const targetValue = action.action?.target?.value;
  const isSelfTargeting = rangeUnits === "personal" || targetValue === "you";
  
  if (!hasTargets && !isSelfTargeting) {
    const mode = game.settings.get(MODULE.ID, 'buffAutomationMode');
    
    if (mode === "strict") {
      console.warn(`${MODULE.ID} | Buff automation canceled: No targets selected for ${action.item.name}`);
      action.shared.reject = true;
      ui.notifications.warn(`${action.item.name} requires at least one target.`);
      return;
    } else if (mode === "lenient") {
      console.warn(`${MODULE.ID} | Buff automation skipped: No targets selected for ${action.item.name}`);
      ui.notifications.info(`Unable to apply automatic buffs for ${action.item.name} - no targets selected.`);
    }
  }
  
  const matchingBuffs = await findMatchingBuffs(action.item.name);
  
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
      
      let targets = [];
      if (isSelfTargeting) {
        targets = [action.token];
        if (action.shared.targets.length > 0) {
          for (const t of action.shared.targets) {
            if (t.id !== action.token.id) targets.push(t);
          }
        }
      } else {
        targets = action.shared.targets || [];
      }
      
      let filteredTargets = targets;
      const filteringMode = game.settings.get(MODULE.ID, 'buffTargetFiltering');
      
      if (filteringMode === "byDisposition") {
        filteredTargets = targets.filter(target => {
          const targetDisposition = target.document ? target.document.disposition : target.disposition;
          const actionDisposition = action.token.disposition;
          return targetDisposition === actionDisposition;
        });
        
      } else if (filteringMode === "manualSelection") {
        filteredTargets = await promptTargetSelection(targets, action);
      }
      
      await applyBuffToTargets(selectedBuff, filteredTargets, {
        units: durationUnits,
        value: String(durationValue)
      });
    }
  } else {
    console.log(`${MODULE.ID} | No matching buffs found for ${action.item.name}`);
  }
}

/**
 * Categorize buff matches into exact matches, versions (with commas), and variants (with parentheses)
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
    const compendia = [
      "pf1.buffs",
    ];

    // Add PF-Content's Buffs compendium if it exists
    const pfContentBuffs = game.packs.get("pf-content.pf-buffs");
    if (pfContentBuffs) {
      compendia.push("pf-content.pf-buffs");
    }

    const customCompendia = game.settings.get(MODULE.ID, 'customBuffCompendia');
    if (customCompendia && customCompendia.length > 0) {
      customCompendia.forEach(packPath => {
        if (packPath && game.packs.get(packPath)) {
          compendia.push(packPath);
        }
      });
    }

    for (const packKey of compendia) {
      const pack = game.packs.get(packKey);
      if (!pack) {
        console.warn(`${MODULE.ID} | Compendium ${packKey} not found`);
        continue;
      }

      const index = await pack.getIndex();

      const exactMatches = index.filter(i => i.name.toLowerCase() === normalizedName);
      const partialMatches = index.filter(i =>
        i.name.toLowerCase().includes(normalizedName) &&
        !exactMatches.some(em => em._id === i._id)
      );

      for (const entry of exactMatches) {
        const document = await pack.getDocument(entry._id);
        if (document.type !== "buff") continue;
        exactMatches.push({
          name: document.name,
          id: document.id,
          pack: packKey,
          document: document
        });
      }

      for (const entry of partialMatches) {
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
  } catch (error) {
    console.error(`${MODULE.ID} | Error searching for buffs:`, error);
  }

  if (exactMatches.length > 0) {
    return exactMatches;
  }

  return partialMatches;
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
    let content = `<p>Multiple buff options found for <strong>${baseItemName}</strong>. Please select which one to apply:</p>`;
    
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
      title: "Select Buff Variant",
      content: content,
      buttons: {
        select: {
          icon: '<i class="fas fa-check"></i>',
          label: "Select",
          callback: html => {
            const index = Number(html.find('#buff-select').val());
            resolve(buffs[index]);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
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
export async function promptTargetSelection(targets, action) {
  if (!targets || targets.length === 0) return [];
  
  return new Promise(resolve => {
    const spellName = action.item.name;
    let content = `<p>Select which targets should receive <strong>${spellName}</strong>:</p>`;
    
    content += `<div class="target-selection-container" style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc; border-radius: 5px; padding: 10px; margin-top: 10px;">`;
    content += `<div style="display: flex; flex-wrap: wrap; gap: 10px;">`;
    
    targets.forEach((target, index) => {
      const tokenName = target.name || target.actor.name;
      const tokenImg = target.document.texture.src;
      const targetDisposition = target.document.disposition;
      const actionDisposition = action.token.disposition;
      const isSameDisposition = targetDisposition === actionDisposition;
      
      let dispositionName = "Unknown";
      if (targetDisposition === CONST.TOKEN_DISPOSITIONS.NEUTRAL) dispositionName = "Neutral";
      else if (targetDisposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) dispositionName = "Friendly";
      else if (targetDisposition === CONST.TOKEN_DISPOSITIONS.HOSTILE) dispositionName = "Hostile";
      else if (targetDisposition === CONST.TOKEN_DISPOSITIONS.SECRET) dispositionName = "Secret";
      
      content += `
        <div class="target-option" style="text-align: center; width: 100px;">
          <img src="${tokenImg}" style="width: 64px; height: 64px; border: 2px solid ${isSameDisposition ? 'green' : 'red'}; border-radius: 5px;" />
          <div style="margin-top: 5px;">
            <div style="margin-bottom: 3px;">
              <input type="checkbox" id="target-${index}" name="target-${index}" checked>
            </div>
            <div style="margin-bottom: 3px;">
              <label for="target-${index}">${tokenName}</label>
            </div>
            <div style="font-size: 0.8em; color: ${isSameDisposition ? 'green' : 'red'};">${dispositionName}</div>
          </div>
        </div>
      `;
    });
    
    content += `</div></div>`;
    
    const dialog = new Dialog({
      title: "Select Buff Targets",
      content: content,
      buttons: {
        apply: {
          icon: '<i class="fas fa-check"></i>',
          label: "Apply Buff",
          callback: html => {
            const selectedTargets = [];
            targets.forEach((target, index) => {
              if (html.find(`#target-${index}`).prop('checked')) {
                selectedTargets.push(target);
              }
            });
            resolve(selectedTargets);
          }
        },
        cancel: {
          icon: '<i class="fas fa-times"></i>',
          label: "Cancel",
          callback: () => resolve([])
        }
      },
      default: "apply",
      close: () => resolve([])
    });
    
    dialog.render(true);
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
  if (!buff || !targets || targets.length === 0) {
    console.warn(`${MODULE.ID} | Cannot apply buff: Invalid buff or no targets`);
    return;
  }
  
  for (const target of targets) {
    try {
      const actor = target.actor;
      if (!actor) {
        console.warn(`${MODULE.ID} | Cannot apply buff: Target has no actor`);
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
          "system.duration.value": String(duration.value)
        };
        
        if (isActive) {
          await existingBuff.update({"system.active": false});
        }
        
        await existingBuff.update(updateData);
        
        if (isActive) {
          await existingBuff.update({"system.active": true});
        }
        
        ui.notifications.info(`Updated ${buff.name} on ${actor.name}`);
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
        
        ui.notifications.info(`Applied ${buff.name} to ${actor.name}`);
      }
    } catch (error) {
      console.error(`${MODULE.ID} | Error applying buff to ${target.name || target.actor.name}:`, error);
      ui.notifications.error(`Failed to apply ${buff.name} to ${target.name || target.actor.name}`);
    }
  }
}

/**
 * Applies an active effect to a target
 * @param {Object} effect - The effect data to apply
 * @param {Object} target - The target token
 * @returns {Promise<void>}
 */
export async function applyBuff(buff, action) {
  // This is now handled by the applyBuffToTargets function
} 