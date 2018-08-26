document.addEventListener("DOMContentLoaded", function(event) { 
  window.game = new TicTacToe();
});

class TicTacToe {
  
  constructor() {

    // Set default values
    this.winner = null;
    this.entries = this.createEntries();
    
    this.elements = this.getPlayerElements();
    

    this.setEventHandlers();
    this.setPlayerTypes();
    this.nextPlayer();
    
    this.winningPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4,6]
    ];
  }
  
  setEventHandlers() {

    // handle click event on .entry elements
    this.entries.forEach(entry => {
      entry.element.addEventListener('click', () => {
        this.onEntryClick(entry);
      });
    })
    
    // handle click event on .replay element to reset game
    document.querySelector('.replay').addEventListener('click', () => this.resetGame());
    
  }

  setPlayerTypes() {
    // Set player names and player side
    this.playerNames = ['Player 1', 'Player 2'];
    this.players = {CROSS: 0, CIRCLE: 1};
  }
  
  /**
   * Handles the player's current move
   * @param {Entry} entry 
   */
  onEntryClick(entry) {
    
    // if there is a winner or current entry already played do nothing
    if (this.winner !== null || entry.isPlayed) return false;
    
    // Mark entry as played and check for a winner
    this.setIsEntryPlayed(entry, true, this.playerTurn);
    this.checkForWinner();
    
    // If still no winner continue to next player
    if (this.winner === null) {
      this.nextPlayer();
    }
  }
  
  /**
   * Triggers next player's turn
   */
  nextPlayer() {

    // Toggle playerTurn
    this.playerTurn = this.playerTurn === this.players.CROSS ? this.players.CIRCLE : this.players.CROSS;

    // Get board for each player
    const sides = document.querySelectorAll('.scoreboard-content');

    // Highlight the current player's board to indicate it's their move
    Array.from(sides).forEach(side => {
      if (parseInt(side.getAttribute('data-player'), 10) === this.playerTurn) {
        side.setAttribute('current-play', true);
      } else {
        side.setAttribute('current-play', false);
      }
    });
  }
  
  /**
   * Returns a cloned DOM element for the player's move
   * @param {number} player Player's index (0 for X, 1 for O)
   */
  getElementForPlayer(player) {
    const element = this.elements[player].cloneNode(true);
    return element;
  }
  
  /**
   * Returns an object mapping the DOM elements to the player's index
   */
  getPlayerElements() {
    const cross = document.querySelector('.elements .option-cross').cloneNode(true);
    const circle = document.querySelector('.elements .option-circle').cloneNode(true);
    return {0: cross, 1: circle};
  }
  
  /**
   * Checks if there is a current winner
   */
  checkForWinner() {
    const entries = this.entries;
    const currentPlayer = this.playerTurn;
    const winningPatterns = this.winningPatterns;
    
    // Loop for each winning set indexes
    for (let i = 0; i < winningPatterns.length; i++) {
      const line = winningPatterns[i];
      
      // And check if those 3 entries indexes have been played by the current player
      const isWinner = entries.filter((entry) => {
        return entry.playedBy === currentPlayer && line.includes(entry.index);
      }).length === 3;
      

      if(isWinner) {
        this.winner = currentPlayer;
        this.finishGame(line);
        break;
      }
    }
    
    // if there was a winner stop 
    if (this.winner !== null) return false;
    
    // if there are no more entries to be played finish the game
    if (!entries.find(entry => entry.playedBy === null)) {
      this.finishGame();
    }
    
  }
  
  /**
   * Finishes the game, if there is a winner, increment their score and highlights the winning move
   * @param {number[]} winningLine Optional: The winning index combination
   */
  finishGame(winningLine) {

    // if there was a winner
    if (this.winner !== null) {

      // Get its scoreboard
      const winnerHeader = document.querySelector(`.score-${this.winner}`);
      if (winnerHeader) {

        // And increment win count
        winnerHeader.innerText = parseInt(winnerHeader.textContent, 10) + 1;

        // Highlight winning line
        const entries = this.getEntriesForLine(winningLine);
        this.entriesToggleHighlight(entries, true);
      }
    }
    
    // Show "play again"
    document.querySelector('.replay').classList.add('show');
  }
  
  entriesToggleHighlight(entries, highlightValue) {
    if (highlightValue) {
      entries.forEach(e => e.element.classList.add('entry--highlighted'));
    } else {
      entries.forEach(e => e.element.classList.remove('entry--highlighted'));
    }
  }
  
  resetGame() {
    
    this.winner = null;
    
    document.querySelector('.replay').classList.remove('show');
    
    // Remove all play objects
    Array.from(document.querySelectorAll('.board .option')).forEach(el => {
      el.remove();
    });
    
    // Reset entries properties
    this.entries.forEach(entry => {
      this.setIsEntryPlayed(entry, false, null);
      this.entriesToggleHighlight([entry], false);
    });

    // Triger next player
    this.nextPlayer();
  }
  
  setIsEntryPlayed(entry, value, player = null) {
    entry.isPlayed = value;
    entry.playedBy = player;
    entry.element.setAttribute('is-played', value);

    // if marking entry as played=true then also make sure we mark it with "X" or "O" for the current player
    if (value && player !== null) {
      const playerElement = this.getElementForPlayer(player);
      entry.element.appendChild(playerElement);
    }
  }
  
  getEntriesForLine(line) {
    // For each index in the array return its corresponding entry
    return line.map(index => {
      return this.entries.find(e => e.index === index);
    });
  }
  
  createEntries() {

    // For each .entry element create an Entry instance
    const elements = document.querySelectorAll('.board .entry');
    return Array.from(elements).map(element => {
      return new Entry(element);
    })
  }
  
}

class Entry {
  constructor(entryElement) {
    this.element = entryElement;
    this.index = +entryElement.getAttribute('data-entry');
    this.isPlayed = false;
    this.playedBy = null;
  }
}
