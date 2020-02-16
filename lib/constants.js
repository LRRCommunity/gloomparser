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
  values: ["dragOrder", "dragNumber", "dragNumberRequired", "numpad"]
};

exports.AttackModifier = {
  values: ["plus0", "plus1", "plus2", "minus1", "minus2", "nullAttack", "doubleAttack", "bless", "curse"]
};

exports.ElementState = {
  values: ["inert", "strong", "waning"]
};

exports.Condition = {
  values: ["star", "summonNew", "summon", "stun", "immobilize", "disarm", "wound", "muddle", "poison", "strengthen", "invisible", "regenerate", "doom"]
};

exports.CharacterClass = {
  values: [ "Escort", "Objective", "Brute", "Cragheart", "Mindthief", "Scoundrel", "Spellweaver", "Tinkerer", "Diviner", "Beast Tyrant", "Berserker", "Doomstalker", "Elementalist", "Nightshroud", "Plagueherald", "Quartermaster", "Sawbones", "Soothsinger", "Summoner", "Sunkeeper", "Bladeswarm"]
};

exports.MonsterType = {
  values: ["normal", "elite", "boss", "summon"]
};

exports.SummonColor = {
  values: ["beast", "blue", "green", "yellow", "orange", "white", "purple", "pink", "red"]
};
exports.Monsters = {
  values: [ "Ancient Artillery", "Bandit Archer", "Bandit Guard", "Black Imp", "Cave Bear", "City Archer", "City Guard", "Cultist", "Deep Terror", "Earth Demon", "Flame Demon", "Frost Demon", "Forest Imp", "Giant Viper", "Harrower Infester", "Hound", "Inox Archer", "Inox Guard", "Inox Shaman", "Living Bones", "Living Corpse", "Living Spirit", "Lurker", "Ooze", "Night Demon", "Rending Drake", "Savvas Icestorm", "Savvas Lavaflow", "Spitting Drake", "Stone Golem", "Sun Demon", "Vermling Scout", "Vermling Shaman", "Wind Demon", "Bandit Commander", "The Betrayer", "Captain of the Guard", "The Colorless", "Dark Rider", "Elder Drake", "The Gloom", "Inox Bodyguard", "Jekserah", "Merciless Overseer", "Prime Demon", "The Sightless Eye", "Winged Horror", "Aesther Ashblade", "Aesther Scout", "Bear - Drake Abomination", "Valrath Tracker", "Valrath Savage", "Wolf - Viper Abomination", "Human Commander", "Valrath Commander", "Manifestation of Corruption"]
};
