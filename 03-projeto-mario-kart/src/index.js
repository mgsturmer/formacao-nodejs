const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const characters = {
  Mario: { NOME: "Mario", VELOCIDADE: 4, MANOBRABILIDADE: 3, PODER: 3 },
  Peach: { NOME: "Peach", VELOCIDADE: 3, MANOBRABILIDADE: 4, PODER: 2 },
  Yoshi: { NOME: "Yoshi", VELOCIDADE: 2, MANOBRABILIDADE: 4, PODER: 3 },
  Bowser: { NOME: "Bowser", VELOCIDADE: 5, MANOBRABILIDADE: 2, PODER: 5 },
  Luigi: { NOME: "Luigi", VELOCIDADE: 3, MANOBRABILIDADE: 4, PODER: 4 },
  "Donkey Kong": { NOME: "Donkey Kong", VELOCIDADE: 2, MANOBRABILIDADE: 2, PODER: 5 },
};

async function selectCharacter(prompt, unavailableCharacter = null) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      const index = parseInt(answer) - 1;
      const characterList = Object.values(characters);

      if (index >= 0 && index < characterList.length) {
        const selectedCharacter = characterList[index];

        if (unavailableCharacter && selectedCharacter.NOME === unavailableCharacter.NOME) {
          console.log("Esse personagem já foi escolhido! Tente novamente.");
          return resolve(selectCharacter(prompt, unavailableCharacter));
        }

        resolve({ ...selectedCharacter, PONTOS: 0 });
      } else {
        console.log("Seleção inválida. Tente novamente.");
        resolve(selectCharacter(prompt, unavailableCharacter));
      }
    });
  });
}

async function rollDice() {
  return Math.floor(Math.random() * 6) + 1;
}

async function getRandomBlock() {
  let random = Math.random();
  return random < 0.33 ? "RETA" : random < 0.66 ? "CURVA" : "CONFRONTO";
}

async function logRollResult(characterName, block, diceResult, attribute) {
  console.log(`${characterName} 🎲 rolou um dado de ${block} ${diceResult} + ${attribute} = ${diceResult + attribute}`);
}

async function playRace(character1, character2) {
  do {
    await playRaceEngine(character1, character2);

    if (character1.PONTOS < 0 && character2.PONTOS >= 0) {
      character1.PONTOS = 0;
      break;
    } else if (character2.PONTOS < 0 && character1.PONTOS >= 0) {
      character2.PONTOS = 0;
      break;
    }
  } while (character1.PONTOS <= 0 && character2.PONTOS <= 0);

  await declareWinner(character1, character2);
}

function standIns(character1, character2){
  console.log("-----------------------------");
  console.log("Resultado parcial:");
  console.log(`${character1.NOME}: ${character1.PONTOS} ponto(s)`);
  console.log(`${character2.NOME}: ${character2.PONTOS} ponto(s)`);
  console.log("-----------------------------");  
}

