import Phaser from "phaser";

import SceneGameOver from "./js/SceneGameOver";
import SceneMainMenu from "./js/SceneMainMenu";
import SceneMain from "./js/SceneMain";

const config = {
  type: Phaser.AUTO,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_VERTICALLY
  },
  width: 1600,
  height: 600,
  backgroundColor: "#85a987",
  //"render.transparent": true,
  parent: "game-container",
  physics: {
    default: "arcade"
  },
  scene: [SceneMainMenu, SceneMain, SceneGameOver]
};

const game = new Phaser.Game(config);

/**
 * dry air sky
 * #91704a
#907a4f
#8e8457
#8c8e60
#8a976c
#87a079
#85a987
#84b196
#85b9a5
#87c1b5
 */
