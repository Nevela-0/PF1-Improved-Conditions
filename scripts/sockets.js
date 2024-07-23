const MODULE = {ID: "pf1-improved-conditions"};
export let socket;

Hooks.once("socketlib.ready", () => {
    socket = socketlib.registerModule(MODULE.ID);
    socket.register("applyImmobilize", applyImmobilize);
    socket.register("sendNotification", sendNotification);
    socket.register("requestConcentrationCheck", requestConcentrationCheck);
    socket.register("promptHTKChoice", promptHTKChoice);
});

const immobileConditions = ["anchored", "cowering", "dazed", "dying", "helpless", "paralyzed", "petrified", "pinned"];
const impairMovementConditions = ["blind", "disabled", "entangled", "exhausted"];

function hasImmobileCondition(token) {
    return token.actor.statuses?.some(status => immobileConditions.includes(status)) ?? false;
}

function applySlowedCondition(actor) {
    const hasImpairCondition = actor.statuses?.some(status => impairMovementConditions.includes(status)) ?? false;
    const hasSlowed = actor.statuses?.some(status => status === "slowed") ?? false;

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
        await token.document.unsetFlag(MODULE.ID, 'immobilized');
        sendNotificationToOwners(token, "info", "Movement restriction removed from token.");
    } else {
        await token.document.setFlag(MODULE.ID, 'immobilized', limit); 
        sendNotificationToOwners(token, "info", `Movement restriction applied to token.`);
    }
}

async function requestConcentrationCheck(actorId, spellbook, itemSource) {
    const actor = game.actors.get(actorId);
    if (!actor) return;

    const handleConcentrationCheck = async () => {
        if (actor.statuses.has("entangled")) {
            await actor.rollConcentration(spellbook);
        }

        if (actor.statuses.has("grappled") && itemSource.system.components?.somatic) {
            await actor.rollConcentration(spellbook);
        }
    };

    await handleConcentrationCheck();
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
    if (updatingToken) return true;
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
                                updatingToken = true;
                                await token.document.update(updateData);
                                updatingToken = false;
                            } else {
                                token.actor.setCondition("prone", true);
                                return false
                            }
                        }
                    },
                    cancel: {
                        label: "Cancel",
                        callback: () => {
                        }
                    }
                },
                default: "roll"
            }).render(true);
            return false;
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

Hooks.on('pf1ToggleActorCondition', async (actor, condition, enabled) => {
    if (immobileConditions.includes(condition)) {
        const tokens = actor.getActiveTokens();
        for (const token of tokens) {
            await socket.executeAsGM("applyImmobilize", token.id, enabled ? 0 : null);
        }
    }
    if (impairMovementConditions.includes(condition)) {
        applySlowedCondition(actor);
    }
});