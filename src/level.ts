import { Engine, Entity, Scene } from "excalibur";
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

    // Trigger to start all metronome things
    engine.clock.schedule(() => {
      metronomeSystem.trigger();
    }, 300);
  }
}
