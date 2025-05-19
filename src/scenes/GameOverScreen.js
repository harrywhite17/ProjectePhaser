export default class GameOverScreen extends Phaser.Scene {
    constructor() {
        super('GameOverScreen');
    }

    create() {
        this.add.text(400, 300, 'Game Over! Press SPACE to Restart', { fontSize: '32px' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('StartScreen'));
        this.input.keyboard.on('keydown-SPACE', () => this.scene.start('StartScreen'));
    }
}