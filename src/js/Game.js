
import gnomeImage from '../img/goblin.png';

// Именованные константы для игры
const DEFAULT_BOARD_SIZE = 4;
const DEFAULT_MOVE_INTERVAL = 1000; // Интервал перемещения в миллисекундах (1 секунда)
const MAX_MISSES = 5; // Максимальное количество промахов для окончания игры
const GNOME_SIZE = 80; // Размер гнома в процентах
const ANIMATION_DURATION = 0.3; // Длительность анимации в секундах
const POSITION_TOP = 50; // Позиция сверху в процентах
const POSITION_LEFT = 50; // Позиция слева в процентах

export default class Game {
  constructor(boardSize = DEFAULT_BOARD_SIZE) {
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

    const totalCells = this.boardSize * this.boardSize;
    for (let i = 0; i < totalCells; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      this.boardElement.append(cell);
      this.cells.push(cell);
    }
  }

  createGnome() {
    this.gnomeElement = document.createElement('img');
    this.gnomeElement.src = gnomeImage;
    this.gnomeElement.className = 'gnome';
    this.gnomeElement.alt = 'Gnome';
    this.gnomeElement.style.width = `${GNOME_SIZE}%`;
    this.gnomeElement.style.height = `${GNOME_SIZE}%`;
    this.gnomeElement.style.position = 'absolute';
    this.gnomeElement.style.top = `${POSITION_TOP}%`;
    this.gnomeElement.style.left = `${POSITION_LEFT}%`;
    this.gnomeElement.style.transform = 'translate(-50%, -50%)';
    this.gnomeElement.style.cursor = 'pointer';
    this.gnomeElement.style.pointerEvents = 'auto';
    this.gnomeElement.style.transition = `all ${ANIMATION_DURATION}s ease`;
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

  start(moveInterval = DEFAULT_MOVE_INTERVAL) {
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
      this.gnomeElement.remove();
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
      this.gnomeElement.remove();
    }

    this.cells[newPosition].append(this.gnomeElement);
    this.currentPosition = newPosition;
  }

  getRandomPosition() {
    const totalCells = this.boardSize * this.boardSize;
    return Math.floor(Math.random() * totalCells);
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

    if (this.misses >= MAX_MISSES) {
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

    // Проверяем, не в тестовом ли мы окружении
    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'test') {
      alert(`Игра окончена! Ваш счёт: ${this.score}`);
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
