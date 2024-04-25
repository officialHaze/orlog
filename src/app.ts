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

  private health: number = 5;

  private totalRounds = 0; // 3 is maximum

  private confirmationStatus = false;

  constructor(id: number) {
    this.id = id;
  }

  // Getters
  public getConfirmedStatus() {
    return this.confirmationStatus;
  }

  public getPlayerMoves() {
    return {
      totalArrowAttacks: this.totalArrowAttacksSelected,
      totalAxeAttacks: this.totalAxeAttacksSelected,
      totalArrowDefences: this.totalArrowDefenceSelected,
      totalAxeDefences: this.totalAxeDefencesSelected,
      totalSteals: this.totalStealSelected,
      totalFavorTokens: this.totalFavorTokensSelected,
    };
  }

  public getId() {
    return this.id;
  }

  public setDices() {
    for (let i = 0; i < 6; i++) {
      this.dices.push(new Dice(crypto.randomUUID()));
    }

    // Draw it on screen
    // Get the dice area element
    const diceArea = document.getElementById(`dice-area-${this.id}`);
    this.dices.forEach((dice) => {
      const diceElem = document.createElement("div");
      diceElem.setAttribute("id", `player-${this.id}-${dice.getId()}`);
      diceElem.innerText = `${dice.getFaceMeaning()}`;

      // Add a click event to each dice element
      diceElem.addEventListener("click", () => this.handleClickOnDice(dice));

      diceArea?.appendChild(diceElem);
    });
  }

  private filterDices(diceToFilter: Dice) {
    this.dices = this.dices.filter((dice) => dice.getId() !== diceToFilter.getId());
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
    selectedDiceElem.innerText = `${dice.getFaceMeaning()}`;

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
    if (diceElem) diceElem.innerText = `${dice.getFaceMeaning()}`;
  }

  public deductHealthPoint(points: number) {
    this.health = points <= this.health ? this.health - points : 0; // Deduct health points only when the points are lesser than the overall health
    // Update the UI
    this.renderHealthPoints();
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
      // Game.increaseRound();
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

  public renderHealthPoints() {
    const healthPointAreaElem = document.getElementById(`player-${this.id}-health-point`);
    if (healthPointAreaElem) healthPointAreaElem.innerText = this.health.toString();
  }

  public reset() {
    // Set all the moves to zero
    this.totalArrowAttacksSelected = 0;
    this.totalAxeAttacksSelected = 0;
    this.totalArrowDefenceSelected = 0;
    this.totalAxeDefencesSelected = 0;
    this.totalStealSelected = 0;
    this.totalFavorTokensSelected = 0;

    // Empty the dice selection list
    this.selectedDices = [];
    // Update the UI
    const selectedDiceArea = document.getElementById(`selected-dices-area-${this.id}`);
    while (selectedDiceArea?.firstChild) {
      selectedDiceArea.firstChild.remove();
    }

    // Set the dices
    this.setDices();

    // Reset the total rounds to zero
    this.totalRounds = 0;

    // Reset the confirmation status
    this.confirmationStatus = false;

    // Display the confirmation button
    const confirmationBtn = document.getElementById(`confirm-selection-${this.id}`);
    if (confirmationBtn) confirmationBtn.style.display = "block";

    // Display the roll dice btn
    const diceRollBtn = document.getElementById(`dice-roll-button-${this.id}`);
    if (diceRollBtn) diceRollBtn.style.display = "block";

    // Hide the resolution area
    const resolutionAreaElem = document.getElementById("resolution-area");
    if (resolutionAreaElem) resolutionAreaElem.style.display = "none";
  }

  // Resolution phase related
  public renderPlayerResTable() {
    const arrowAttacksElem = document.getElementById(`player-${this.id}-arrow-attacks`);
    const axeAttacksElem = document.getElementById(`player-${this.id}-axe-attacks`);
    const arrowDefencesElem = document.getElementById(`player-${this.id}-arrow-defences`);
    const axeDefencesElem = document.getElementById(`player-${this.id}-axe-defences`);
    const stealElem = document.getElementById(`player-${this.id}-steal`);
    const favorTokensElem = document.getElementById(`player-${this.id}-favor-tokens`);

    if (arrowAttacksElem) arrowAttacksElem.innerText = `${this.totalArrowAttacksSelected}`;
    if (axeAttacksElem) axeAttacksElem.innerText = `${this.totalAxeAttacksSelected}`;
    if (arrowDefencesElem) arrowDefencesElem.innerText = `${this.totalArrowDefenceSelected}`;
    if (axeDefencesElem) axeDefencesElem.innerText = `${this.totalAxeDefencesSelected}`;
    if (stealElem) stealElem.innerText = `${this.totalStealSelected}`;
    if (favorTokensElem) favorTokensElem.innerText = `${this.totalFavorTokensSelected}`;
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

class ResolutionPhase {
  private player1: Player;
  private player2: Player;

  constructor(player1: Player, player2: Player) {
    this.player1 = player1;
    this.player2 = player2;
  }

  public render() {
    const resolutionAreaElem = document.getElementById("resolution-area");
    if (resolutionAreaElem) resolutionAreaElem.style.display = "block";
    // Player 1 related
    this.player1.renderPlayerResTable();
    // Player 2 related
    this.player2.renderPlayerResTable();
  }

  public compare() {
    // First compare player 1 arrow attacks and player 2 arrow defences
    if (
      this.player1.getPlayerMoves().totalArrowAttacks >
      this.player2.getPlayerMoves().totalArrowDefences
    ) {
      // Deduct healthpoints from player 2
      this.player2.deductHealthPoint(
        this.player1.getPlayerMoves().totalArrowAttacks -
          this.player2.getPlayerMoves().totalArrowDefences
      );
    }
    // Compare player 1 axe attacks and player 2 axe defences
    if (
      this.player1.getPlayerMoves().totalAxeAttacks > this.player2.getPlayerMoves().totalAxeDefences
    ) {
      // Deduct healthpoints from player 2
      this.player2.deductHealthPoint(
        this.player1.getPlayerMoves().totalAxeAttacks -
          this.player2.getPlayerMoves().totalAxeDefences
      );
    }

    // Compare player 2 arrow attacks and player 1 arrow defences
    if (
      this.player2.getPlayerMoves().totalArrowAttacks >
      this.player1.getPlayerMoves().totalArrowDefences
    ) {
      // Deduct healthpoints from player 1
      this.player1.deductHealthPoint(
        this.player2.getPlayerMoves().totalArrowAttacks -
          this.player1.getPlayerMoves().totalArrowDefences
      );
    }
    // Compare player 2 axe attacks and player 1 axe defences
    if (
      this.player2.getPlayerMoves().totalAxeAttacks > this.player1.getPlayerMoves().totalAxeDefences
    ) {
      // Deduct healthpoints from player 1
      this.player1.deductHealthPoint(
        this.player2.getPlayerMoves().totalAxeAttacks -
          this.player1.getPlayerMoves().totalAxeDefences
      );
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

    // Phase 2 - Resolution phase (after 3 rounds) (will be handled automatically during roll phase)
  }

  private static handleNextRoundBtnClick() {
    const nextRoundBtn = document.getElementById("next-roll-phase");
    nextRoundBtn?.addEventListener("click", () => {
      // Reset player 1
      this.player1.reset();
      // Reset player 2
      this.player2.reset();
    });
  }

  private static startRollPhase() {
    // Make player 1 ready
    this.player1.setDices();
    this.player1.renderHealthPoints();
    this.player1.handleDiceRollClick();
    this.player1.handleConfirmSelectionBtnClick((err) => {
      if (!err) this.checkForNextPhase();
    });

    // Make player 2 ready
    this.player2.setDices();
    this.player2.renderHealthPoints();
    this.player2.handleDiceRollClick();
    this.player2.handleConfirmSelectionBtnClick((err) => {
      if (!err) this.checkForNextPhase();
    });
  }

  // public static increaseRound() {
  //   this.totalRounds++;
  //   this.checkForNextPhase();
  // }

  private static checkForNextPhase() {
    if (this.player1.getConfirmedStatus() === true && this.player2.getConfirmedStatus() === true) {
      // Start resolution phase
      const resPhase = new ResolutionPhase(this.player1, this.player2);
      resPhase.render();
      resPhase.compare();

      Game.handleNextRoundBtnClick();
    }
  }
}

Game.new();
