// Written by rf232

var fs = require('fs');
stateFile = fs.readFileSync(process.env.USERPROFILE + '/.ghh/state');
var PlayerInit = {
	values: ["dragOrder", "dragNumber", "dragNumberRequired", "numpad"],
};
var AttackModifier = {
	values: ["plus0", "plus1", "plus2", "minus1", "minus2", "nullAttack", "doubleAttack", "bless", "curse"],
};
var ElementState = {
	values: ["inert", "strong", "waning"],
};
var Condition = {
	values: ["star", "summonNew", "summon", "stun", "immobilize", "disarm", "wound", "muddle", "poison", "strengthen", "invisible", "regenerate", "doom"],
}
var CharacterClass = {
	values: ["Escort", "Objective", "Brute", "Cragheart", "Mindthief", "Scoundrel", "Spellweaver", "Tinkerer", "Diviner", "Beast Tyrant", "Berserker", "Doomstalker", "Elementalist", "Nightshroud", "Plagueherald", "Quartermaster", "Sawbones", "Soothsinger", "Summoner", "Sunkeeper", "Bladeswarm"],
}
var MonsterType = {
	values: ["normal", "elite", "boss", "summon"],
}
var SummonColor = {
	values: ["beast", "blue", "green", "yellow", "orange", "white", "purple", "pink", "red"],
}
var parseState = function (input) {
	var state = {
		attackModifiers: [],
		attackModifiersDiscard: [],
		removedAbilities: [],
		abilityDecks: {},
		rows: [],
		playerRows: [],
		monsterRows: [],
	};
	state.round = input.readInt(true);
	state.scenarioNumber = input.readInt(true);
	state.scenarioLevel = input.readInt(true);
	state.trackStandees = input.readBoolean();
	state.abilityCards = input.readBoolean();
	state.randomStandees = input.readBoolean();
	state.elitesFirst = input.readBoolean();
	state.expireConditions = input.readBoolean();
	state.solo = input.readBoolean();
	state.hideStats = input.readBoolean();
	state.calculateStats = input.readBoolean();
	state.canDraw = input.readBoolean();
	state.needsShuffle = input.readBoolean();
	state.playerInit = readEnum(input, PlayerInit.values);

	readEnumArray(input, state.attackModifiers, AttackModifier.values);
	readEnumArray(input, state.attackModifiersDiscard, AttackModifier.values);

	state.fire = readEnum(input, ElementState.values);
	state.ice = readEnum(input, ElementState.values);
	state.air = readEnum(input, ElementState.values);
	state.earth = readEnum(input, ElementState.values);
	state.light = readEnum(input, ElementState.values);
	state.dark = readEnum(input, ElementState.values);

	readIntArray(input, state.removedAbilities, true);
	state.badOmen = input.readInt(true);

	for (var i = 0, n = input.readInt(true); i < n; i++) {
		var deck = {
			'id': input.readInt(true),
			'abilities': []
		}
		//TODO parse the data.json from the jar to get the decks and abilities loaded
		//var deck = new MonsterAbilityDeck(findMonsterAbilityDeck(input.readInt(true)));
		state.abilityDecks[deck.id] = deck;
		deck.shuffle = input.readBoolean();
		deck.shownAbility = readMonsterAbility(input, deck);
		deck.abilities = [];
		deck.abilitiesDiscard = [];
		for (var ii = 0, nn = input.readInt(true); ii < nn; ii++) {
			deck.abilities[ii] = {
				id: input.readInt(true)
			};
			//deck.abilities.add(monsterAbilities.get(input.readInt(true)));
		}
		for (var ii = 0, nn = input.readInt(true); ii < nn; ii++) {
			deck.abilitiesDiscard[ii] = {
				id: input.readInt(true)
			};
			//deck.abilitiesDiscard.add(monsterAbilities.get(input.readInt(true)));
		}
	}
	for (var i = 0, n = input.readInt(true); i < n; i++) {
		if (input.readBoolean()) {
			var row = readPlayerRow(input);
			state.rows.push(row);
			state.playerRows.push(row);
		} else {
			var row = readMonsterRow(input);
			state.rows.push(row);
			state.monsterRows.push(row);
		}
	}
	return state;
}
var Reader = function (buffer) {
	var position = 4;
	return {
		// VLQ encoded int.
		readInt: function (optimizePositive) {
			var b = buffer[position++];
			var result = b & 0x7F;
			if ((b & 0x80) != 0) {
				b = buffer[position++];
				result |= (b & 0x7F) << 7;
				if ((b & 0x80) != 0) {
					b = buffer[position++];
					result |= (b & 0x7F) << 14;
					if ((b & 0x80) != 0) {
						b = buffer[position++];
						result |= (b & 0x7F) << 21;
						if ((b & 0x80) != 0) {
							b = buffer[position++];
							result |= (b & 0x7F) << 28;
						}
					}
				}
			}
			return optimizePositive ? result : ((result >>> 1) ^  - (result & 1));
		},

		readBoolean: function () {
			return buffer[position++] != 0;
		},
		readString: function () {
			var b = buffer[position++];
			if ((b & 0x80) == 0) {
				position--;
				return this.readAscii(); // ASCII.
			}
			// Null, empty, or UTF8.
			var charCount = this.readUtf8Length(b);
			switch (charCount) {
			case 0:
				return null;
			case 1:
				return "";
			}
			charCount--;
			chars = this.readUtf8(charCount);
			return new TextDecoder().decode(Buffer.from(chars));
		},
		readUtf8Length: function (b) {
			var result = b & 0x3F; // Mask all but first 6 bits.
			if ((b & 0x40) != 0) { // Bit 7 means another byte, bit 8 means UTF8.
				b = buffer[position++];
				result |= (b & 0x7F) << 6;
				if ((b & 0x80) != 0) {
					b = buffer[position++];
					result |= (b & 0x7F) << 13;
					if ((b & 0x80) != 0) {
						b = buffer[position++];
						result |= (b & 0x7F) << 20;
						if ((b & 0x80) != 0) {
							b = buffer[position++];
							result |= (b & 0x7F) << 27;
						}
					}
				}
			}
			return result;
		},
		readUtf8: function (charCount) {
			var chars = [];
			var charIndex = 0;
			while (charIndex < charCount) {
				var b = buffer[position++] & 0xFF;
				switch (b >> 4) {
				case 0:
				case 1:
				case 2:
				case 3:
				case 4:
				case 5:
				case 6:
				case 7:
					chars.push(b);
					break;
				case 12:
				case 13:
					chars.push(b);
					chars.push(buffer[position++]);
					break;
				case 14:
					chars.push(b);
					chars.push(buffer[position++]);
					chars.push(buffer[position++]);
					break;
				}
				charIndex++;
			}
			return chars;
		},
		readAscii: function () {
			var chars = [];
			var c;
			while ((buffer[position] & 0x80) == 0) {
				c = buffer[position++];
				chars.push(c);
			}
			chars.push(buffer[position++] & 0x7F);
			return new TextDecoder().decode(Buffer.from(chars))
		}
	}
}
var readEnum = function (input, values) {
	var val = input.readInt(true);
	return values[val]
}
var readEnumArray = function (input, list, values) {
	var n = input.readInt(true);
	for (var i = 0; i < n; i++) {
		list[i] = readEnum(input, values);
	}
}
var readIntArray = function (input, list, optPositive) {
	var n = input.readInt(true);
	for (var i = 0; i < n; i++) {
		list[i] = input.readInt(optPositive);
	}
}

