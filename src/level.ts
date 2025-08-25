import {
  Actor,
  Color,
  Engine,
  Entity,
  Font,
  Scene,
  Text,
  Vector,
} from "excalibur";
import { Resources } from "./resources";
import { MetronomeComponent, MetronomeSystem } from "./metronome";
import { Player } from "./player";
import { UI } from "./ui";

const BPM = 90;
const CLICK_TRACK = Resources.clicktrack90bpm;

export class MyLevel extends Scene {
  override onInitialize(engine: Engine): void {
    const metronomeSystem = new MetronomeSystem(this.world, engine, BPM);
    this.world.add(metronomeSystem);

    const player = new Player();
    this.add(player);

    const ui = new UI();
    this.add(ui);

    const clicktrack = new Entity({});
    let isPlaying = false;
    clicktrack.addComponent(new MetronomeComponent());
    clicktrack.onPreUpdate = () => {
      if (clicktrack.get(MetronomeComponent).frameIsOnBeat && !isPlaying) {
        CLICK_TRACK.play();
        isPlaying = true;
      }
    };
    this.add(clicktrack);

    const countdown = new Actor({ pos: new Vector(400, 300) });
    countdown.onInitialize = () => {
      let text = new Text({
        text: "3",
        font: new Font({ size: 100 }),
        color: Color.White,
      });
      countdown.graphics.add("countdown", text);
      engine.clock.schedule(() => {
        text.text = "2";
      }, 1000);
      engine.clock.schedule(() => {
        text.text = "1";
      }, 2000);
      engine.clock.schedule(() => {
        countdown.graphics.remove("countdown");
        metronomeSystem.trigger();
      }, 3000);
      countdown.graphics.use("countdown");
    };

    this.add(countdown);
  }
}