async function playRaceEngine(character1, character2) {
  for (let round = 1; round <= 5; round++) {
    
    if (round > 1) {
      standIns(character1, character2);
    }

    console.log(`🏁 Rodada ${round}`);
    let block = await getRandomBlock();
    console.log(`Bloco: ${block}`);



    let diceResult1 = await rollDice();
    let diceResult2 = await rollDice();
    let totalTestSkill1 = 0;
    let totalTestSkill2 = 0;

    if (block === "RETA") {
      totalTestSkill1 = diceResult1 + character1.VELOCIDADE;
      totalTestSkill2 = diceResult2 + character2.VELOCIDADE;
      
      await logRollResult(character1.NOME, "velocidade", diceResult1, character1.VELOCIDADE);
      await logRollResult(character2.NOME, "velocidade", diceResult2, character2.VELOCIDADE);

      if (Math.abs(totalTestSkill1 - totalTestSkill2) >= 3) {
        let turboWinner = totalTestSkill1 > totalTestSkill2 ? character1 : character2;
        console.log(`Isso! ${turboWinner.NOME} pegou um turbo! 💫💨`);
        turboWinner.PONTOS++;
      }
    } else if (block === "CURVA") {
      totalTestSkill1 = diceResult1 + character1.MANOBRABILIDADE;
      totalTestSkill2 = diceResult2 + character2.MANOBRABILIDADE;
      
      await logRollResult(character1.NOME, "manobrabilidade", diceResult1, character1.MANOBRABILIDADE);
      await logRollResult(character2.NOME, "manobrabilidade", diceResult2, character2.MANOBRABILIDADE);
    } else if (block === "CONFRONTO") {
      let powerResult1 = diceResult1 + character1.PODER;
      let powerResult2 = diceResult2 + character2.PODER;

      console.log(`${character1.NOME} confrontou com ${character2.NOME}! 🥊`);
      await logRollResult(character1.NOME, "poder", diceResult1, character1.PODER);
      await logRollResult(character2.NOME, "poder", diceResult2, character2.PODER);

      let difference = Math.abs(powerResult1 - powerResult2);
      if (powerResult1 > powerResult2) {
        if (difference >= 3 && character2.PONTOS > 0) {
          console.log(`Oh não, ${character2.NOME} foi atacado com uma bomba! 🧨`);
          console.log(`${character1.NOME} venceu o confronto! ${character2.NOME} perdeu 2 pontos 🐢`);
          character2.PONTOS = Math.max(0, character2.PONTOS - 2);
        } else {
          console.log(`${character1.NOME} venceu o confronto! ${character2.NOME} perdeu 1 ponto 🐢`);
          character2.PONTOS--;
        }
      } else if (powerResult2 > powerResult1) {
        if (difference >= 3 && character1.PONTOS > 0) {
          console.log(`Oh não, ${character1.NOME} foi atacado com uma bomba! 🧨`);
          console.log(`${character2.NOME} venceu o confronto! ${character1.NOME} perdeu 2 pontos 🐢`);
          character1.PONTOS = Math.max(0, character1.PONTOS - 2);
        } else {
          console.log(`${character2.NOME} venceu o confronto! ${character1.NOME} perdeu 1 ponto 🐢`);
          character1.PONTOS--;
        }
      } else {
        console.log("Confronto empatado! Nenhum ponto foi perdido");
      }
    }

    if (totalTestSkill1 > totalTestSkill2) {
      console.log(`${character1.NOME} marcou um ponto!`);
      character1.PONTOS++;
    } else if (totalTestSkill2 > totalTestSkill1) {
      console.log(`${character2.NOME} marcou um ponto!`);
      character2.PONTOS++;
    }
    console.log("-----------------------------");
  }
}

async function declareWinner(character1, character2) {
  console.log("Resultado final:");
  console.log(`${character1.NOME}: ${character1.PONTOS} ponto(s)`);
  console.log(`${character2.NOME}: ${character2.PONTOS} ponto(s)`);

  if (character1.PONTOS > character2.PONTOS) console.log(`\n${character1.NOME} venceu a corrida! Parabéns! 🏆`);
  else if (character2.PONTOS > character1.PONTOS) console.log(`\n${character2.NOME} venceu a corrida! Parabéns! 🏆`);
  else console.log("A corrida terminou em empate");
}

function listCharacters() {
  console.log("\nEstes são os personagens disponíveis: ");
  Object.values(characters).forEach((char, index) => {
    console.log(
      `${index + 1}. ${char.NOME} (Velocidade: ${char.VELOCIDADE}, Manobrabilidade: ${char.MANOBRABILIDADE}, Poder: ${char.PODER})`
    );
  });
}

(async function main() {
  listCharacters();
  const player1 = await selectCharacter("Escolha o primeiro personagem: ");
  const player2 = await selectCharacter("Escolha o segundo personagem: ", player1);
  
  console.log(`🏁🚨 Corrida entre ${player1.NOME} e ${player2.NOME} começando...\n`);
  await playRace(player1, player2);
  rl.close();
})();
