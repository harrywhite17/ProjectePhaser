import StartScreen from './scenes/StartScreen.js';
import World1 from './scenes/World1.js';
import World2 from './scenes/World2.js';
import GameOverScreen from './scenes/GameOverScreen.js';
import FinalScoreScreen from './scenes/FinalScoreScreen.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 300 }, debug: false }
    },
    scene: [StartScreen, World1, World2, GameOverScreen, FinalScoreScreen],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);