class DiceNumberGenerator {
  public static generateRandNum() {
    return Math.floor(Math.random() * 6);
  }
}

class Player {
  private id: number;

  // Player moves
  private totalArrowAttacksSelected: number = 0;
  private totalAxeAttacksSelected: number = 0;
  private totalArrowDefenceSelected: number = 0;
  private totalAxeDefencesSelected: number = 0;
  private totalStealSelected: number = 0;
  private totalFavorTokensSelected: number = 0;

  private dices: Dice[] = [];
  private selectedDices: Dice[] = [];

  private health: number = 15;

  private totalRounds = 0; // 3 is maximum

  private confirmationStatus = false;

  constructor(id: number) {
    this.id = id;
  }

  // Getters
  public getConfirmedStatus() {
    return this.confirmationStatus;
  }

  public setDices() {
    for (let i = 0; i < 6; i++) {
      this.dices.push(new Dice(crypto.randomUUID()));
    }

    // Draw it on screen
    // Get the dice area element
    const diceArea = document.getElementById(`dice-area-${this.id}`);
    this.dices.forEach(dice => {
      const diceElem = document.createElement("div");
      diceElem.setAttribute("id", `player-${this.id}-${dice.getId()}`);
      diceElem.innerText = `Dice value: ${dice.getValue()} (${dice.getFaceMeaning()})`;

      // Add a click event to each dice element
      diceElem.addEventListener("click", () => this.handleClickOnDice(dice));

      diceArea?.appendChild(diceElem);
    });
  }

  private filterDices(diceToFilter: Dice) {
    this.dices = this.dices.filter(dice => dice.getId() !== diceToFilter.getId());
  }

  private updatePlayerMove(dice: Dice) {
    const diceValue = dice.getFaceMeaning();
    switch (diceValue) {
      case "Arrow":
        this.totalArrowAttacksSelected++;
        break;

      case "Axe":
        this.totalAxeAttacksSelected++;
        break;

      case "Shield":
        this.totalArrowDefenceSelected++;
        break;

      case "Helmet":
        this.totalAxeDefencesSelected++;
        break;

      case "Favor Token":
        this.totalFavorTokensSelected++;
        break;

      case "Steal":
        this.totalStealSelected++;
        break;

      default:
        break;
    }
  }

  private moveToSelectionList(dice: Dice) {
    // Push the current dice to selected dices list
    this.selectedDices.push(dice);

    // Update the UI
    const selectedDiceArea = document.getElementById(`selected-dices-area-${this.id}`);

    // Create a new selected dice element
    const selectedDiceElem = document.createElement("div");
    selectedDiceElem.setAttribute("id", `player-${this.id}-${dice.getId()}`);
    selectedDiceElem.innerText = `Dice value: ${dice.getValue()} (${dice.getFaceMeaning()})`;

    selectedDiceArea?.appendChild(selectedDiceElem);
  }

  private handleClickOnDice(dice: Dice) {
    this.filterDices(dice);

    //  Update player move
    this.updatePlayerMove(dice);

    // Move the clicked dice to selection list
    this.moveToSelectionList(dice);

    const diceArea = document.getElementById(`dice-area-${this.id}`);
    const diceElem = document.getElementById(`player-${this.id}-${dice.getId()}`);

    diceElem && diceArea?.removeChild(diceElem); // Remove the specified dice element
  }

  private updateDiceValue(dice: Dice) {
    const diceElem = document.getElementById(`player-${this.id}-${dice.getId()}`);
    if (diceElem) diceElem.innerText = `Dice value: ${dice.getValue()} (${dice.getFaceMeaning()})`;
  }

  public deductHealthPoint(points: number) {
    this.health = points <= this.health ? this.health - points : 0; // Deduct health points only when the points are lesser than the overall health
  }

  public handleDiceRollClick() {
    const diceRollBtn = document.getElementById(`dice-roll-button-${this.id}`);
    diceRollBtn?.addEventListener("click", () => {
      // Increment player round
      this.totalRounds++;

      // Roll all 6 dices / Generate random num for each dice
      this.dices.forEach((dice, i) => {
        dice.roll();
        this.updateDiceValue(dice);
      });

      if (this.totalRounds >= 3) {
        if (diceRollBtn) diceRollBtn.style.display = "none";
      }

      // Increment game round by 1
      Game.increaseRound();
    });
  }

  public handleConfirmSelectionBtnClick(cb: (err?: Error) => void) {
    const confirmSelectionBtn = document.getElementById(`confirm-selection-${this.id}`);
    confirmSelectionBtn?.addEventListener("click", () => {
      // Check total rounds played by the player
      // Player cannot confirm selecton before playing 3 rounds
      if (this.totalRounds < 3) {
        alert("Finish all 3 rounds first!");
        cb(new Error("Confirming before finishing 3 rounds"));
        return;
      }

      this.confirmationStatus = true;

      // Hide the confirmation button
      if (confirmSelectionBtn) confirmSelectionBtn.style.display = "none";

      cb();
    });
  }
}

class Dice {
  // Every dice have 6 faces
  // 0 -> arrow (1 damage)
  // 1 -> axe (1 damage)
  // 2 -> shield (1 arrow defence)
  // 3 -> helmet (1 axe defence)
  // 4 -> steal (steal 1 favor token from opponent)
  // 5 -> favor token

  private value: number = -1;

  private id: string;

  constructor(id: string) {
    this.id = id;
  }

  public roll() {
    // Generate a random number between 0 - 5
    const randnum = DiceNumberGenerator.generateRandNum();
    this.value = randnum;
  }

  // Getters
  public getValue() {
    return this.value;
  }

  public getId() {
    return this.id;
  }

  public getFaceMeaning() {
    switch (this.value) {
      case 0:
        return "Arrow";

      case 1:
        return "Axe";

      case 2:
        return "Shield";

      case 3:
        return "Helmet";

      case 4:
        return "Steal";

      case 5:
        return "Favor Token";

      default:
        return "";
    }
  }
}

class Game {
  // The game will have 2 players
  private static player1 = new Player(1);
  private static player2 = new Player(2);

  private static totalRounds = 0;

  public static new() {
    // Phase 1 - Roll phase
    this.startRollPhase();

    // Phase 2 - Resolution phase (after 3 rounds)
  }

  private static startRollPhase() {
    // Make player 1 ready
    this.player1.setDices();
    this.player1.handleDiceRollClick();
    this.player1.handleConfirmSelectionBtnClick(err => {
      if (!err) this.checkForNextPhase();
    });

    // Make player 2 ready
    this.player2.setDices();
    this.player2.handleDiceRollClick();
    this.player2.handleConfirmSelectionBtnClick(err => {
      if (!err) this.checkForNextPhase();
    });
  }

  public static increaseRound() {
    this.totalRounds++;
    this.checkForNextPhase();
  }

  private static checkForNextPhase() {
    if (this.player1.getConfirmedStatus() === true && this.player2.getConfirmedStatus() === true)
      alert("Starting resolution phase");
  }
}

Game.new();
