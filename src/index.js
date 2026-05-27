import './styles/main.css';
import Game from './js/Game';

const game = new Game(4);
const boardElement = document.getElementById('game-board');
const resetBtn = document.getElementById('reset-btn');

game.init(boardElement);

game.onScoreUpdate = (score) => {
  console.log(`Score: ${score}`);
};

game.onMissesUpdate = (misses) => {
  console.log(`Misses: ${misses}`);
};

game.onGameEnd = (finalScore) => {
  console.log(`Game Over! Final score: ${finalScore}`);
};

game.start();

resetBtn.addEventListener('click', () => {
  game.reset();
});

if (module.hot) {
  module.hot.accept();
}
