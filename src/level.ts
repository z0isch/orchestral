import {
  Actor,
  Text,
  Color,
  Engine,
  Entity,
  Font,
  Random,
  Scene,
  Timer,
  Vector,
} from "excalibur";
import { Resources } from "./resources";
import { MetronomeComponent, MetronomeSystem } from "./metronome";
import { Player } from "./player";
import { UI } from "./ui";
import { globalstate } from "./globalstate";
import { Skunk } from "./skunk";

const BPM = 101;
const TRACK = Resources.song101bpm;

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
      const frameBeat = clicktrack.get(MetronomeComponent).frameBeat;
      const isOnFirstBeat =
        frameBeat?.tag === "beatStartFrame" && frameBeat.value.beat === "1";
      if (isOnFirstBeat && !isPlaying) {
        Resources.clicktrack101bpm.volume = 0.05;
        Resources.clicktrack101bpm.play();
        TRACK.play();
        isPlaying = true;
      }
    };
    this.add(clicktrack);
    const rand = new Random();

    const addSkunk = () => {
      const skunkActor = new Skunk();
      skunkActor.onCollisionStart = (self, other, side, contact) => {
        if (other.owner.name === "Player") {
          globalstate.playerHealth--;
          if (globalstate.playerHealth <= 0) {
            Resources.clicktrack101bpm.stop();
            TRACK.stop();
            engine.goToScene("gameOver");
          }
          self.owner.kill();
        }
        if (self.owner instanceof Skunk && other.owner instanceof Skunk) {
          if (other.owner.soundType === self.owner.soundType) {
            self.owner.kill();
            other.owner.kill();
          }
        }
        if (other.owner.name === "aoe") {
          globalstate.score++;
          if (self.owner instanceof Skunk) {
            switch (self.owner.soundType) {
              case "consonance":
                globalstate.consonanceScore++;
                break;
              case "dissonance":
                globalstate.dissonanceScore++;
                break;
              default:
                self.owner.soundType satisfies never;
            }
          }
          if (
            Math.abs(
              globalstate.consonanceScore - globalstate.dissonanceScore
            ) >= 3
          ) {
            globalstate.playerHealth--;
            globalstate.consonanceScore = 0;
            globalstate.dissonanceScore = 0;
            if (globalstate.playerHealth <= 0) {
              Resources.clicktrack101bpm.stop();
              TRACK.stop();
              engine.goToScene("gameOver");
            }
          }
          self.owner.kill();
        }
      };
      this.world.add(skunkActor);
      skunkActor.actions.meet(player, rand.integer(50, 95));
    };
    const countdown = new Actor({ pos: new Vector(400, 300) });
    countdown.onInitialize = () => {
      let text = new Text({
        text: "3",
        font: new Font({ size: 100 }),
        color: Color.White,
      });
      countdown.graphics.add("countdown", text);
      Resources.TickStartSound.play();
      engine.clock.schedule(() => {
        text.text = "2";
        Resources.TickStartSound.play();
      }, 1000);
      engine.clock.schedule(() => {
        text.text = "1";
        Resources.TickStartSound.play();
      }, 2000);
      engine.clock.schedule(() => {
        text.text = "GO!";
        Resources.GoSound.play();
        metronomeSystem.trigger();
        addSkunk();
        const skunkTimer = new Timer({
          fcn: addSkunk,
          repeats: true,
          interval: 600,
        });
        skunkTimer.start();
        this.add(skunkTimer);
      }, 3000);
      engine.clock.schedule(() => {
        countdown.graphics.remove("countdown");
      }, 3333);
      countdown.graphics.use("countdown");
    };

    this.add(countdown);
  }
}
