document.addEventListener("DOMContentLoaded", function(event) { 
  window.game = new TicTacToe();
});

class TicTacToe {
  
  constructor() {

    // Set default values
    this.winner = null;
    this.playerId = null;
    this.entries = this.createEntries();
    
    this.elements = this.getPlayerElements();
    
    this.openSession();

    this.setEventHandlers();
    this.setPlayerTypes();
    this.nextPlayer();

    
    this.winningPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4,6]
    ];
  }

  openSession() {
    const urlParams = document.location.href.split('?join=');
    if (urlParams.length === 2) {
      this.joinSession(urlParams[1]);
    } else {
      this.newSession();
    }
  }

  newSession() {
    const playerName = window.prompt("Player name") || 'Player 1';
    const sock = new WebSocket(`ws://localhost:4567/game?name=${playerName}`);
    sock.onmessage = (ev) => this.onMessageReceived(ev);
    sock.onerror = (ev) => {
     document.querySelector('.multiplayer').classList.add('hidden'); 
    }
    sock.onopen = (ev) => {
      this.socket = sock;
    };

  }

  joinSession(gameId) {
    const playerName = window.prompt("Player name") || "Player 2";
    const sock = new WebSocket(`ws://localhost:4567/game?name=${playerName}&gameId=${gameId}`)
    sock.onmessage = (ev) => this.onMessageReceived(ev);

    document.querySelector('.multiplayer').classList.add('hidden');
    this.socket = sock;
  }
  
  setEventHandlers() {

    // handle click event on .entry elements
    this.entries.forEach(entry => {
      entry.element.addEventListener('click', () => {
        this.onEntryClick(entry);
      });
    })
    
    // handle click event on .replay element to reset game
    
    document.querySelector('.replay').addEventListener('click', () => this.onResetRequest());
  }

  onMessageReceived(event) {
    const data = JSON.parse(event.data);
    console.log(data);

    this.playerId = data.playerId || this.playerId;
    this.gameId = data.gameId || this.gameId;

    if (data.action === 'session_created') {
      this.onSessionStarted(data);
    } else if (data.action === 'session_joined') {
      this.onSessionJoined(data);
    } else if (data.action === 'game_ready') {
      this.onGameReady(data);
    } else if (data.action === 'play') {
      this.onRemotePlay(data);
    } else if (data.action === 'restart') {
      this.onRestart(data);
    } else if (data.action === 'waiting_player') {
      alert('Waiting for player 2 to join');
      return;
    }else if (data.action === 'finished') {
      this.onFinishGame(data);
    }
  }

  onSessionStarted(data) {
    if (data.gameId) {
      document.querySelector('.multiplayer-url').innerText = `http://localhost:8080/?join=${data.gameId}`;
    }

    if (data.firstPlayer) {
      this.setPlayerName(1, data.firstPlayer);
    }
  }

  onSessionJoined(data) {

  }

  onGameReady(data) {

    document.querySelector('.multiplayer').classList.add('hidden');
    document.querySelector('.replay').classList.remove("hidden");
    if (data.firstPlayer) {
      this.setPlayerName(1, data.firstPlayer);
    }

    if (data.secondPlayer) {
      this.setPlayerName(2, data.secondPlayer);
    }

    this.setPlayerTurn(data.playerTurn);

  }

  onRestart(data) {
    this.resetGame();
  }
  onRemotePlay(data) {
    const session = new GameSession(data);
    this.updateSession(session);
  }

  updateSession(data) {

    if (data.firstPlayer) {
      this.setPlayerName(1, data.firstPlayer);
    }

    if (data.secondPlayer) {
      this.setPlayerName(2, data.secondPlayer);
    }

    this.setPlayerTurn(data.playerTurn);

    if (data.moves) {
      Object.keys(data.moves).forEach(i => {
        this.setIsEntryPlayed(this.entries[i], true, data.moves[i]);
      });
    }

  }

  onFinishGame(data) {
    console.log('Game finished');
    console.log(data);
    if (data.hasWinner) {
      this.winner = data.winningPlayer;
    }
    this.finishGame(data.winningPattern);
  }

  setPlayerTurn(player) {
    this.playerTurn = player === 1 ? this.players.CROSS : this.players.CIRCLE;
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
    
    if (this.socket) {
      const data = {action: 'play', playerId: this.playerId, gameId: this.gameId, move: entry.index};
      console.log('Sending...', data);
      this.socket.send(JSON.stringify(data));
      return;
    }
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

  onResetRequest() {
    if (this.socket) {
      const data = {action: 'restart', gameId: this.gameId, playerId: this.playerId};
      this.socket.send(JSON.stringify(data));
    } else {
      this.resetGame();
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

    if (!this.socket) {
      this.nextPlayer();
    }
  }
  
  setIsEntryPlayed(entry, value, player = null) {
    entry.isPlayed = value;
    entry.playedBy = player;
    entry.element.setAttribute('is-played', value);

    // if marking entry as played=true then also make sure we mark it with "X" or "O" for the current player
    if (value && player !== null) {
      const playerElement = this.getElementForPlayer(player);
      entry.element.innerHTML = null;
      entry.element.appendChild(playerElement);
    }
  }
  
  getEntriesForLine(line) {
    // For each index in the array return its corresponding entry
    return line.map(index => {
      return this.entries.find(e => e.index === index);
    });
  }

  setPlayerName(player, name) {
    document.querySelector(`.name-${player}`).innerText = name;
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

class GameSession {
  constructor(data) {
    this.firstPlayer = data.firstPlayer;
    this.secondPlayer = data.secondPlayer
    this.gameId = data.gameId;
    this.moves = data.moves;
    this.playerTurn = data.playerTurn;
  }
}