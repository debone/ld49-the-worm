import Phaser from "phaser";

export default class SceneMainMenu extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMainMenu" });
  }

  preload() {
    this.load.plugin(
      "rexperlinplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexperlinplugin.min.js",
      true
    );

    this.load.image("player", "assets/sprites/player.png");
    this.load.image("fremen", "assets/sprites/fremen.png");
    this.load.image("cave", "assets/sprites/cave.png");
  }

  create() {
    this.noise = this.plugins.get("rexperlinplugin").add(5);

    const { width, height } = this.sys.game.config;
    this.height = height;

    this.text = this.add
      .text(width / 2, height / 2 - 20, "THE WORM", {
        font: "15vh courier",
        color: "white"
      })
      .setOrigin(0.5, 0.5);

    this.graphics = this.add.graphics();

    this.enterText = this.add
      .text(width / 2, (height * 4) / 5, "Press any key to start", {
        font: "3vh courier",
        color: "white"
      })
      .setOrigin(0.5, 0.5)
      .setVisible(false);

    this.player = this.add.group({
      key: "player",
      x: width / 2,
      y: height / 2,
      frameQuantity: 100
    });

    this.input.keyboard.on("keydown", (event) => {
      this.scene.start("SceneMain");
    });

    this.playerPos = new Phaser.Math.Vector2(-150, height - 150);
    this.playerVel = new Phaser.Math.Vector2(0, 0);
    this.playerAcc = new Phaser.Math.Vector2(5, 0);
  }

  hitsTerrain(x, y) {
    return this.calculateHeight(x) < y;
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

    acc.scale(-1);

    bouncingPlane.scale(1.25 * bouncingPlane.dot(acc));
    bouncingPlane.subtract(acc);
    acc.setFromObject(bouncingPlane.scale(accMag));

    if (Math.abs(acc.y) < 0.5) {
      //this.playerAcc.y = 0;
    }
  }
  update() {
    /*this.text.setText(
      parseInt(this.playerPos.x) + " " + parseInt(this.playerPos.y)
    );/* */

    let isUnderground = this.hitsTerrain(this.playerPos.x, this.playerPos.y);

    if (isUnderground) {
      this.bounce(this.playerPos, this.playerAcc);
    }

    this.playerPos.add(this.playerAcc);

    if (this.playerPos.x > this.cameras.main.worldView.width * 1.5) {
      this.playerPos.x = -200;
      this.playerPos.y = this.height - 250 * Math.random();
      this.playerAcc = new Phaser.Math.Vector2(10 * Math.random(), 0);

      this.enterText.setVisible(true);
    }

    this.graphics.clear();

    Phaser.Actions.ShiftPosition(
      this.player.getChildren(),
      this.playerPos.x,
      this.playerPos.y
    );

    this.renderTerrain();
  }
  renderTerrain() {
    const maxX = parseInt(
      this.cameras.main.worldView.x + this.cameras.main.worldView.width,
      10
    );
    const maxY = parseInt(
      this.cameras.main.worldView.height * 2 + this.cameras.main.scrollY,
      10
    );

    this.graphics.lineStyle(3, 0xb5883b, 1);
    //this.graphics.lineStyle(3, 0xc1a83a, 1);

    for (let curr = this.cameras.main.worldView.x - 1000; curr < maxX; curr++) {
      let terrain = this.calculateHeight(curr);

      this.graphics.lineStyle(3, 0xb5883b, 1);
      this.graphics.lineBetween(curr, terrain, curr, maxY);
    }
  }
  easeOut(x) {
    return Math.pow(x - 1, 2);
  }
  calculateHeight(x) {
    return (
      this.easeOut(Math.abs(this.cameras.main.worldView.width / 2 - x) / 150) +
      (300 -
        10 * Math.sin(this.noise.simplex2(x / 500, 1)) -
        30 * this.noise.simplex2(x / 5000, 1)) /**/
      //100 * this.noise.simplex2(x / 500, 1)
      //10 * this.noise.simplex2(x / 250, 1)
    );
  }
}
