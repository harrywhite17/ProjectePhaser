export default class Character {
    constructor(scene, x, y) {
        this.scene = scene;
        this.player = scene.physics.add.sprite(x, y, 'rpgCharacter', 0);
        this.player.setSize(24, 32);
        this.player.setOffset(4, 0);
        this.player.setDisplaySize(32, 32);
        this.player.setCollideWorldBounds(true);

        if (!scene.textures.exists('rpgCharacter')) {
            console.error('rpgCharacter spritesheet failed to load');
            this.player.setSize(16, 16);
        }

        this.hasMoved = false;
        this.isInvulnerable = true;
        this.canTakeDamage = true;
        this.jumpCount = 0;

        this.setupAnimations();
        this.player.anims.play('idle', true);

        scene.time.delayedCall(2000, () => {
            this.isInvulnerable = false;
        }, [], this);
    }

    setupAnimations() {
        const animations = [
            { key: 'idle', start: 0, end: 3, frameRate: 4, repeat: -1 },
            { key: 'run', start: 4, end: 9, frameRate: 10, repeat: -1 },
            { key: 'jump', start: 10, end: 14, frameRate: 8, repeat: 0 },
            { key: 'attack', start: 15, end: 18, frameRate: 10, repeat: 0 },
            { key: 'dead', start: 19, end: 22, frameRate: 8, repeat: 0 },
            { key: 'hit', start: 23, end: 24, frameRate: 10, repeat: 0 },
            { key: 'whitehit', start: 25, end: 26, frameRate: 10, repeat: 0 }
        ];
        animations.forEach(anim => {
            if (!this.scene.anims.exists(anim.key)) {
                this.scene.anims.create({
                    key: anim.key,
                    frames: this.scene.anims.generateFrameNumbers('rpgCharacter', { start: anim.start, end: anim.end }),
                    frameRate: anim.frameRate,
                    repeat: anim.repeat
                });
            }
        });
    }

    update(cursors, attackKey) {
        if (!this.player || !this.player.active) return;

        if (cursors.left.isDown) {
            this.player.setVelocityX(-160);
            this.player.setFlipX(true);
            if (this.player.body.blocked.down) this.player.anims.play('run', true);
            this.hasMoved = true;
        } else if (cursors.right.isDown) {
            this.player.setVelocityX(160);
            this.player.setFlipX(false);
            if (this.player.body.blocked.down) this.player.anims.play('run', true);
            this.hasMoved = true;
        } else {
            this.player.setVelocityX(0);
            if (this.player.body.blocked.down) this.player.anims.play('idle', true);
        }

        if (Phaser.Input.Keyboard.JustDown(cursors.up) && this.jumpCount < 2) {
            this.player.setVelocityY(-140);
            this.player.anims.play('jump', true);
            this.jumpCount++;
        }

        if (this.player.body.blocked.down) {
            this.jumpCount = 0;
            if (!cursors.left.isDown && !cursors.right.isDown) {
                this.player.anims.play('idle', true);
            }
        } else if (!this.player.anims.currentAnim || this.player.anims.currentAnim.key !== 'jump') {
            this.player.anims.play('jump', true);
        }

        if (Phaser.Input.Keyboard.JustDown(attackKey) && this.player.body.blocked.down) {
            this.player.anims.play('attack', true).once('animationcomplete', () => {
                if (this.player.body.blocked.down) this.player.anims.play('idle', true);
            });
        }

        if (!this.player.visible) {
            this.player.setVisible(true);
            this.player.anims.play('idle', true);
        }
    }

    hitEnemy(isLava = false) {
        if (!this.player.active || (!isLava && (!this.canTakeDamage || this.isInvulnerable))) return;
        this.canTakeDamage = false;

        const currentLives = this.scene.uiManager.getLives();
        if (currentLives > 0) {
            // Temporarily disable physics to prevent getting stuck
            this.player.body.enable = false;

            // Reset position and velocity
            this.player.setPosition(30, 200);
            this.player.setVelocity(0, 0);

            // Play hit animation and set invulnerability
            this.player.anims.play('hit', true).once('animationcomplete', () => {
                this.player.anims.play('idle', true);
                this.isInvulnerable = true;
                this.player.body.enable = true; // Re-enable physics
                this.scene.time.delayedCall(2000, () => {
                    this.isInvulnerable = false;
                    this.canTakeDamage = true;
                }, [], this);
            });
        } else {
            this.scene.physics.pause();
            this.player.anims.play('dead', true);
            this.player.active = false;
        }
    }

    getPlayer() {
        return this.player;
    }
}