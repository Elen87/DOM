import Game from '../src/js/Game';

describe('Game class', () => {
  let game;
  let mockBoardElement;

  beforeEach(() => {
    game = new Game(4);
    mockBoardElement = document.createElement('div');
    mockBoardElement.id = 'game-board';
    document.body.appendChild(mockBoardElement);

    const scoreElement = document.createElement('span');
    scoreElement.id = 'score';
    const missesElement = document.createElement('span');
    missesElement.id = 'misses';
    document.body.appendChild(scoreElement);
    document.body.appendChild(missesElement);

    game.init(mockBoardElement);
    game.onScoreUpdate = jest.fn();
    game.onMissesUpdate = jest.fn();
    game.onGameEnd = jest.fn();
  });

  afterEach(() => {
    game.destroy();
    document.body.innerHTML = '';
  });

  describe('constructor', () => {
    test('should initialize with default values', () => {
      expect(game.boardSize).toBe(4);
      expect(game.cells).toHaveLength(16);
      expect(game.currentPosition).toBeNull();
      expect(game.score).toBe(0);
      expect(game.misses).toBe(0);
      expect(game.isRunning).toBe(false);
    });

    test('should create board with correct size', () => {
      expect(game.cells.length).toBe(16);
      expect(mockBoardElement.children.length).toBe(16);
    });
  });

  describe('createBoard', () => {
    test('should create 4x4 grid', () => {
      const cells = document.querySelectorAll('.cell');
      expect(cells.length).toBe(16);
    });

    test('should clear existing board', () => {
      game.createBoard();
      expect(mockBoardElement.children.length).toBe(16);
    });
  });

  describe('createGnome', () => {
    test('should create gnome element', () => {
      expect(game.gnomeElement).toBeTruthy();
      expect(game.gnomeElement.tagName).toBe('IMG');
      expect(game.gnomeElement.className).toBe('gnome');
    });
  });

  describe('getRandomPosition', () => {
    test('should return number between 0 and 15', () => {
      for (let i = 0; i < 100; i++) {
        const pos = game.getRandomPosition();
        expect(pos).toBeGreaterThanOrEqual(0);
        expect(pos).toBeLessThan(16);
      }
    });
  });

  describe('moveToRandomPosition', () => {
    test('should move gnome to new position', () => {
      game.start();
      const oldPosition = game.currentPosition;
      game.moveToRandomPosition();
      expect(game.currentPosition).not.toBe(oldPosition);
    });

    test('should not move to same position', () => {
      game.start();
      let samePositionCount = 0;

      for (let i = 0; i < 50; i++) {
        const oldPosition = game.currentPosition;
        game.moveToRandomPosition();
        if (game.currentPosition === oldPosition) {
          samePositionCount += 1;
        }
      }

      expect(samePositionCount).toBe(0);
    });
  });

  describe('hit', () => {
    test('should increase score', () => {
      game.start();
      const initialScore = game.score;
      game.hit();
      expect(game.score).toBe(initialScore + 1);
    });

    test('should update score display', () => {
      game.start();
      const scoreElement = document.getElementById('score');
      game.hit();
      expect(scoreElement.textContent).toBe('1');
    });

    test('should move gnome after hit', () => {
      game.start();
      const oldPosition = game.currentPosition;
      game.hit();
      expect(game.currentPosition).not.toBe(oldPosition);
    });
  });

  describe('miss', () => {
    test('should increase misses', () => {
      game.start();
      const initialMisses = game.misses;
      game.miss();
      expect(game.misses).toBe(initialMisses + 1);
    });

    test('should update misses display', () => {
      game.start();
      const missesElement = document.getElementById('misses');
      game.miss();
      expect(missesElement.textContent).toBe('1');
    });

    test('should end game after 5 misses', () => {
      game.start();

      for (let i = 0; i < 5; i++) {
        game.miss();
      }

      expect(game.isRunning).toBe(false);
    });
  });

  describe('start', () => {
    test('should start game', () => {
      game.start();
      expect(game.isRunning).toBe(true);
      expect(game.score).toBe(0);
      expect(game.misses).toBe(0);
    });

    test('should not start if already running', () => {
      game.start();
      game.start();
      expect(game.isRunning).toBe(true);
    });

    test('should move gnome to random position on start', () => {
      game.start();
      expect(game.currentPosition).not.toBeNull();
      expect(game.gnomeElement.parentNode).not.toBeNull();
    });
  });

  describe('stop', () => {
    test('should stop game', () => {
      game.start();
      game.stop();
      expect(game.isRunning).toBe(false);
      expect(game.intervalId).toBeNull();
    });

    test('should remove gnome from board', () => {
      game.start();
      game.stop();
      expect(game.gnomeElement.parentNode).toBeNull();
    });
  });

  describe('reset', () => {
    test('should reset game state', () => {
      game.start();
      game.hit();
      game.hit();
      game.miss();

      game.reset();

      expect(game.score).toBe(0);
      expect(game.misses).toBe(0);
      expect(game.isRunning).toBe(true);
    });
  });

  describe('gameOver', () => {
    test('should stop game on game over', () => {
      game.start();

      for (let i = 0; i < 5; i++) {
        game.miss();
      }

      expect(game.isRunning).toBe(false);
    });
  });

  describe('event listeners', () => {
    test('should handle click on gnome', () => {
      game.start();
      const initialScore = game.score;

      const cell = game.cells[game.currentPosition];
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
      });
      Object.defineProperty(clickEvent, 'target', { value: game.gnomeElement });
      cell.dispatchEvent(clickEvent);

      expect(game.score).toBe(initialScore + 1);
    });

    test('should handle click on empty cell', () => {
      game.start();
      const initialMisses = game.misses;

      const emptyCell = game.cells.find((cell, index) => index !== game.currentPosition);
      emptyCell.click();

      expect(game.misses).toBe(initialMisses + 1);
    });
  });

  describe('callbacks', () => {
    test('should call onScoreUpdate when score changes', () => {
      game.start();
      game.hit();
      expect(game.onScoreUpdate).toHaveBeenCalledWith(1);
    });

    test('should call onMissesUpdate when misses changes', () => {
      game.start();
      game.miss();
      expect(game.onMissesUpdate).toHaveBeenCalledWith(1);
    });
  });
});
