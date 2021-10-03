import Phaser from "phaser";

/**
 * TODO
 * x Water generation
 * x Water collision
 * missions
 *  x saddokar (just hit, ez)
 *  fremen (three states, ez, the counter underground, hard)
 *  chopters (just hit, closeness detection, can fly)
 *  ending
 * x indication for missions
 * x intro
 * x help texts
 * --- end---
 * move help texts outside of camera rotation (new scene)
 * nice dunes
 * particles
 * wind/sand on sky
 */

export default class SceneMain extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {}

  create() {
    this.noise = this.plugins.get("rexperlinplugin").add(2);

    const { width, height } = this.sys.game.config;
    this.width = width;
    this.height = height;

    this.graphics = this.add.graphics();

    this.text = this.add
      .text(width, height, "main\nscene", {
        font: "15vw courier",
        color: "white"
      })
      .setOrigin(0.5, 0.5);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.player = this.add.group({
      key: "player",
      x: 400,
      y: height,
      frameQuantity: 100
    });

    this.playerPos = new Phaser.Math.Vector2(400, height);
    this.playerVel = new Phaser.Math.Vector2(0, 0);
    this.playerAcc = new Phaser.Math.Vector2(0, 0);

    this.cameras.main.startFollow(this.playerPos);
    //this.cameras.main.followOffset.set(-300, 0);

    this.activeMission = 0;
    this.missionMarkerGoLeft = this.add.text(100, height, "<-", {
      font: "25vw times new roman",
      color: "white"
    });
    this.missionMarkerGoRight = this.add.text(width - 100, height, "->", {
      font: "25vw times new roman",
      color: "white"
    });

    this.missionMarker = this.add
      .text(width, height, "invader ->", {
        font: "25vh times new roman",
        color: "white"
      })
      .setRotation(-Math.PI / 2)
      .setOrigin(1, 0.5);

    this.missionTitle = this.add
      .text(this.width, 100, "Mission #1", {
        font: "20vh courier",
        color: "white"
      })
      .setOrigin(1, 0);
    this.missionDescription = this.add
      .text(this.width, 220, "Hunt the invaders!", {
        font: "15vh courier",
        color: "white"
      })
      .setOrigin(1, 0);

    this.missions = {
      "0": {
        //Saddokar
        missionTitle: "Mission #1",
        missionDescription: "Hunt the invaders!",
        active: true,
        showMarker: true,
        pos: new Phaser.Math.Vector2(100, this.calculateHeight(100)),
        gameObj: this.add.circle(100, this.calculateHeight(100), 10, 0x000000),
        start: () => {},
        update: () => {
          if (this.missions[0].active) {
            this.missions[0].pos.x += 2;
            this.missions[0].pos.y = this.calculateOverWaterHeight(
              this.missions[0].pos.x
            );
            this.missions[0].gameObj.x = this.missions[0].pos.x;
            this.missions[0].gameObj.y = this.missions[0].pos.y;
          }
        },
        success: (playerPos) => {
          if (playerPos.fuzzyEquals(this.missions[0].pos, 10)) {
            this.startMission(1, 0);
          }
        },
        clean: () => {
          this.missions[0].gameObj.destroy();
        }
      },
      "1": {
        //Saddokar
        missionTitle: "Mission #2",
        missionDescription: "Continue hunting the invaders!",
        active: false,
        showMarker: true,
        pos: new Phaser.Math.Vector2(100, this.calculateHeight(100)),
        gameObj: {},
        start: () => {
          this.missionMarker.setText("->");
          this.missions[1].gameObj = this.add.circle(
            100,
            this.calculateHeight(100),
            10,
            0x000000
          );
        },
        update: () => {
          if (this.missions[1].active) {
            this.missions[1].pos.x -= 2;
            this.missions[1].pos.y = this.calculateOverWaterHeight(
              this.missions[1].pos.x
            );
            this.missions[1].gameObj.x = this.missions[1].pos.x;
            this.missions[1].gameObj.y = this.missions[1].pos.y;
          }
        },
        success: (playerPos) => {
          if (playerPos.fuzzyEquals(this.missions[1].pos, 10)) {
            this.startMission(2, 1);
          }
        },
        clean: () => {
          this.missions[1].gameObj.destroy();
        }
      },
      "2": {
        //Saddokar
        missionTitle: "Mission #3",
        missionDescription: "The last invaders group are running away",
        active: false,
        showMarker: true,
        pos: new Phaser.Math.Vector2(100, this.calculateHeight(100)),
        gameObj: {},
        start: () => {
          this.missions[2].gameObj = this.add.circle(
            100,
            this.calculateHeight(100),
            10,
            0x000000
          );
        },
        update: () => {
          if (this.missions[2].active) {
            this.missions[2].pos.x -= 2;
            this.missions[2].pos.y = this.calculateOverWaterHeight(
              this.missions[2].pos.x
            );
            this.missions[2].gameObj.x = this.missions[2].pos.x;
            this.missions[2].gameObj.y = this.missions[2].pos.y;
          }
        },
        success: (playerPos) => {
          if (playerPos.fuzzyEquals(this.missions[2].pos, 10)) {
            this.startMission(3, 2);
          }
        },
        clean: () => {
          this.missions[2].gameObj.destroy();
        }
      },
      "3": {},
      "4": {},
      "5": {},
      "6": {},
      "7": {},
      "8": {}
    };

    this.debug = false;
  }

  startMission(missionStarted, missionFinished) {
    this.missions[missionFinished].clean();
    this.missions[missionFinished].active = false;

    this.missions[missionStarted].start();
    this.missions[missionStarted].active = true;
    this.activeMission = missionStarted;
    this.missionTitle.setText(this.missions[missionStarted].missionTitle);
    this.missionDescription.setText(
      this.missions[missionStarted].missionDescription
    );
  }

  bounce(pos, acc) {
    const accMag = acc.length();
    const bouncingPlane = new Phaser.Math.Vector2(
      10,
      this.calculateHeight(pos.x + 5) - this.calculateHeight(pos.x - 5)
    );

    bouncingPlane.rotate(-Math.PI / 2);
    bouncingPlane.normalize();

    //acc.reflect(bouncingPlane);
    //acc.y *= 0.5;

    acc.normalize();
    if (this.cursors.down.isDown) {
      acc.scale(-1);
    } else {
      acc.scale(-0.999);
    }
    bouncingPlane.scale(1.25 * bouncingPlane.dot(acc));
    bouncingPlane.subtract(acc);
    acc.setFromObject(bouncingPlane.scale(accMag));

    if (Math.abs(acc.y) < 0.5) {
      //this.playerAcc.y = 0;
    }
  }

  hitsTerrain(x, y) {
    return this.calculateHeight(x) < y;
  }

  easeOut(x) {
    return Math.pow(x - 1, 2);
  }

  calculateHeight(x) {
    return (
      this.easeOut(Math.abs(this.playerPos.x - x) / 150) +
      (this.height -
        100 * Math.sin(this.noise.simplex2(x / 500, 1)) -
        300 * this.noise.simplex2(x / 5000, 1)) /**/
      //100 * this.noise.simplex2(x / 500, 1)
      //10 * this.noise.simplex2(x / 250, 1)
    );
  }

  calculateWater(x) {
    return (
      this.easeOut(Math.abs(this.playerPos.x - x) / 150) +
      this.height +
      150 -
      10 * this.noise.simplex2(this.noise.simplex2(x / 1000, 1), 1)
    );
  }

  calculateOverWaterHeight(x) {
    let water = this.calculateWater(x);
    let terrain = this.calculateHeight(x);

    if (water < terrain) {
      return water;
    }
    return terrain;
  }

  renderTerrain() {
    const maxX = parseInt(
      this.cameras.main.worldView.x + this.cameras.main.worldView.width * 1.5,
      10
    );
    const maxY = parseInt(
      this.cameras.main.worldView.height * 2 + this.cameras.main.scrollY,
      10
    );

    //this.graphics.lineStyle(3, 0xb5883b, 1);
    //this.graphics.lineStyle(3, 0xc1a83a, 1);

    for (
      let curr =
        this.cameras.main.worldView.x - this.cameras.main.worldView.width * 0.5;
      curr < maxX;
      curr++
    ) {
      let water = this.calculateWater(curr);
      let terrain = this.calculateHeight(curr);

      if (water < terrain) {
        this.graphics.lineStyle(3, 0x4b83c0, 1);
        this.graphics.lineBetween(curr, water, curr, terrain);
      }
      this.graphics.lineStyle(3, 0xb5883b, 1);
      this.graphics.lineBetween(curr, terrain, curr, maxY);
    }
  }

  setCameraZoom() {
    //TODO dynamic camera
    if (this.debug) {
      this.cameras.main.setZoom(0.15, 0.15);
    } else {
      this.cameras.main.setZoom(0.25, 0.25);
      this.cameras.main.setRotation(
        ((this.playerPos.x % 100000) / 100000) * 2 * Math.PI
      );
    }
  }

  checkPlayerCollision() {
    let water = this.calculateWater(this.playerPos.x);
    let terrain = this.calculateHeight(this.playerPos.x);

    if (
      water < terrain &&
      water < this.playerPos.y &&
      this.playerPos.y < terrain + 5
    ) {
      this.scene.stop();
    }
  }

  renderMarker() {
    const maxX = parseInt(
      this.cameras.main.worldView.x + this.cameras.main.worldView.width,
      10
    );
    const minX = parseInt(this.cameras.main.worldView.x, 10);

    this.missionMarkerGoLeft.x = minX + 200;
    this.missionMarkerGoRight.x = maxX - 400;

    this.missionMarker.x = this.missions[this.activeMission].pos.x;
    this.missionMarker.y =
      this.calculateHeight(this.missionMarker.x) +
      150 +
      50 * Math.sin(this.missionMarker.x / 25);

    if (this.missions[this.activeMission].pos.x > maxX) {
      this.missionMarkerGoLeft.setVisible(false);
      this.missionMarkerGoRight.setVisible(true);
    } else if (this.missions[this.activeMission].pos.x < minX) {
      this.missionMarkerGoLeft.setVisible(true);
      this.missionMarkerGoRight.setVisible(false);
    } else {
      this.missionMarkerGoLeft.setVisible(false);
      this.missionMarkerGoRight.setVisible(false);
    }

    return (
      this.missions[this.activeMission].pos.x > minX &&
      maxX > this.missions[this.activeMission].pos.x
    );
  }

  update(time, delta) {
    this.text.setText(
      parseInt(this.playerPos.x, 10) + " w " + this.renderMarker()
    );
    this.text.x = this.cameras.main.scrollX + this.width / 2;

    //Gravity
    this.playerAcc.y += 0.05;

    let isUnderground = this.hitsTerrain(this.playerPos.x, this.playerPos.y);

    if (isUnderground) {
      this.bounce(this.playerPos, this.playerAcc);
    }
    this.playerPos.add(this.playerAcc);

    this.graphics.clear();

    this.renderTerrain();

    this.checkPlayerCollision();

    this.setCameraZoom();

    this.missions[this.activeMission].update();
    this.missions[this.activeMission].success(this.playerPos);
    this.missionTitle.x =
      this.cameras.main.worldView.x + this.cameras.main.worldView.width - 100;
    this.missionDescription.x =
      this.cameras.main.worldView.x + this.cameras.main.worldView.width - 100;

    Phaser.Actions.ShiftPosition(
      this.player.getChildren(),
      this.playerPos.x,
      this.playerPos.y
    );

    if (this.cursors.left.isDown) {
      if (this.debug) {
        this.playerAcc.x -= 0.1;
      } else {
        this.playerAcc.x -= 0.01;
      }
    } else if (this.cursors.right.isDown) {
      if (this.debug) {
        this.playerAcc.x += 0.1;
      } else {
        this.playerAcc.x += 0.01;
      }
    }

    if (this.cursors.up.isDown && isUnderground) {
      this.playerPos.y -= 0.5;
      this.playerAcc.y -= 0.13;
    } else if (this.cursors.down.isDown) {
      this.playerPos.y += 0.5;
      this.playerAcc.y += 0.13;

      //this.playerAcc.y += 0.13;
    }

    if (this.debug) {
      this.graphics.lineStyle(4, 0xff0000, 1);
      let offset = 10;
      this.graphics.lineBetween(
        this.playerPos.x - offset,
        this.calculateHeight(this.playerPos.x - offset),
        this.playerPos.x + offset,
        this.calculateHeight(this.playerPos.x + offset)
      );
    }
  }
}
