// ─── Wraptopia: A Cozy Eco-RPG ───

const NPC_LORE = {
    KernelPop:  "Cornstarch packaging is a-maize-ing! It's biodegradable.",
    SaltySal:   "Seaweed wraps are totally tubular and edible, dude.",
    MushRoomie: "I grew this box from mushroom roots. Stay grounded.",
    BambBoomer: "Bamboo is stronger than your modern plastics! Hmph!",
    QueenBee:   "Bzzz! Beeswax wraps keep things fresh, honey!"
};

const INTERACT_DIST = 32;
const PLAYER_SPEED = 80;
const FONT_FAMILY = '"Press Start 2P", monospace';
const KNIGHTS_FIRSTGID = 133;
const GAME_W = 800;
const GAME_H = 600;

// ─── Retro SFX via Web Audio API ───
class RetroSFX {
    constructor() {
        this.ctx = null;
    }

    _ensure() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.ctx.state === "suspended") {
            this.ctx.resume();
        }
    }

    interact() {
        this._ensure();
        const now = this.ctx.currentTime;
        [440, 660].forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0.15, now + i * 0.06);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);
            osc.connect(gain).connect(this.ctx.destination);
            osc.start(now + i * 0.06);
            osc.stop(now + i * 0.06 + 0.1);
        });
    }

    typewriter() {
        this._ensure();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.value = 600 + Math.random() * 200;
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.03);
    }

    close() {
        this._ensure();
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.connect(gain).connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    }
}

const sfx = new RetroSFX();

// ─── Boot Scene ───
class BootScene extends Phaser.Scene {
    constructor() {
        super("BootScene");
    }

    preload() {
        this.load.tilemapTiledJSON("map", "assets/map.json");
        this.load.image("tiny_town_tiles", "assets/kenney_tiny-town/Tilemap/tilemap_packed.png");
        this.load.spritesheet("knights", "assets/knights.png", {
            frameWidth: 16,
            frameHeight: 16
        });
        this.load.audio("bgmusic", "rpg-music.mp3");
    }

    create() {
        document.fonts.load('16px "Press Start 2P"').then(() => {
            this.scene.start("TitleScene");
        }).catch(() => {
            this.scene.start("TitleScene");
        });
    }
}

// ─── Title Scene (zoom 1, map scaled 2x) ───
class TitleScene extends Phaser.Scene {
    constructor() {
        super("TitleScene");
    }

