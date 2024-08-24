# Improved Conditions for PF1E

## Overview

**Improved Conditions** is a module for Foundry VTT designed specifically for the Pathfinder First Edition (PF1E) system. This module adds several conditions and automates various aspects of these and existing conditions to streamline gameplay and enhance the gaming experience.

### Added Conditions

- **Energy Drained**
- **Fascinated**

### Additional Sub-Conditions

- **Anchored**
- **Immobilized**
- **Slowed**

These additional conditions will become sub-conditions in future updates and work with other conditions like entangled.

### Automation Features

- **Anchored**: Applies a movement restriction on tokens, making them immovable; automatically applied to conditions like "cowering", "dazed", "dying", "helpless", "paralyzed", "petrified", "pinned". This can be toggled off in the module's settings.
- **Blind**: Tokens with this condition will have the slowed condition applied. Movement prompts an acrobatics check; with failure resulting in no movement and the prone condition. This can be toggled off in the module's settings.
- **Confused**: Creates a chat message every round to show how affected tokens act. This can be toggled off in the module's settings. During combat, it will create a chat message on the affected token's turn.
- **Dead**: Applied automatically when a token's HP is less than or equal to its total constitution score; this can be toggled off in the module's settings and disables the Monk's Combat Detail's similar setting for compatibility.
- **Disabled**: Applied automatically when a token's HP is exactly 0; prompts user decisions for actions and condition changes based on abilities like Diehard. This can be toggled off in the module's settings.
- **Energy Drained**: Automatically applied to tokens with above 0 negative levels. This can be toggled off in the module's settings.
- **Entangled**: Applies the slowed condition automatically and prompts concentration checks for spellcasting. This can be toggled off in the module's settings.
- **Fascinated**: Applies a -4 penalty on perception checks.
- **Flat-Footed (WIP)**: Applied automatically based on initiative rolls, with considerations for abilities like Uncanny Dodge; this can be toggled off in the module's settings.
- **Grappled**: Applies the slowed condition automatically and prompts concentration checks for spellcasting with somatic components. This can be toggled off in the module's settings.
- **Immobilized**: Renders the token immovable and denies dex bonus to AC. This will become a sub-condition in future updates; this can be toggled off in the module's settings.
- **Slowed**: Applied automatically to tokens with conditions like "blind", "disabled", "entangled", or "exhausted"; reduces movement speeds by half.
- **Unconscious**: Applied automatically when tokens fall below 0 HP, unless affected by abilities like Diehard.

## Surprise Rounds
- Surprise Rounds will only be available if the Flat-Footed setting is enabled. You can start a surprise round by clicking on the "Surprise Round" button above the "Begin Combat" button. This will apply the Flat-Footed condition on all tokens until their turns in the second round. To exclude a token from being surprised, simply select those tokens before you click the surprise round button.

## Installation

Manifest URL: https://github.com/Nevela-0/PF1-Improved-Conditions/releases/latest/download/module.json


## Usage

Once the module is installed and enabled, configure which conditions you'd like to be automated in the module's configuration window.

## Credits

- **Nevela**: Lead developer and creator of the Automate Damage module.
- **Contributors**: The PF1E system and module developers for their support.
- **[McGreger](https://github.com/McGreger)**: Help with German localization.
- **Condition Icons**: Icons used were picked from [game-icons.net](https://game-icons.net/about.html).
- **[McGreger](https://github.com/McGreger)**: Help with German localization.
- **Condition Icons**: Icons used were picked from [game-icons.net](https://game-icons.net/about.html).


## Open Game License

This module includes content covered under the Open Game License (OGL). For more details, please refer to the [OGL license](./ogl.md).