var readMonsterAbility = function (input, deck) {
	var abilityID = input.readInt(true);
	if (abilityID == 0)
		return null;
	abilityID--;
	var abilities = deck.abilities;
	for (var i = 0, n = abilities.size; i < n; i++) {
		if (abilities[i].id == abilityID)
			return abilities.get(i);
	}
	// Shouldn't happen once loaded the json
	return abilityID;
}

var readPlayerRow = function (input) {
	var player = {
		conditions: [],
		expiredConditions: [],
		currentTurnConditions: [],
	};
	player.name = input.readString();
	player.characterClass = readEnum(input, CharacterClass.values);
	if (player.name == null)
		player.name = player.characterClass; //.toString();
	player.xp = input.readInt(true);
	player.hp = input.readInt(true);
	player.hpMax = input.readInt(true);
	player.level = input.readInt(true);
	player.loot = input.readInt(true);
	player.init = input.readInt(true);
	readEnumArray(input, player.conditions, Condition.values);
	readEnumArray(input, player.expiredConditions, Condition.values);
	readEnumArray(input, player.currentTurnConditions, Condition.values);
	player.exhausted = input.readBoolean();
	var row = {
		player: player,
	};
	readRow(input, row);
	return row;
}
var readMonsterRow = function (input) {
	//TODO get monster data from json
	var row = {
		"data": { "id": input.readInt(true), stats: {"normal": [], "elite": [], "boss":[]} },
		"id": input.readInt(true),
	}
	row.hasNormal = input.readBoolean();
	row.hasElite = input.readBoolean();
	var abilityDeck = { abilities: [] }; //findMonsterAbilityDeck(data.deckID);
	row.ability = readMonsterAbility(input, abilityDeck);
	readRow(input, row);
	return row;
}
var readRow = function (input, row) {
	row.turnComplete = input.readBoolean();
	row.boxes = []
	for (var ii = 0, nn = input.readInt(true); ii < nn; ii++) {
		var monster = {};
		monster.number = input.readInt(true);
		monster.type = readEnum(input, MonsterType.values);
		if (monster.type == "summon") {
			monster.summonColor = readEnum(input, SummonColor.values);
			monster.summonMove = input.readInt(true);
			monster.summonAttack = input.readInt(true);
			monster.summonRange = input.readInt(true);
		}
		monster.isNew = input.readBoolean();
		monster.hp = input.readInt(true);
		monster.hpMax = input.readInt(true);
		readEnumArray(input, monster.conditions, Condition.values);
		readEnumArray(input, monster.expiredConditions, Condition.values);
		readEnumArray(input, monster.currentTurnConditions, Condition.values);

		if (row.data) {
			var monsterRow = row;
			monster.data = monsterRow.data;
			monster.stats = monsterRow.data.stats[monster.type][monsterRow.level];
		} else {
			monster.data = summonData;
			monster.stats = summonStats;
		}
		row.boxes.push(monster);
	}
}
state = parseState(Reader(stateFile));

process.stdout.write(JSON.stringify(state, null, 2));
