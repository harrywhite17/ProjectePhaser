export default class FinalScoreScreen extends Phaser.Scene {
    constructor() {
        super('FinalScoreScreen');
    }

    create() {
        this.add.text(400, 250, 'Game Completed!', { fontSize: '32px' }).setOrigin(0.5);
        this.add.text(400, 300, `Score: ${this.registry.get('score') || 0}`, { fontSize: '24px' }).setOrigin(0.5);
        this.add.text(400, 350, 'Press SPACE to Return', { fontSize: '20px' })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => this.scene.start('StartScreen'));
        this.input.keyboard.on('keydown-SPACE', () => this.scene.start('StartScreen'));
    }
}