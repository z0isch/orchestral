import {
  Actor,
  Color,
  DisplayMode,
  Engine,
  Font,
  Scene,
  Text,
  Vector,
} from "excalibur";
import { loader } from "./resources";
import { MyLevel } from "./level";

const gameOverScene = new Scene();
const gameOverTextActor = new Actor({ pos: new Vector(400, 300) });
gameOverTextActor.graphics.add(
  new Text({
    text: "Game Over",
    font: new Font({ size: 100 }),
    color: Color.White,
  })
);
gameOverScene.add(gameOverTextActor);

const game = new Engine({
  canvasElementId: "game",
  width: 800,
  height: 600,
  displayMode: DisplayMode.FitScreen,
  pixelArt: true,
  scenes: {
    start: MyLevel,
    gameOver: gameOverScene,
  },
  backgroundColor: Color.Black,
  // NB: We have to have this to ensure that the metronome system works correctly
  // Let's just set it to ~60 fps
  fixedUpdateTimestep: 17,
});

game.start("start", { loader }).then(() => {});
