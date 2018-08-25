document.addEventListener("DOMContentLoaded", function(event) { 
  window.game = new TicTacToe();
});

class TicTacToe {

  constructor() {
    this.resetGame();

    this.elements = this.getElements();
    this.setEventHandlers();
    this.setPlayerTypes();
    this.nextPlayer();

    this.model = Array(9);
  }

  setPlayerTypes() {
    this.playerNames = ['Player 1', 'Player 2'];
    this.players = {CROSS: 0, CIRCLE: 1};
  }

  setEventHandlers() {
    Array.from(document.querySelectorAll('.entry')).forEach(entry => {

      entry.addEventListener('click', () => {
        this.onEntryClick(entry);
      });
    })

    document.querySelector('.replay').addEventListener('click', () => this.resetGame());

  }

  onEntryClick(entry) {

    if (this.winner !== null) return false;
    if (this.getIsEntryPlayed(entry)) return false;

    const entryIndex = entry.getAttribute('data-entry');
    this.model[entryIndex] = this.playerTurn;

    this.checkForWinner();
    const element = this.getElementForNextPlayer();
    entry.appendChild(element);

    this.setIsEntryPlayed(entry, 'true');
    this.nextPlayer();
  }

  nextPlayer() {

    this.playerTurn = this.playerTurn === this.players.CROSS ? this.players.CIRCLE : this.players.CROSS;
    const sides = document.querySelectorAll('.side-content');
    Array.from(sides).forEach(side => {
      side.setAttribute('current-play', false);
      if (parseInt(side.getAttribute('data-player'), 10) === this.playerTurn) {
        side.setAttribute('current-play', true);
      }
    });
  }

  getElementForNextPlayer() {
    const playerTurn = this.playerTurn;
    const element = this.elements[playerTurn].cloneNode(true);
    return element;
  }

  getElements() {
    const cross = document.querySelector('.elements .option-cross').cloneNode(true);
    const circle = document.querySelector('.elements .option-circle').cloneNode(true);
    return {0: cross, 1: circle};
  }

  checkForWinner() {
    const model = this.model;
    const player = this.playerTurn;

    const isWinner = (line) => {
        const result = this.model.filter((play, entryIndex, model) => {
            return line.includes(entryIndex) && model[entryIndex] === player;
        });
        
        return result.length === 3;
    };

    const wins = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4,6]
    ];

    for (let i = 0; i < wins.length; i++) {
        const line = wins[i];
        if(isWinner(line)) {
            this.winner = this.playerTurn;
            this.finishGame(line);
            break;
        }
    }

    if (this.model.filter(entry => entry === 0 || entry === 1).length === 9) {
        this.finishGame();
    }

  }
  

  finishGame(winningLine) {
      if (this.winner !== null) {
          const winnerHeader = document.querySelector(`.score-${this.winner}`);
          if (winnerHeader) {
              winnerHeader.innerText = parseInt(winnerHeader.textContent, 10) + 1;
              const entries = this.getEntriesForLine(winningLine);
              entries.forEach(e => e.classList.add('entry--highlighted'));
          }
      }

      document.querySelector('.replay').classList.add('show');
  }

  resetGame() {

      this.winner = null;

      document.querySelector('.replay').classList.remove('show');

      this.model = Array(9);

      Array.from(document.querySelectorAll('.board .option')).forEach(el => {
          el.remove();
      });

      Array.from(document.querySelectorAll('.board .entry')).forEach(entry => {
        this.setIsEntryPlayed(entry, 'false');
        entry.classList.remove('entry--highlighted');
      });
  }

  getIsEntryPlayed(entry) {
    return entry.getAttribute('is-played') === 'true';
  }

  setIsEntryPlayed(entry, value) {
    entry.setAttribute('is-played', value);
  }

  getEntriesForLine(line) {
    return line.map(l => {
        return document.querySelector(`.entry-${l}`);
    });
  }
  
}