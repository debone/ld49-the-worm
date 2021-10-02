import Phaser from "phaser";

export default class SceneMain extends Phaser.Scene {
  constructor() {
    super({ key: "SceneMain" });
  }

  preload() {
    this.load.image("player", "assets/sprites/player.png");
  }

  create() {
    const { width, height } = this.sys.game.config;

    this.graphics = this.add.graphics();

    this.graphics.lineStyle(4, 0x00ff00, 1);

    this.graphics.strokeRect(32, 32, 256, 256);

    this.graphics.fillStyle(0xff0000, 0.8);

    this.graphics.fillCircle(260, 260, 120);

    this.graphics.lineStyle(4, 0xff00ff, 1);

    this.graphics.strokeEllipse(400, 300, 200, 128);

    this.cameras.main.setBounds(0, 0, width * 2, 1080 * 2);
    this.physics.world.setBounds(0, 0, width * 2, 1080 * 2);

    this.text = this.add
      .text(width / 2, height / 2, "main\nscene", {
        font: "15vw courier",
        color: "white"
      })
      .setOrigin(0.5, 0.5);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.player = this.physics.add.image(400, 300, "player");

    this.cameras.main.startFollow(this.player);
    this.cameras.main.followOffset.set(-300, 0);
  }

  update(time, delta) {
    this.text.setText(this.cameras.main.scrollX);
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-500);
      this.player.setFlipX(true);
      this.cameras.main.followOffset.x = 300;
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(500);
      this.player.setFlipX(false);
      this.cameras.main.followOffset.x = -300;
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-500);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(500);
    }
  }
}
