
import './styles/main.css';
import Game from './js/Game';

const BOARD_SIZE = 4; // Размер игрового поля 4x4
const game = new Game(BOARD_SIZE);
const boardElement = document.getElementById('game-board');
const resetBtn = document.getElementById('reset-btn');

game.init(boardElement);
game.start();

resetBtn.addEventListener('click', () => {
  game.reset();
});

if (module.hot) {
  module.hot.accept();
}
