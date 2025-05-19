export default class Enemy {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = scene.physics.add.sprite(x, y, 'enemy', 0);
        this.sprite.owner = this;
        this.sprite.setSize(24, 32);
        this.sprite.setOffset(4, 0);
        this.sprite.setDisplaySize(32, 32);
        this.sprite.setCollideWorldBounds(true);

        // Patrol range (3 blocks = 48 pixels)
        this.patrolRange = 48;
        this.patrolStartX = x;
        this.patrolDirection = 1; // 1 for right, -1 for left
        this.isAlive = true;
        this.isAttacking = false;

        if (!scene.textures.exists('enemy')) {
            console.error('Enemy spritesheet failed to load');
            this.sprite.setSize(16, 16);
        }

        this.setupAnimations();
        this.sprite.anims.play('enemyIdle', true);
    }

    setupAnimations() {
        const animations = [
            { key: 'enemyIdle', start: 0, end: 3, frameRate: 4, repeat: -1 },
            { key: 'enemyWalk', start: 0, end: 5, frameRate: 8, repeat: -1 },
            { key: 'enemyAttack', start: 0, end: 4, frameRate: 10, repeat: 0 },
            { key: 'enemyDeath', start: 0, end: 4, frameRate: 8, repeat: 0 }
        ];

        animations.forEach(anim => {
            if (!this.scene.anims.exists(anim.key)) {
                this.scene.anims.create({
                    key: anim.key,
                    frames: this.scene.anims.generateFrameNumbers('enemy', { start: anim.start, end: anim.end }),
                    frameRate: anim.frameRate,
                    repeat: anim.repeat
                });
            }
        });
    }

    update() {
        if (!this.sprite || !this.sprite.active || !this.isAlive) return;

        // Patrol movement
        if (!this.isAttacking) {
            this.sprite.setVelocityX(50 * this.patrolDirection);
            this.sprite.setFlipX(this.patrolDirection < 0);
            this.sprite.anims.play('enemyWalk', true);

            // Reverse direction if outside patrol range
            if (this.sprite.x > this.patrolStartX + this.patrolRange || this.sprite.x < this.patrolStartX - this.patrolRange) {
                this.patrolDirection *= -1;
            }
        }
    }

    hitByPlayer() {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.sprite.setVelocityX(0);
        this.sprite.anims.play('enemyDeath', true).once('animationcomplete', () => {
            this.sprite.destroy();
        });
    }

    attackPlayer() {
        if (!this.isAlive || this.isAttacking) return;

        this.isAttacking = true;
        this.sprite.setVelocityX(0);
        this.sprite.anims.play('enemyAttack', true).once('animationcomplete', () => {
            this.isAttacking = false;
            this.sprite.anims.play('enemyIdle', true);
        });
    }

    getSprite() {
        return this.sprite;
    }
}