    create() {
        const MAP_SCALE = 2;

        const map = this.make.tilemap({ key: "map" });
        const townTiles = map.addTilesetImage("tiny_town_tiles", "tiny_town_tiles");
        const charTiles = map.addTilesetImage("roguelikeChar_transparent", "knights");

        map.createLayer("Ground", townTiles, 0, 0).setScale(MAP_SCALE);
        map.createLayer("Obstacles", [townTiles, charTiles], 0, 0).setScale(MAP_SCALE);

        const scaledH = map.heightInPixels * MAP_SCALE;
        this.tweens.add({
            targets: this.cameras.main,
            scrollY: { from: -30, to: scaledH - GAME_H + 30 },
            duration: 20000,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1
        });

        // ── UI (scrollFactor 0 is safe at zoom 1) ──
        const overlay = this.add.graphics().setScrollFactor(0).setDepth(50);
        overlay.fillStyle(0x1a1a2e, 0.6);
        overlay.fillRect(0, 0, GAME_W, GAME_H);

        this.titleText = this.add.text(GAME_W / 2, 170, "WRAPTOPIA", {
            fontFamily: FONT_FAMILY,
            fontSize: "40px",
            color: "#f0c040",
            stroke: "#5b3e31",
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        this.tweens.add({
            targets: this.titleText,
            y: this.titleText.y - 8,
            duration: 2000,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1
        });

        this.add.text(GAME_W / 2, 230, "A Cozy Eco-Adventure", {
            fontFamily: FONT_FAMILY,
            fontSize: "12px",
            color: "#a8d8a8"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        const startText = this.add.text(GAME_W / 2, 380, "Press SPACE to start", {
            fontFamily: FONT_FAMILY,
            fontSize: "12px",
            color: "#ffffff"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        this.tweens.add({
            targets: startText,
            alpha: { from: 1, to: 0.2 },
            duration: 800,
            ease: "Sine.easeInOut",
            yoyo: true,
            repeat: -1
        });

        this.add.text(GAME_W / 2, GAME_H - 55, "Music by Dvir Silverstone from Pixabay", {
            fontFamily: FONT_FAMILY,
            fontSize: "8px",
            color: "#777777"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        this.add.text(GAME_W / 2, GAME_H - 35, "Tiles by Kenney.nl", {
            fontFamily: FONT_FAMILY,
            fontSize: "8px",
            color: "#777777"
        }).setOrigin(0.5).setScrollFactor(0).setDepth(100);

        // ── Music ──
        if (!this.sound.get("bgmusic")) {
            this.bgmusic = this.sound.add("bgmusic", { loop: true, volume: 0.4 });
        } else {
            this.bgmusic = this.sound.get("bgmusic");
        }
        if (!this.bgmusic.isPlaying) {
            this.bgmusic.play();
        }

        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Hide gameplay controls on title screen
        document.getElementById("controls-hint").style.display = "none";
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.scene.start("GameScene");
        }
    }
}

// ─── Game Scene ───
class GameScene extends Phaser.Scene {
    constructor() {
        super("GameScene");
        this.dialogueActive = false;
        this.typewriterTimer = null;
    }

    create() {
        const ZOOM = 3;

        const map = this.make.tilemap({ key: "map" });
        const townTiles = map.addTilesetImage("tiny_town_tiles", "tiny_town_tiles");
        const charTiles = map.addTilesetImage("roguelikeChar_transparent", "knights");

        map.createLayer("Ground", townTiles, 0, 0);
        const obstaclesLayer = map.createLayer("Obstacles", [townTiles, charTiles], 0, 0);
        obstaclesLayer.setCollisionByExclusion([-1, 0]);

        // ── Player (two-tile: body + head) ──
        const spawnObj = map.findObject("NPCs", obj => obj.name === "PlayerSpawn");
        const spawnX = spawnObj ? spawnObj.x : 168;
        const spawnY = spawnObj ? spawnObj.y : 310;

        // Body = frame 49 (row 7, col 0), Head = frame 42 (row 6, col 0)
        this.player = this.physics.add.sprite(spawnX, spawnY, "knights", 49);
        this.player.setSize(12, 12);
        this.player.setOffset(2, 4);
        this.player.setDepth(5);

        this.playerHead = this.add.sprite(spawnX, spawnY - 16, "knights", 42);
        this.playerHead.setDepth(6);

        this.physics.add.collider(this.player, obstaclesLayer);

        // ── NPCs ──
        this.npcs = [];
        const npcObjects = map.filterObjects("NPCs", obj => obj.type === "NPC");

        npcObjects.forEach(obj => {
            const frame = obj.gid - KNIGHTS_FIRSTGID;
            const npc = this.physics.add.staticSprite(obj.x + 8, obj.y - 8, "knights", frame);
            npc.setDepth(4);

            const dialogueProp = obj.properties
                ? obj.properties.find(p => p.name === "dialogue")
                : null;
            const dialogue = dialogueProp ? dialogueProp.value : (NPC_LORE[obj.name] || "...");

            npc.setData("name", obj.name);
            npc.setData("dialogue", dialogue);
            this.npcs.push(npc);

            this.physics.add.collider(this.player, npc);
        });

        // ── NPC Heads ──
        const headObjects = map.filterObjects("NPCs", obj => {
            return obj.gid && obj.gid >= KNIGHTS_FIRSTGID && !obj.type && obj.name !== "PlayerSpawn";
        });

        headObjects.forEach(obj => {
            const frame = obj.gid - KNIGHTS_FIRSTGID;
            this.add.sprite(obj.x + 8, obj.y - 8, "knights", frame).setDepth(6);
        });

        // ── Camera ──
        this.cameras.main.setZoom(ZOOM);
        this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player.setCollideWorldBounds(true);

        // ── Input ──
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // ── Interaction indicator (clean graphic arrow, no blurry text) ──
        this.promptGfx = this.add.graphics().setDepth(10).setVisible(false);
        this.promptGfx.fillStyle(0xffee55, 1);
        // Small downward-pointing triangle
        this.promptGfx.fillTriangle(-3, 0, 3, 0, 0, 3);
        this.promptBobY = 0;

        // ── Music ──
        const bgmusic = this.sound.get("bgmusic");
        if (bgmusic && !bgmusic.isPlaying) {
            bgmusic.play();
        }

        // ── DOM refs ──
        this.domBox = document.getElementById("dialogue-box");
        this.domName = document.getElementById("npc-name");
        this.domText = document.getElementById("dialogue-text");
        this.domHint = document.getElementById("dialogue-hint");
        this.domControls = document.getElementById("controls-hint");
        this.domControls.style.display = "block";
    }

    update() {
        // ── Player head follows body ──
        this.playerHead.setPosition(this.player.x, this.player.y - 16);

        // ── Movement ──
        if (!this.dialogueActive) {
            this.player.setVelocity(0);

            if (this.cursors.left.isDown) {
                this.player.setVelocityX(-PLAYER_SPEED);
            } else if (this.cursors.right.isDown) {
                this.player.setVelocityX(PLAYER_SPEED);
            }

            if (this.cursors.up.isDown) {
                this.player.setVelocityY(-PLAYER_SPEED);
            } else if (this.cursors.down.isDown) {
                this.player.setVelocityY(PLAYER_SPEED);
            }

            if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
                this.player.body.velocity.normalize().scale(PLAYER_SPEED);
            }
        }

        // ── NPC proximity ──
        let nearestNPC = null;
        let nearestDist = Infinity;

        this.npcs.forEach(npc => {
            const dist = Phaser.Math.Distance.Between(
                this.player.x, this.player.y,
                npc.x, npc.y
            );
            if (dist < INTERACT_DIST && dist < nearestDist) {
                nearestDist = dist;
                nearestNPC = npc;
            }
        });

        if (nearestNPC && !this.dialogueActive) {
            // Bob the arrow up and down
            this.promptBobY = Math.sin(this.time.now / 200) * 1.5;
            this.promptGfx.setPosition(nearestNPC.x, nearestNPC.y - 14 + this.promptBobY);
            this.promptGfx.setVisible(true);
        } else {
            this.promptGfx.setVisible(false);
        }

        // ── Interaction ──
        if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            if (this.dialogueActive) {
                this.closeDialogue();
            } else if (nearestNPC) {
                this.openDialogue(nearestNPC);
            }
        }
    }

    openDialogue(npc) {
        this.dialogueActive = true;
        this.player.setVelocity(0);
        sfx.interact();

        const npcName = npc.getData("name");
        const dialogue = npc.getData("dialogue");

        this.domName.textContent = npcName;
        this.domText.textContent = "";
        this.domHint.style.visibility = "hidden";
        this.domBox.style.display = "block";
        this.domControls.style.display = "none";

        // Typewriter effect
        let charIndex = 0;
        if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
        }

        this.typewriterTimer = this.time.addEvent({
            delay: 25,
            repeat: dialogue.length - 1,
            callback: () => {
                charIndex++;
                this.domText.textContent = dialogue.substring(0, charIndex);
                sfx.typewriter();

                if (charIndex >= dialogue.length) {
                    this.domHint.style.visibility = "visible";
                }
            }
        });
    }

    closeDialogue() {
        this.dialogueActive = false;
        this.domBox.style.display = "none";
        this.domControls.style.display = "block";
        sfx.close();

        if (this.typewriterTimer) {
            this.typewriterTimer.destroy();
            this.typewriterTimer = null;
        }
    }
}

// ─── Game Config ───
const config = {
    type: Phaser.AUTO,
    width: GAME_W,
    height: GAME_H,
    pixelArt: true,
    backgroundColor: "#1a1a2e",
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: [BootScene, TitleScene, GameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
