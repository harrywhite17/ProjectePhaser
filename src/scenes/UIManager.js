export default class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.score = 0;
        this.lives = 3;

        // Center UI text based on current game width
        const centerX = scene.scale.width / 2;

        this.scoreText = scene.add.text(centerX, 16, 'Coins: 0', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

        this.livesText = scene.add.text(centerX, 40, 'Lives: 3', {
            fontFamily: 'Arial, sans-serif',
            fontSize: '24px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(1000);

        this.scoreText.setVisible(true);
        this.livesText.setVisible(true);
    }

    updateScore(score) {
        this.score = score;
        this.scoreText.setText('Coins: ' + this.score);
    }

    setLives(lives) {
        this.lives = lives;
        this.livesText.setText('Lives: ' + this.lives);
    }

    collectCoin(coin) {
        coin.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText('Coins: ' + this.score);
    }

    getScore() {
        return this.score;
    }

    getLives() {
        return this.lives;
    }
}