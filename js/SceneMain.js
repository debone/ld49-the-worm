import Phaser from "phaser";

export default class SceneMain extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {
    this.load.image("player", "assets/sprites/player.png");

    this.load.plugin(
      "rexperlinplugin",
      "https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexperlinplugin.min.js",
      true
    );
  }

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

    this.debug = true;
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

  renderTerrain() {
    const maxX = parseInt(
      this.cameras.main.worldView.width + this.cameras.main.scrollX,
      10
    );
    const maxY = parseInt(
      this.cameras.main.worldView.height * 2 + this.cameras.main.scrollY,
      10
    );

    this.graphics.lineStyle(3, 0xb5883b, 1);
    //this.graphics.lineStyle(3, 0xc1a83a, 1);

    for (let curr = this.cameras.main.worldView.x - 1000; curr < maxX; curr++) {
      this.graphics.lineBetween(curr, this.calculateHeight(curr), curr, maxY);
    }
  }

  setCameraZoom() {
    //TODO dynamic camera
    this.cameras.main.setZoom(0.25, 0.25);
    this.cameras.main.setRotation(
      ((this.playerPos.x % 100000) / 100000) * 2 * Math.PI
    );
  }

  update(time, delta) {
    this.text.setText(parseInt(this.playerPos.x, 10));
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

    this.setCameraZoom();

    Phaser.Actions.ShiftPosition(
      this.player.getChildren(),
      this.playerPos.x,
      this.playerPos.y
    );

    if (this.cursors.left.isDown) {
      this.playerAcc.x -= 0.01;
    } else if (this.cursors.right.isDown) {
      this.playerAcc.x += 0.01;

      //      this.playerPos.x += 16;
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
