class IEnum {
	constructor(values) {
		this.values = values;
	}

	readFrom(reader) {
		var val = reader.readInt(true);

		return this.values[val];
	}
}

exports.PlayerInit = {
	values: ["dragOrder", "dragNumber", "dragNumberRequired", "numpad"],
};

exports.AttackModifier = {
	values: ["plus0", "plus1", "plus2", "minus1", "minus2", "nullAttack", "doubleAttack", "bless", "curse"],
};

exports.ElementState = {
	values: ["inert", "strong", "waning"],
};

exports.Condition = {
	values: ["star", "summonNew", "summon", "stun", "immobilize", "disarm", "wound", "muddle", "poison", "strengthen", "invisible", "regenerate", "doom"],
};

exports.CharacterClass = {
	values: ["Escort", "Objective", "Brute", "Cragheart", "Mindthief", "Scoundrel", "Spellweaver", "Tinkerer", "Diviner", "Beast Tyrant", "Berserker", "Doomstalker", "Elementalist", "Nightshroud", "Plagueherald", "Quartermaster", "Sawbones", "Soothsinger", "Summoner", "Sunkeeper", "Bladeswarm"],
};

exports.MonsterType = {
	values: ["normal", "elite", "boss", "summon"],
};

exports.SummonColor = {
	values: ["beast", "blue", "green", "yellow", "orange", "white", "purple", "pink", "red"],
};
