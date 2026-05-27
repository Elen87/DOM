import gnomeImage from '../img/goblin.png';

export default class Game {
  constructor(boardSize = 4) {
    this.boardSize = boardSize;
    this.cells = [];
    this.gnomeElement = null;
    this.currentPosition = null;
    this.intervalId = null;
    this.score = 0;
    this.misses = 0;
    this.isRunning = false;
    this.onScoreUpdate = null;
    this.onMissesUpdate = null;
    this.onGameEnd = null;
    this.boardElement = null;
  }

  init(boardElement) {
    this.boardElement = boardElement;
    this.createBoard();
    this.createGnome();
    this.addEventListeners();
  }

  createBoard() {
    if (!this.boardElement) return;
    this.boardElement.innerHTML = '';
    this.cells = [];

    for (let i = 0; i < this.boardSize * this.boardSize; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      this.boardElement.appendChild(cell);
      this.cells.push(cell);
    }
  }

  createGnome() {
    this.gnomeElement = document.createElement('img');
    this.gnomeElement.src = gnomeImage;
    this.gnomeElement.className = 'gnome';
    this.gnomeElement.alt = 'Gnome';
    this.gnomeElement.style.width = '80%';
    this.gnomeElement.style.height = '80%';
    this.gnomeElement.style.position = 'absolute';
    this.gnomeElement.style.top = '50%';
    this.gnomeElement.style.left = '50%';
    this.gnomeElement.style.transform = 'translate(-50%, -50%)';
    this.gnomeElement.style.cursor = 'pointer';
    this.gnomeElement.style.pointerEvents = 'auto';
  }

  addEventListeners() {
    this.cells.forEach((cell) => {
      cell.addEventListener('click', (event) => {
        if (!this.isRunning) return;

        if (event.target === this.gnomeElement || cell.contains(this.gnomeElement)) {
          this.hit();
        } else {
          this.miss();
        }
      });
    });
  }

  start(moveInterval = 1000) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.score = 0;
    this.misses = 0;
    this.updateScore();
    this.updateMisses();

    this.moveToRandomPosition();

    this.intervalId = setInterval(() => {
      if (this.isRunning) {
        this.moveToRandomPosition();
      }
    }, moveInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;

    if (this.gnomeElement && this.gnomeElement.parentNode) {
      this.gnomeElement.parentNode.removeChild(this.gnomeElement);
    }
  }

  reset() {
    const wasRunning = this.isRunning;
    this.stop();
    this.score = 0;
    this.misses = 0;
    this.updateScore();
    this.updateMisses();
    if (wasRunning) {
      this.start();
    }
  }

  moveToRandomPosition() {
    if (!this.gnomeElement) return;

    const newPosition = this.getRandomPosition();

    if (newPosition === this.currentPosition) {
      this.moveToRandomPosition();
      return;
    }

    if (this.gnomeElement.parentNode) {
      this.gnomeElement.parentNode.removeChild(this.gnomeElement);
    }

    this.cells[newPosition].appendChild(this.gnomeElement);
    this.currentPosition = newPosition;
  }

  getRandomPosition() {
    return Math.floor(Math.random() * (this.boardSize * this.boardSize));
  }

  hit() {
    this.score += 1;
    this.updateScore();

    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score);
    }

    this.moveToRandomPosition();
  }

  miss() {
    this.misses += 1;
    this.updateMisses();

    if (this.onMissesUpdate) {
      this.onMissesUpdate(this.misses);
    }

    if (this.misses >= 5) {
      this.gameOver();
    }
  }

  updateScore() {
    const scoreElement = document.getElementById('score');
    if (scoreElement) {
      scoreElement.textContent = this.score;
    }
  }

  updateMisses() {
    const missesElement = document.getElementById('misses');
    if (missesElement) {
      missesElement.textContent = this.misses;
    }
  }

  gameOver() {
    this.stop();

    if (this.onGameEnd) {
      this.onGameEnd(this.score);
    }

    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
      alert(`Игра окончена! Ваш счёт: ${this.score}`); // eslint-disable-line no-alert
    }
  }

  destroy() {
    this.stop();
    if (this.boardElement) {
      this.boardElement.innerHTML = '';
    }
    this.cells = [];
    this.gnomeElement = null;
    this.currentPosition = null;
  }
}
