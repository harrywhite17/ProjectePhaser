export default class StartScreen extends Phaser.Scene {
    constructor() {
        super('StartScreen');
    }

    create() {
        console.log('StartScreen create called');
        this.cameras.main.setBounds(0, 0, 800, 600); // Match canvas size
        this.cameras.main.setZoom(1); // Ensure no zoom issues
        this.cameras.main.setBackgroundColor('#000000'); // Black background

        const text = this.add.text(400, 300, 'Press SPACE to Start', {
            fontFamily: 'Arial',
            fontSize: '32px',
            color: '#ffffff', // White text
            backgroundColor: '#333333' // Dark gray background for contrast
        })
            .setOrigin(0.5)
            .setInteractive()
            .on('pointerdown', () => {
                console.log('Transitioning to World1 via click');
                this.scene.start('World1');
            });

        this.input.keyboard.on('keydown-SPACE', () => {
            console.log('Transitioning to World1 via keyboard');
            this.scene.start('World1');
        });
    }
}