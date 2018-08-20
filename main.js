document.addEventListener("DOMContentLoaded", function(event) { 
  window.game = new TicTacToe();
});

class TicTacToe {

  constructor() {
    this.elements = this.getElements();
    this.setEventHandlers();
    this.setPlayerTypes();
    this.nextPlayer();

  }

  setPlayerTypes() {
    this.players = {CROSS: 0, CIRCLE: 1};
  }

  setEventHandlers() {
    Array.from(document.querySelectorAll('.entry')).forEach(entry => {

      entry.addEventListener('click', () => {

        if (this.getIsEntryPlayed(entry)) return false;

        const element = this.getElementForNextPlayer();
        entry.appendChild(element);

        this.setIsEntryPlayed(entry);
        this.nextPlayer();
      });
    })

  }

  nextPlayer() {
    if (!this.isStarted) {
      this.playerTurn = 0;
      this.isStarted = true;
      return;
    }

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

  getIsEntryPlayed(entry) {
    return entry.getAttribute('is-played');
  }

  setIsEntryPlayed(entry) {
    entry.setAttribute('is-played', true);
  }


  
}