import Phaser from "phaser";

/**
 * TODO
 * x Water generation
 * x Water collision
 * missions
 *  x saddokar (just hit, ez)
 *  x fremen (three states, ez, the counter underground, hard)
 *  chopters (just hit, closeness detection, can fly)
 *  ending
 * x indication for missions
 * x intro
 * x help texts
 *
 * x losing frame
 * x points
 * x ending
 * x more missions
 * --- end---
 * x move help texts outside of camera rotation (new scene)
 * nice dunes
 * particles
 * wind/sand on sky
 */

let missionTitle = "";
let missionDescription = "";
let melange = 100;

export class SceneMain extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {}

  create() {
    this.scene.run("SceneUI");

    this.noise = this.plugins.get("rexperlinplugin").add(2);

    const { width, height } = this.sys.game.config;
    this.width = width;
    this.height = height;

    this.graphics = this.add.graphics();

    this.text = this.add
      .text(width, height, "", {
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
    this.missionMarkerGoLeft = this.add
      .text(100, height, "<-", {
        font: "25vw times new roman",
        color: "white"
      })
      .setVisible(false);
    this.missionMarkerGoRight = this.add
      .text(width - 100, height, "->", {
        font: "25vw times new roman",
        color: "white"
      })
      .setVisible(false);

    this.missionMarker = this.add
      .text(width, height, "invader ->", {
        font: "25vh times new roman",
        color: "white"
      })
      .setRotation(-Math.PI / 2)
      .setOrigin(1, 0.5);

    missionTitle = "Mission #1";
    missionDescription = "Hunt the invaders!";

    this.missions = {
      "0": {
        //Saddokar
        missionTitle: "Mission #1",
        missionDescription: "Hunt the invaders!",
        active: true,
        showMarker: true,
        melange: 50,
        pos: new Phaser.Math.Vector2(100, this.calculateHeight(100)),
        gameObj: this.add.circle(100, this.calculateHeight(100), 10, 0x000000),
        start: () => {},
        update: () => {
          if (this.missions[0].active) {
            this.missions[0].pos.x += 1;
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
        melange: 75,
        pos: new Phaser.Math.Vector2(5000, this.calculateHeight(5000)),
        gameObj: {},
        start: () => {
          this.missionMarker.setText("->");
          this.missions[1].gameObj = this.add.circle(
            5000,
            this.calculateHeight(5000),
            10,
            0x000000
          );
        },
        update: () => {
          if (this.missions[1].active) {
            this.missions[1].pos.x -= 1.5;
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
        melange: 100,
        pos: new Phaser.Math.Vector2(-10000, this.calculateHeight(-10000)),
        gameObj: {},
        start: () => {
          this.missions[2].gameObj = this.add.circle(
            -10000,
            this.calculateHeight(-10000),
            10,
            0x000000
          );
        },
        update: () => {
          if (this.missions[2].active) {
            this.missions[2].pos.x += 2.5;
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
      "3": {
        missionTitle: "Mission #4",
        missionDescription: "Give a ride to the natives",
        active: false,
        showMarker: true,
        melange: 300,
        pos: new Phaser.Math.Vector2(0, this.calculateHeight(0)),
        fremen: new Phaser.Math.Vector2(0, this.calculateHeight(0)),
        goal: new Phaser.Math.Vector2(-1500, this.calculateHeight(-1500)),
        gameObj: {},
        step: 0,
        life: 100,
        lifeObj: {},
        lifeBuffer: 75,
        goalObj: {},
        start: () => {
          this.missions[3].gameObj = this.add.group({
            key: "fremen",
            x: 0,
            y: this.calculateHeight(0),
            frameQuantity: 5
          });

          this.missions[3].goalObj = this.add.image(
            -1500,
            this.calculateHeight(-1500),
            "cave"
          );
          this.missions[3].goalObj.scale = 3;

          this.missions[3].lifeObj = this.add
            .rectangle(0, this.calculateHeight(0) + 10, 100, 10, 0x00ff00)
            .setVisible(false)
            .setOrigin(0.5, 0.5);
        },
        update: () => {
          if (this.missions[3].active) {
            if (this.missions[3].step === 0) {
              // They are moving on sand
              this.missions[3].pos.x += 2 * Math.random();
              this.missions[3].pos.y = this.calculateOverWaterHeight(
                this.missions[3].pos.x
              );
              this.missions[3].gameObj.x = this.missions[3].pos.x;
              this.missions[3].gameObj.y = this.missions[3].pos.y;
              this.missions[3].fremen.x = this.missions[3].pos.x;
              this.missions[3].fremen.y = this.missions[3].pos.y;
            } else if (this.missions[3].step === 1) {
              this.missions[3].fremen.x = this.playerPos.x;
              this.missions[3].fremen.y = this.playerPos.y - 10;
              // They are riding you
              this.missions[3].gameObj.x = this.playerPos.x;
              this.missions[3].gameObj.y = this.playerPos.y - 10;

              if (
                this.hitsDeepTerrain(this.playerPos.x, this.playerPos.y, 40)
              ) {
                this.missions[3].lifeBuffer -= 1;
                this.missions[3].lifeObj.setFillStyle(0xff0000);
              } else {
                this.missions[3].lifeObj.setFillStyle(0x00ff00);
              }

              if (this.missions[3].lifeBuffer < 0) {
                this.missions[3].lifeBuffer = 100;
                this.missions[3].life -= 10;
                this.missions[3].melange -= 20;
                this.missions[3].lifeObj.width = this.missions[3].life;
              }

              if (this.missions[3].life <= 0) {
                this.startMission(4, 3);
              }
            }

            if (this.missions[3].active) {
              Phaser.Actions.ShiftPosition(
                this.missions[3].gameObj.getChildren(),
                this.missions[3].fremen.x,
                this.missions[3].fremen.y
              );
            }

            this.missions[3].goal.y = this.calculateHeight(-1500);
            this.missions[3].goalObj.y = this.calculateHeight(-1500);

            this.missions[3].lifeObj.x = this.missions[3].gameObj.x;
            this.missions[3].lifeObj.y = this.missions[3].gameObj.y - 50;
          }
        },
        success: (playerPos) => {
          if (
            this.missions[3].step === 0 &&
            playerPos.fuzzyEquals(this.missions[3].pos, 10)
          ) {
            this.missions[3].step = 1;
            missionDescription =
              "Take them to the assigned destination\nYou can't leave the surface\n for long";
            this.missions[3].lifeObj.setVisible(true);
            this.missions[3].pos.x = this.missions[3].goal.x;
            this.missions[3].pos.y = this.missions[3].goal.y;
          }
          if (
            this.missions[3].step === 1 &&
            playerPos.fuzzyEquals(this.missions[3].goal, 50)
          ) {
            this.startMission(4, 3);
          }
        },
        clean: () => {
          this.missions[3].gameObj.destroy(true);
          this.missions[3].lifeObj.destroy();
          this.missions[3].goalObj.destroy();
        }
      },
      "4": {
        missionTitle: "Mission #5",
        missionDescription:
          "Another group of natives need your help \nThey are a bit more sensitive to depths ",
        //active: false,
        active: false,
        showMarker: true,
        melange: 400,
        pos: new Phaser.Math.Vector2(0, this.calculateHeight(0)),
        fremen: new Phaser.Math.Vector2(0, this.calculateHeight(0)),
        goal: new Phaser.Math.Vector2(9200, this.calculateHeight(9200)),
        gameObj: {},
        step: 0,
        life: 100,
        lifeObj: {},
        lifeBuffer: 50,
        goalObj: {},
        start: () => {
          this.missions[4].gameObj = this.add.group({
            key: "fremen",
            x: 0,
            y: this.calculateHeight(0),
            frameQuantity: 5
          });

          this.missions[4].goalObj = this.add.image(
            this.missions[4].goal.x,
            this.missions[4].goal.y,
            "cave"
          );
          this.missions[4].goalObj.scale = 3;

          this.missions[4].lifeObj = this.add
            .rectangle(0, this.calculateHeight(0) + 10, 100, 10, 0x00ff00)
            .setVisible(false)
            .setOrigin(0.5, 0.5);
        },
        update: () => {
          if (this.missions[4].active) {
            if (this.missions[4].step === 0) {
              // They are moving on sand
              this.missions[4].pos.x += 2 * Math.random();
              this.missions[4].pos.y = this.calculateOverWaterHeight(
                this.missions[4].pos.x
              );
              this.missions[4].gameObj.x = this.missions[4].pos.x;
              this.missions[4].gameObj.y = this.missions[4].pos.y;
              this.missions[4].fremen.x = this.missions[4].pos.x;
              this.missions[4].fremen.y = this.missions[4].pos.y;
            } else if (this.missions[4].step === 1) {
              this.missions[4].fremen.x = this.playerPos.x;
              this.missions[4].fremen.y = this.playerPos.y - 10;
              // They are riding you
              this.missions[4].gameObj.x = this.playerPos.x;
              this.missions[4].gameObj.y = this.playerPos.y - 10;

              if (
                this.hitsDeepTerrain(this.playerPos.x, this.playerPos.y, 20)
              ) {
                this.missions[4].lifeBuffer -= 1;
                this.missions[4].lifeObj.setFillStyle(0xff0000);
              } else {
                this.missions[4].lifeObj.setFillStyle(0x00ff00);
              }

              if (this.missions[4].lifeBuffer < 0) {
                this.missions[4].lifeBuffer = 100;
                this.missions[4].life -= 10;
                this.missions[4].melange -= 20;
                this.missions[4].lifeObj.width = this.missions[4].life;
              }

              if (this.missions[4].life <= 0) {
                this.startMission(5, 4);
              }
            }

            if (this.missions[4].active) {
              Phaser.Actions.ShiftPosition(
                this.missions[4].gameObj.getChildren(),
                this.missions[4].fremen.x,
                this.missions[4].fremen.y
              );
            }

            this.missions[4].goal.y = this.calculateHeight(9200);
            this.missions[4].goalObj.y = this.calculateHeight(9200);

            this.missions[4].lifeObj.x = this.missions[4].gameObj.x;
            this.missions[4].lifeObj.y = this.missions[4].gameObj.y - 50;
          }
        },
        success: (playerPos) => {
          if (
            this.missions[4].step === 0 &&
            playerPos.fuzzyEquals(this.missions[4].pos, 10)
          ) {
            this.missions[4].step = 1;
            missionDescription =
              "Take them to the assigned destination\nYou can't leave the surface\nlevels for long";
            this.missions[4].lifeObj.setVisible(true);
            this.missions[4].pos.x = this.missions[4].goal.x;
            this.missions[4].pos.y = this.missions[4].goal.y;
          }
          if (
            this.missions[4].step === 1 &&
            playerPos.fuzzyEquals(this.missions[4].goal, 50)
          ) {
            this.startMission(5, 4);
          }
        },
        clean: () => {
          this.missions[4].gameObj.destroy(true);
          this.missions[4].lifeObj.destroy();
          this.missions[4].goalObj.destroy();
        }
      },
      "5": {
        missionTitle: "Mission #6",
        missionDescription:
          "The last group of natives need your help \nThey just want a fun ride ",
        //active: false,
        active: false,
        showMarker: true,
        melange: 400,
        pos: new Phaser.Math.Vector2(4000, this.calculateHeight(4000)),
        fremen: new Phaser.Math.Vector2(4000, this.calculateHeight(4000)),
        goal: new Phaser.Math.Vector2(-15000, this.calculateHeight(-15000)),
        gameObj: {},
        step: 0,
        life: 100,
        lifeObj: {},
        lifeBuffer: 500,
        goalObj: {},
        start: () => {
          this.missions[5].gameObj = this.add.group({
            key: "fremen",
            x: 4000,
            y: this.calculateHeight(4000),
            frameQuantity: 5
          });

          this.missions[5].goalObj = this.add.image(
            this.missions[5].goal.x,
            this.missions[5].goal.y,
            "cave"
          );
          this.missions[5].goalObj.scale = 3;

          this.missions[5].lifeObj = this.add
            .rectangle(0, this.calculateHeight(0) + 10, 100, 10, 0x00ff00)
            .setVisible(false)
            .setOrigin(0.5, 0.5);
        },
        update: () => {
          if (this.missions[5].active) {
            if (this.missions[5].step === 0) {
              // They are moving on sand
              this.missions[5].pos.x += 2 * Math.random();
              this.missions[5].pos.y = this.calculateOverWaterHeight(
                this.missions[5].pos.x
              );
              this.missions[5].gameObj.x = this.missions[5].pos.x;
              this.missions[5].gameObj.y = this.missions[5].pos.y;
              this.missions[5].fremen.x = this.missions[5].pos.x;
              this.missions[5].fremen.y = this.missions[5].pos.y;
            } else if (this.missions[5].step === 1) {
              this.missions[5].fremen.x = this.playerPos.x;
              this.missions[5].fremen.y = this.playerPos.y - 10;
              // They are riding you
              this.missions[5].gameObj.x = this.playerPos.x;
              this.missions[5].gameObj.y = this.playerPos.y - 10;

              if (
                this.hitsDeepTerrain(this.playerPos.x, this.playerPos.y, 100)
              ) {
                this.missions[5].lifeBuffer -= 1;
                this.missions[5].lifeObj.setFillStyle(0xff0000);
              } else {
                this.missions[5].lifeObj.setFillStyle(0x00ff00);
              }

              if (this.missions[5].lifeBuffer < 0) {
                this.missions[5].lifeBuffer = 100;
                this.missions[5].life -= 10;
                this.missions[5].melange -= 20;
                this.missions[5].lifeObj.width = this.missions[5].life;
              }

              if (this.missions[5].life <= 0) {
                this.startMission(8, 5);
              }
            }

            if (this.missions[5].active) {
              Phaser.Actions.ShiftPosition(
                this.missions[5].gameObj.getChildren(),
                this.missions[5].fremen.x,
                this.missions[5].fremen.y
              );
            }

            this.missions[5].goal.y = this.calculateHeight(-15000);
            this.missions[5].goalObj.y = this.calculateHeight(-15000);

            this.missions[5].lifeObj.x = this.missions[5].gameObj.x;
            this.missions[5].lifeObj.y = this.missions[5].gameObj.y - 50;
          }
        },
        success: (playerPos) => {
          if (
            this.missions[5].step === 0 &&
            playerPos.fuzzyEquals(this.missions[5].pos, 10)
          ) {
            this.missions[5].step = 1;
            missionDescription =
              "Take them to the assigned destination\nYou can't leave the surface\nlevels for long";
            this.missions[5].lifeObj.setVisible(true);
            this.missions[5].pos.x = this.missions[5].goal.x;
            this.missions[5].pos.y = this.missions[5].goal.y;
          }
          if (
            this.missions[5].step === 1 &&
            playerPos.fuzzyEquals(this.missions[5].goal, 50)
          ) {
            this.startMission(8, 5);
          }
        },
        clean: () => {
          this.missions[5].gameObj.destroy(true);
          this.missions[5].lifeObj.destroy();
          this.missions[5].goalObj.destroy();
        }
      },
      "6": {},
      "7": {},
      "8": {
        // Paul
        missionTitle: "Mission #9",
        missionDescription:
          "Now that you helped the planet \nYou can finally join HIM ",
        active: false,
        showMarker: false,

        melange: 500,
        pos: new Phaser.Math.Vector2(-0, this.calculateHeight(-0)),
        gameObj: {},
        start: () => {
          this.missions[8].gameObj = this.add.star(
            0,
            this.calculateHeight(0),
            5,
            24,
            48,
            0xffffff
          );
        },
        update: (time) => {
          if (this.missions[8].active) {
            this.missions[8].gameObj.scale = 1 + 0.1 * Math.sin(time / 100);
            this.missions[8].gameObj.y = this.calculateHeight(0);
          }
        },
        success: (playerPos) => {
          if (playerPos.fuzzyEquals(this.missions[8].pos, 50)) {
            melange += 500;
            this.endGame();
          }
        },
        clean: () => {
          this.missions[8].gameObj.destroy();
        }
      }
    };

    this.missions[0].start();

    this.gameIsOver = false;
    this.debug = false;
  }

  startMission(missionStarted, missionFinished) {
    this.missions[missionFinished].active = false;
    this.missions[missionFinished].clean();
    melange += this.missions[missionFinished].melange;

    this.missions[missionStarted].start();
    this.missions[missionStarted].active = true;
    this.activeMission = missionStarted;
    missionTitle = this.missions[missionStarted].missionTitle;
    missionDescription = this.missions[missionStarted].missionDescription;
  }

  endGame() {
    this.scene.run("SceneGameWon");
    this.cameras.main.stopFollow();
    this.gameIsOver = true;
    this.missionMarker.setText("");
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

  hitsDeepTerrain(x, y, depth) {
    return this.calculateHeight(x) < y - depth;
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
      this.cameras.main.setZoom(0.3, 0.3);
      /*this.cameras.main.setRotation(
        ((this.playerPos.x % 100000) / 100000) * 2 * Math.PI
      );*/
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
      this.gameOver();
    }
  }

  gameOver() {
    this.scene.run("SceneGameOver");
    this.cameras.main.stopFollow();
    this.gameIsOver = true;
    this.missionMarker.setText("");
  }

  renderMarker() {
    const maxX = parseInt(
      this.cameras.main.worldView.x + this.cameras.main.worldView.width,
      10
    );
    const minX = parseInt(this.cameras.main.worldView.x, 10);

    this.missionMarkerGoLeft.x = minX + 200;
    this.missionMarkerGoRight.x = maxX - 400;

    if (this.missions[this.activeMission].showMarker) {
      this.missionMarker.setVisible(true);
    } else {
      this.missionMarker.setVisible(false);
    }

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
    this.text.setText(parseInt(this.playerPos.x, 10));
    this.text.x = this.cameras.main.scrollX + this.width / 2;
    this.text.y = 100;

    //Gravity
    this.playerAcc.y += 0.05;

    let isUnderground = this.hitsTerrain(this.playerPos.x, this.playerPos.y);

    if (isUnderground) {
      this.bounce(this.playerPos, this.playerAcc);
    }
    this.playerPos.add(this.playerAcc);

    this.graphics.clear();

    this.renderTerrain();
    this.renderMarker();

    this.checkPlayerCollision();

    this.setCameraZoom();

    if (this.gameIsOver) return;

    melange -= 0.005;

    this.missions[this.activeMission].update(time);
    this.missions[this.activeMission].success(this.playerPos);

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

export class SceneUI extends Phaser.Scene {
  constructor() {
    super({ key: "SceneUI" });
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.config;

    this.width = width;
    this.height = height;

    this.instructions = this.add.text(
      10,
      120,
      "Use the up and down to navigate the dunes.\nYou have light control with left and right keys.\nAvoid the water!\nHave fun!",
      {
        font: "2vh courier",
        color: "white"
      }
    );

    this.melangeText = this.add.text(10, 100, "Melange: 0", {
      font: "2vh courier",
      color: "white"
    });

    this.missionDescriptionText = "Hunt the invaders!";
    this.missionTitle = this.add
      .text(this.width, 100, "Mission #1", {
        font: "5vh courier",
        color: "white"
      })
      .setOrigin(1, 0);
    this.missionDescription = this.add
      .text(this.width, 135, "Hunt the invaders!", {
        font: "3vh courier",
        color: "white"
      })
      .setOrigin(1, 0);
  }

  update() {
    if (missionDescription !== this.missionDescriptionText) {
      this.missionDescriptionText = missionDescription;
      this.missionTitle.setText(missionTitle);
      this.missionDescription.setText(missionDescription);
      this.instructions.setText("");
    }

    this.melangeText.setText(`Melange: ${parseInt(melange, 10)}`);
  }
}

export class SceneGameWon extends Phaser.Scene {
  constructor() {
    super({ key: "SceneGameWon" });
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.config;

    this.width = width;
    this.height = height;

    this.text = this.add
      .text(width / 2, height / 2, "You have joined HIM, well done :)", {
        font: "4vw courier",
        color: "white"
      })
      .setOrigin(0.5, 0.5);

    this.enterText = this.add
      .text(
        width / 2,
        (height * 4) / 5,
        "You have accumulated " +
          parseInt(melange, 10) +
          " melange\nand finished the game! Thanks for playing\nShare your feedback :)",
        {
          font: "3vw courier",
          color: "white"
        }
      )
      .setOrigin(0.5, 0.5);
  }
}

export class SceneGameOver extends Phaser.Scene {
  constructor() {
    super({ key: "SceneGameOver" });
  }

  preload() {}

  create() {
    const { width, height } = this.sys.game.config;

    this.width = width;
    this.height = height;

    this.text = this.add
      .text(width / 2, height / 2, "Your body can't survive the water", {
        font: "4vw courier",
        color: "white"
      })
      .setOrigin(0.5, 0.5);

    this.theText = this.add
      .text(
        width / 2,
        (height * 2) / 3,
        "You have accumulated " + parseInt(melange, 10) + " melange",
        {
          font: "3vw courier",
          color: "white"
        }
      )
      .setOrigin(0.5, 0.5);

    this.enterText = this.add
      .text(width / 2, (height * 4) / 5, "Press 'r' to restart", {
        font: "3vw courier",
        color: "white"
      })
      .setOrigin(0.5, 0.5);

    const keyObj = this.input.keyboard.addKey("R"); // Get key object
    keyObj.on("down", (event) => {
      this.scene.stop("SceneMain");
      this.scene.stop("SceneUI");
      this.scene.start("SceneMainMenu");
    });
  }
}
