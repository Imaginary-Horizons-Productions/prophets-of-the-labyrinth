# Prophets of the Labyrinth Change Log
#### Prophets of the Labyrinth Version 0.10.0:
- Added **Consumables**: these resources can be used by any party member during combat at priority speed
   1. Vitamins
   2. Health Potion
   3. Repair Kit
   4. Smoke Bomb
   5. Explosion Potion
   6. Earthen Potion
   7. Fiery Potion
   8. Salt of Oblivion
   9. Quick Pepper
   10. Regen Root
   11. Stasis Quartz
   12. Strength Spinach
   13. Watery Potion
   14. Windy Potion
- Reworked *Urgent* weapon variant: it now adds priority to the move
- Renamed *Swift* weapon variant to *Accelerating*

#### Prophets of the Labyrinth Version 0.9.0:
- Rebalanced predicts, they are now as follows
   1. Movements - Speed, Stagger, and Poise for each combatant
   2. Vulnerabilties - Critical Hits and Elements for each combatant
   3. Intents - Targets and next two Move Names for enemies
   4. Health - HP and Modifiers for each combatant
- Removed Darkness and Light elements; enemies, weapons, and archetypes have been re-elemented
- Added Equipment categories ("Weapons" are now one category among them)
- New slash command: `/armory` that allows checking stats on a weapon given by name
- New modifiers: Stasis, Oblivious, Vigilance
- New Equipment: Vigilance Charm
- Slash commands can now be used from DMs (as long as they make sense)
- Max delvers per adventure reduced to 8 (UI constraint)
- The changelog no longer offers "premimum features" for sponsoring on GitHub
- Other bug fixes, optimizations, and improvements
- Fixed `/invite`
- Fixed `/ping` incorrectly mentioning delvers who are ready
#### Prophets of the Labyrinth Version 0.8.0:
- Added "Data Policy" page to manual
- Enemy hp now scales with party size
- Weapon durability tweaks:
   - Thick Battleaxe: 15 -> 20 durability
   - Cloaks (Base, Long, Swift): 5 -> 10 durability
   - Thick Cloak: 10 -> 20 durability
   - Midas Staves: 10 -> 5 durability
   - Potions: 5 -> 10 durability
   - Scythes: 15 -> 10 durability
   - Base Sword: 5 -> 10 durability
- Artifact performance stats can now be viewed in `/party-stats`
- Curse of Midas no longer triggers on Poison damage
- Other stuff
#### Prophets of the Labyrinth Version 0.7.1:
- New artifacts: Hawk Tail Feather
- New enemy: Fire-Arrow Frog
- Enemy balance:
   - Bloodtail Hawk critical hit rate increased from 1/4 to 1/3 and now scale in count with party size
   - Slimes and Oozes now scale in count less with party size
- Fixed crash on completing a challenge
- Other stuff
#### Prophets of the Labyrinth Version 0.7.0:
- Added challenges
   - These can be applied at the beginning of the run or at a rest site for a score bonus and other rewards
   - New challenges: Can't Hold All this Value, Restless, Blind Avarice
- New final battle: A Northern Laboratory
- `/stats` now shows if a player is available for adventures
- Reduced max hp % damage on Sickles from 10% to 5%
- Damage is now capped at 500 damage per instance, this can be exceeded by having Power Up
- Bot no longer creates a (no longer required) category and text channel for starting adventures in
- Allowed deselecting starting artifact
- Fixed healing reporting block gained while party has no Bloodshield Swords
- Fixed text interpolation for modifier descriptions with more than 1 dynamic value
- Fixed several multiplayer bugs
- Culled some unnecessary bot output
- Other stuff
### Known Issues
- Ready message is output twice if the last two players select their archetypes at similar times
- /ping returns false positives
- Interacting with archived threads sometimes causes crashes
- Poison damage procs Curse of Midas
- Using a join button in a /invite clears the original join button on the adventure
#### Prophets of the Labyrinth Version 0.6.0:
- New artifact: Negative-One Leaf Clover
- New weapons: Ice Ward, Heavy Ice Ward, Sweeping Ice Ward, Reinforcing Inspiration
- Participating in more than one adventure per server is now a premium perk
- Capped delvers in an adventure to 12
- Multiple Royal Slimes now appear in opposition to larger party sizes
- Fixed merchant rooms never rolling during room generation
#### Prophets of the Labyrinth Version 0.5.3:
- Fixed typo in rest site healing amount
- Fixed a crash on mechabee call for help
#### Prophets of the Labyrinth Version 0.5.2:
- Fixed a crash when enemies healed
- Health predict now shows element using emoji
#### Prophets of the Labyrinth Version 0.5.1:
- Fixed several crashes with `/reset`
- Fixed an issue where all readied moves were input for the wrong turn, and thus ignored
#### Prophets of the Labyrinth Version 0.5.0:
- Game name no longer references unsupported game genre
- Artifact Collecting: completing an adventure allows the delvers to save an artifact they found to bring into future adventures
- New artifact: Bloodshield Sword
- New weapons: Swift Midas Staff, Piercing Scythe
- Reworked Quicken and Slow: they now give/remove 10 speed and don't lose stacks on end of round
- Reworked Evade and Exposed: they now lose all stacks at end of round instead of 100, most sources of these modifiers now output more stacks
- Upgraded Potions now apply 5 Poison, up from 4 (10 on crit, up from 8)
- `/commands` - a new command for listing PotL's slash commands
- `/invite` - a new command for inviting friends to adventures
- `/manual` - a new command for getting information about the game
- `/ping` - a new command for sending a notification to players the game is waiting on input for
- Automated version notes and `/version` command
- Other stuff

#### Prophets of the Labyrinth Version 0.4.0:
- Check the repository for version notes pre-history
