import { Color, DisplayMode, Engine } from "excalibur";
import { loader } from "./resources";
import { MyLevel } from "./level";

const game = new Engine({
  canvasElementId: "game",
  width: 800,
  height: 600,
  displayMode: DisplayMode.FitContainer,
  pixelArt: true,
  scenes: {
    start: MyLevel,
  },
  backgroundColor: Color.Black,
  // NB: We have to have this to ensure that the metronome system works correctly
  // Let's just set it to 60 fps
  fixedUpdateTimestep: 16.666666666,
});

game.start("start", { loader }).then(() => {});
