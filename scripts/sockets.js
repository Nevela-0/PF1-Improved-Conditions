const MODULE = {ID: "pf1-improved-conditions"};
export let socket;

Hooks.once("socketlib.ready", () => {
    socket = socketlib.registerModule(MODULE.ID);
    socket.register("applyImmobilize", applyImmobilize);
    socket.register("sendNotification", sendNotification);
    socket.register("promptHTKChoice", promptHTKChoice);
});

let immobileConditionIds = new Set();
let impairMovementConditionIds = new Set();

export function initializeConditionIds() {
    // Conditions to look for by _id
    const immobileConditions = ["anchored", "cowering", "dazed", "dying", "helpless", "paralyzed", "petrified", "pinned"];
    const impairMovementConditions = ["blind", "disabled", "entangled", "exhausted", "grappled"];

    // Populate the immobileConditionIds set
    pf1.registry.conditions.forEach(condition => {
        if (immobileConditions.includes(condition._id)) {
            immobileConditionIds.add(condition._id);
        }
    });

    // Populate the impairMovementConditionIds set
    pf1.registry.conditions.forEach(condition => {
        if (impairMovementConditions.includes(condition._id)) {
            impairMovementConditionIds.add(condition._id);
        }
    });
}

function hasImmobileCondition(token) {
    // Check if the actor has any of the immobile conditions by _id
    return token.actor.statuses?.some(status => immobileConditionIds.has(status)) ?? false;
}

function applySlowedCondition(actor) {
    // Check if the actor has any of the impairing conditions by _id
    const hasImpairCondition = actor.statuses?.some(status => impairMovementConditionIds.has(status)) ?? false;
    const hasSlowed = actor.statuses.has("slowed");

    if (hasImpairCondition && !hasSlowed) {
        actor.setCondition("slowed", true);
    } else if (!hasImpairCondition && hasSlowed) {
        actor.setCondition("slowed", false);
    }
}

async function applyImmobilize(tokenId, limit) {
    if (!game.settings.get('pf1-improved-conditions', 'restrictMovement')) {
        return true;
    }
    const token = canvas.tokens.get(tokenId);
    if (!token) return;

    const currentLimit = token.document.getFlag(MODULE.ID, 'immobilized');

    if (currentLimit !== undefined) {
        // If the movement limiter is already set, remove it
        await token.document.unsetFlag(MODULE.ID, 'immobilized');
        sendNotificationToOwners(token, "info", "Movement restriction removed from token.");
    } else {
        // If the movement limiter is not set, add it
        await token.document.setFlag(MODULE.ID, 'immobilized', limit);  // Set movement limit to the specified limit
        sendNotificationToOwners(token, "info", `Movement restriction applied to token.`);
    }
}

async function promptHTKChoice(actorId) {
    const actor = game.actors.get(actorId);
    if (!actor) return;

    const content = `<p>${actor.name} has a hard to kill ability. Would you like to continue fighting or fall unconscious?</p>`;
    const options = ["Continue Fighting", "Fall Unconscious"];
    const choice = await new Promise(resolve => {
        new Dialog({
            title: "Hard to Kill Choice",
            content,
            buttons: {
                fight: {
                    label: "Continue Fighting",
                    callback: () => resolve("fight")
                },
                unconscious: {
                    label: "Fall Unconscious",
                    callback: () => resolve("unconscious")
                }
            },
            default: "fight"
        }).render(true);
    });

    return choice;
}

let updatingToken = false;

Hooks.on('preUpdateToken', (tokenDocument, updateData, options, userId) => {
    if (updatingToken) return true; // Prevent recursive calls
    if (!game.settings.get('pf1-improved-conditions', 'restrictMovement')) {
        return true;
    } else {
        const limit = tokenDocument.getFlag(MODULE.ID, 'immobilized');
        if (limit !== undefined || hasImmobileCondition(tokenDocument)) {
            const currentX = tokenDocument.x;
            const currentY = tokenDocument.y;
            const newX = updateData.x !== undefined ? updateData.x : currentX;
            const newY = updateData.y !== undefined ? updateData.y : currentY;
    
            const deltaX = Math.abs(newX - currentX);
            const deltaY = Math.abs(newY - currentY);
            const gridSize = canvas.grid.size;
            const maxMove = gridSize * limit;
            if (deltaX > maxMove || deltaY > maxMove) {
                if (game.user.id === userId) {
                    const limitFeet = limit * 5;
                    socket.executeAsUser("sendNotification", userId, "warn", `This token cannot move more than ${limitFeet} feet.`);
                }
                return false;
            }
        }
    }

    if (!game.settings.get('pf1-improved-conditions', 'blindMovementCheck')) {
        return true;
    } else {
        const token = canvas.tokens.get(tokenDocument.id);
        if (!token) return;
    
        const hasBlindCondition = token.actor.statuses?.some(status => status === "blind") ?? false;
    
        if (hasBlindCondition && (updateData.x !== undefined || updateData.y !== undefined)) {
            new Dialog({
                title: "Blind Movement Check",
                content: `<p>${token.name} is blind and needs to make a DC 10 Acrobatics check to move without falling prone.</p>`,
                buttons: {
                    roll: {
                        label: "Roll Acrobatics",
                        callback: async () => {
                            const roll = await token.actor.rollSkill("acr");
                            if (roll.rolls[0].total >= 10) {
                                // Move the token if the roll is successful
                                updatingToken = true;
                                await token.document.update(updateData);
                                updatingToken = false;
                            } else {
                                // Apply the prone condition if the roll fails
                                token.actor.setCondition("prone", true);
                                return false
                            }
                        }
                    },
                    cancel: {
                        label: "Cancel",
                        callback: () => {}
                    }
                },
                default: "roll"
            }).render(true);
            return false; // Cancel the original movement
        };
    };
});

function sendNotification(type, message) {
    ui.notifications[type](message);
}

function sendNotificationToOwners(token, type, message) {
    if (token.actor.hasPlayerOwner) {
        const owners = game.users.filter(user => user.id == token.actor.activeOwner.id);
        for (let user of owners) {
            if (token.actor.isOwner) {
                socket.executeAsUser("sendNotification", user.id, type, message);
            }
        }
    } else {
        if (game.user.isGM) {
            socket.executeAsUser("sendNotification", game.user.id, type, message);
        }
    }
}

// Hook to apply the movement limiter when certain conditions are toggled
Hooks.on('pf1ToggleActorCondition', async (actor, condition, enabled) => {
    // Use the dynamically populated condition IDs sets
    if (immobileConditionIds.has(condition)) {
        const tokens = actor.getActiveTokens();
        for (const token of tokens) {
            await socket.executeAsGM("applyImmobilize", token.id, enabled ? 0 : null);
        }
    }

    if (impairMovementConditionIds.has(condition)) {
        applySlowedCondition(actor);
    }
});
