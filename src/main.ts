import {
  Actor,
  Color,
  CoordPlane,
  DisplayMode,
  Engine,
  Font,
  Scene,
  SolverStrategy,
  Text,
  Vector,
} from "excalibur";
import { loader } from "./resources";
import { MyLevel } from "./level";
import { UI } from "./ui";

const gameOverScene = new Scene();
const gameOverTextActor = new Actor({
  coordPlane: CoordPlane.Screen,
  pos: new Vector(1280 / 2, 720 / 2),
});
gameOverTextActor.graphics.add(
  new Text({
    text: "Game Over",
    font: new Font({ size: 100 }),
    color: Color.White,
  })
);
gameOverScene.add(new UI());
gameOverScene.add(gameOverTextActor);

const game = new Engine({
  canvasElementId: "game",
  width: 1280,
  height: 720,
  displayMode: DisplayMode.FitScreen,
  pixelArt: true,
  scenes: {
    start: MyLevel,
    gameOver: gameOverScene,
  },
  backgroundColor: Color.Black,
  physics: {
    solver: SolverStrategy.Realistic,
    gravity: new Vector(0, 0),
  },
  // NB: We have to have this to ensure that the metronome system works correctly
  // Let's just set it to 60 fps
  fixedUpdateFps: 60,
  suppressConsoleBootMessage: true,
});
game.input.gamepads.enabled = true;
game.start("start", { loader }).then(() => {});
