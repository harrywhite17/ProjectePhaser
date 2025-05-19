import Character from './Character.js';
import UIManager from './UIManager.js';
import Enemy from './Enemy.js';

export default class World2 extends Phaser.Scene {
    constructor() {
        super('World2');
    }

    init(data) {
        this.lives = data.lives || 3;
        this.score = data.score || 0;
    }

    preload() {
        this.load.image('tiles', 'assets/tiles/Textures-16.png');
        this.load.image('lavaTiles', 'assets/tiles/Lava.png');
        this.load.image('portalTiles', 'assets/tiles/portal.png');
        this.load.image('coinTiles', 'assets/tiles/coin1_16x16.png');
        this.load.image('backgroundTiles', 'assets/tiles/Background_2.png');
        this.load.tilemapTiledJSON('level2', 'assets/tilemaps/level2.json');
        this.load.spritesheet('rpgCharacter', 'assets/sprites/RPGCharacterSprites32x32.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('coin', 'assets/tiles/coin1_16x16.png', { frameWidth: 16, frameHeight: 16 });
        this.load.spritesheet('enemy', 'assets/sprites/Enemy.png', { frameWidth: 32, frameHeight: 32 });
        this.load.audio('backgroundMusic', 'assets/audio/01 - Falling Apart (Prologue).mp3');

        this.load.on('filecomplete', (key) => {
            console.log(`Asset loaded successfully: ${key}`);
        });
        this.load.on('loaderror', (file) => {
            console.error(`Error loading file: ${file.key} from ${file.src}`, file.error);
        });
    }

    create() {
        const map = this.make.tilemap({ key: 'level2' });
        if (!map) {
            console.error('Failed to load tilemap: level2');
            return;
        }

        const tileset = map.addTilesetImage('Textures-16', 'tiles');
        const lavaTileset = map.addTilesetImage('Lava', 'lavaTiles');
        const portalTileset = map.addTilesetImage('portal', 'portalTiles');
        const coinTileset = map.addTilesetImage('coin1_16x16', 'coinTiles');
        const backgroundTileset = map.addTilesetImage('Background_2', 'backgroundTiles');

        if (!tileset || !lavaTileset || !portalTileset || !coinTileset || !backgroundTileset) {
            console.error('One or more tilesets failed to load');
            return;
        }

        const backgroundLayer = map.createLayer('Background', backgroundTileset, 0, 0);
        const platformLayer = map.createLayer('Tile Layer 1', tileset, 0, 0);
        const portalLayer = map.createLayer('Portal', portalTileset, 0, 0);
        this.lavaLayer = map.createLayer('Lava', lavaTileset, 0, 0);
        const coinLayer = map.createLayer('Coin', coinTileset, 0, 0);

        if (!backgroundLayer || !platformLayer || !portalLayer || !this.lavaLayer || !coinLayer) {
            console.error('One or more layers failed to create');
            return;
        }

        platformLayer.setCollision([1616, 1626, 1685, 1715, 1751]);
        this.lavaLayer.setCollisionByProperty({ collides: true });

        this.character = new Character(this, 30, 200);
        this.uiManager = new UIManager(this);
        this.uiManager.updateScore(this.score);
        this.uiManager.setLives(this.lives);

        this.enemies = this.physics.add.group();
        const platformTiles = platformLayer.layer.data;
        let spawnX = 28 * 16, spawnY = 13 * 16;
        for (let y = 0; y < platformTiles.length; y++) {
            for (let x = 0; x < platformTiles[y].length; x++) {
                const tile = platformTiles[y][x];
                if ((tile.index === 1616 || tile.index === 1626 || tile.index === 1685 || tile.index === 1715 || tile.index === 1751) &&
                    !this.lavaLayer.getTileAt(x, y)) {
                    spawnX = x * 16 + 8;
                    spawnY = y * 16 + 8;
                    break;
                }
            }
            if (spawnX !== 28 * 16) break;
        }
        const enemy = new Enemy(this, spawnX, spawnY);
        this.enemies.add(enemy.getSprite());
        this.physics.add.collider(this.enemies, platformLayer);

        this.physics.add.collider(this.character.getPlayer(), platformLayer);
        this.physics.add.overlap(this.character.getPlayer(), this.lavaLayer, () => {
            const player = this.character.getPlayer();
            const tile = this.lavaLayer.getTileAtWorldXY(player.x, player.y);
            if (
                tile && tile.index !== -1 &&
                !this.character.isInvulnerable &&
                this.character.canTakeDamage
            ) {
                this.character.hitEnemy(true);
                this.uiManager.setLives(this.uiManager.getLives() - 1);
            }
        }, null, this);
        this.physics.add.overlap(this.character.getPlayer(), portalLayer, this.enterPortal, null, this);

        this.coins = this.physics.add.group();
        if (coinLayer && coinLayer.layer) {
            coinLayer.layer.data.forEach(row => {
                row.forEach(tile => {
                    if (tile && tile.index === 1041) {
                        const coin = this.coins.create(tile.pixelX + 8, tile.pixelY + 8, 'coin', 0);
                        coin.setOrigin(0.5, 0.5);
                        coin.body.allowGravity = false;
                        coin.body.immovable = true;
                    }
                });
            });
        }

        if (!this.anims.exists('spin')) {
            this.anims.create({
                key: 'spin',
                frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 7 }),
                frameRate: 10,
                repeat: -1
            });
        }
        this.coins.children.iterate(coin => coin.play('spin'));

        // Play background music
        this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
        this.backgroundMusic.play();

        this.physics.add.overlap(this.character.getPlayer(), this.coins, (player, coin) => {
            this.uiManager.collectCoin(coin);
            coin.destroy();
        }, null, this);

        this.physics.add.overlap(this.character.getPlayer(), this.enemies, (player, enemy) => {
            if (!this.character.isInvulnerable && this.character.canTakeDamage) {
                this.character.hitEnemy();
                this.uiManager.setLives(this.uiManager.getLives() - 1);
                enemy.owner.attackPlayer();
            }
        }, null, this);

        this.physics.add.overlap(this.character.getPlayer(), this.enemies, (player, enemy) => {
            if (this.attackKey.isDown && this.character.getPlayer().anims.currentAnim.key === 'attack') {
                if (enemy.owner) {
                    enemy.owner.hitByPlayer();
                }
            }
        }, null, this);

        this.cameras.main.startFollow(this.character.getPlayer());
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(1.5);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.attackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update() {
        this.character.update(this.cursors, this.attackKey);
        this.enemies.getChildren().forEach(enemy => {
            if (enemy.owner) {
                enemy.owner.update();
            }
        });
        if (this.character.getPlayer().active && this.uiManager.getLives() <= 0) {
            this.scene.start('GameOverScreen', { score: this.uiManager.getScore() });
        }
    }

    enterPortal(player, tile) {
        if (tile.index >= 1025 && tile.index <= 1039 && this.character.hasMoved) {
            this.backgroundMusic.stop(); // Stop music when transitioning
            this.registry.set('score', this.uiManager.getScore());
            console.log('Transitioning to FinalScoreScreen with score:', this.uiManager.getScore());
            this.scene.start('FinalScoreScreen', { score: this.uiManager.getScore() });
        }
    }
}