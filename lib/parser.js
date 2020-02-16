const { PlayerInit, AttackModifier, ElementState, Condition, CharacterClass, MonsterType, SummonColor, Monsters } = require("./constants");

function readEnum(reader, values) {
  var val = reader.readInt(true);
  return values[val];
}

function readEnumArray(reader, list, values) {
  var n = reader.readInt(true);
  for (var i = 0; i < n; i++) {
    list[i] = readEnum(reader, values);
  }
}

function readIntArray(reader, list, optPositive) {
  var n = reader.readInt(true);
  for (var i = 0; i < n; i++) {
    list[i] = reader.readInt(optPositive);
  }
}

function readMonsterAbility(reader, deck) {
  var abilityID = reader.readInt(true);
  if (abilityID == 0) return null;
  abilityID--;
  var abilities = deck.abilities;
  for (var i = 0, n = abilities.size; i < n; i++) {
    if (abilities[i].id == abilityID) return abilities.get(i);
  }
  // Shouldn't happen once loaded the json
  return abilityID;
}

function readPlayerRow(reader) {
  var player = {
    conditions: [],
    expiredConditions: [],
    currentTurnConditions: []
  };
  player.name = reader.readString();
  player.characterClass = readEnum(reader, CharacterClass.values);
  if (player.name == null) player.name = player.characterClass; //.toString();
  player.xp = reader.readInt(true);
  player.hp = reader.readInt(true);
  player.hpMax = reader.readInt(true);
  player.level = reader.readInt(true);
  player.loot = reader.readInt(true);
  player.init = reader.readInt(true);
  readEnumArray(reader, player.conditions, Condition.values);
  readEnumArray(reader, player.expiredConditions, Condition.values);
  readEnumArray(reader, player.currentTurnConditions, Condition.values);
  player.exhausted = reader.readBoolean();
  var row = {
    player: player
  };
  readRow(reader, row);
  return row;
}

function readMonsterRow(reader) {
  //TODO get monster data from json
  var row = {
    data: { id: reader.readInt(true), stats: { normal: [], elite: [], boss: [] } },
    id: reader.readInt(true)
  };
  row.hasNormal = reader.readBoolean();
  row.hasElite = reader.readBoolean();
  var abilityDeck = { abilities: [] }; //findMonsterAbilityDeck(data.deckID);
  row.ability = readMonsterAbility(reader, abilityDeck);
  row.type = Monsters.values[row.data.id];
  readRow(reader, row);
  return row;
}

function readRow(reader, row) {
  row.turnComplete = reader.readBoolean();
  row.boxes = [];
  for (var ii = 0, nn = reader.readInt(true); ii < nn; ii++) {
    var monster = {};
    monster.number = reader.readInt(true);
    monster.type = readEnum(reader, MonsterType.values);
    if (monster.type == "summon") {
      monster.summonColor = readEnum(reader, SummonColor.values);
      monster.summonMove = reader.readInt(true);
      monster.summonAttack = reader.readInt(true);
      monster.summonRange = reader.readInt(true);
    }
    monster.isNew = reader.readBoolean();
    monster.hp = reader.readInt(true);
    monster.hpMax = reader.readInt(true);
    readEnumArray(reader, monster.conditions, Condition.values);
    readEnumArray(reader, monster.expiredConditions, Condition.values);
    readEnumArray(reader, monster.currentTurnConditions, Condition.values);

    if (row.data) {
      var monsterRow = row;
      monster.data = monsterRow.data;
      monster.stats = monsterRow.data.stats[monster.type][monsterRow.level];
    } else {
      //monster.data = summonData;
      //monster.stats = summonStats;
    }
    row.boxes.push(monster);
  }
}

exports.parseState = function(reader) {
  var state = {
    attackModifiers: [],
    attackModifiersDiscard: [],
    removedAbilities: [],
    abilityDecks: {},
    rows: [],
    playerRows: [],
    monsterRows: []
  };
  state.round = reader.readInt(true);
  state.scenarioNumber = reader.readInt(true);
  state.scenarioLevel = reader.readInt(true);
  state.trackStandees = reader.readBoolean();
  state.abilityCards = reader.readBoolean();
  state.randomStandees = reader.readBoolean();
  state.elitesFirst = reader.readBoolean();
  state.expireConditions = reader.readBoolean();
  state.solo = reader.readBoolean();
  state.hideStats = reader.readBoolean();
  state.calculateStats = reader.readBoolean();
  state.canDraw = reader.readBoolean();
  state.needsShuffle = reader.readBoolean();
  state.playerInit = readEnum(reader, PlayerInit.values);

  readEnumArray(reader, state.attackModifiers, AttackModifier.values);
  readEnumArray(reader, state.attackModifiersDiscard, AttackModifier.values);

  state.fire = readEnum(reader, ElementState.values);
  state.ice = readEnum(reader, ElementState.values);
  state.air = readEnum(reader, ElementState.values);
  state.earth = readEnum(reader, ElementState.values);
  state.light = readEnum(reader, ElementState.values);
  state.dark = readEnum(reader, ElementState.values);

  readIntArray(reader, state.removedAbilities, true);
  state.badOmen = reader.readInt(true);

  for (var i = 0, n = reader.readInt(true); i < n; i++) {
    var deck = {
      id: reader.readInt(true),
      abilities: []
    };
    //TODO parse the data.json from the jar to get the decks and abilities loaded
    //var deck = new MonsterAbilityDeck(findMonsterAbilityDeck(reader.readInt(true)));
    state.abilityDecks[deck.id] = deck;
    deck.shuffle = reader.readBoolean();
    deck.shownAbility = readMonsterAbility(reader, deck);
    deck.abilities = [];
    deck.abilitiesDiscard = [];
    for (var ii = 0, nn = reader.readInt(true); ii < nn; ii++) {
      deck.abilities[ii] = {
        id: reader.readInt(true)
      };
      //deck.abilities.add(monsterAbilities.get(reader.readInt(true)));
    }
    for (var ii = 0, nn = reader.readInt(true); ii < nn; ii++) {
      deck.abilitiesDiscard[ii] = {
        id: reader.readInt(true)
      };
      //deck.abilitiesDiscard.add(monsterAbilities.get(reader.readInt(true)));
    }
  }
  for (var i = 0, n = reader.readInt(true); i < n; i++) {
    if (reader.readBoolean()) {
      var row = readPlayerRow(reader);
      state.rows.push(row);
      state.playerRows.push(row);
    } else {
      var row = readMonsterRow(reader);
      state.rows.push(row);
      state.monsterRows.push(row);
    }
  }
  return state;
};
