import {
  Actor,
  Circle,
  CollisionType,
  Color,
  Engine,
  Entity,
  Font,
  Random,
  Scene,
  Text,
  Timer,
  Vector,
} from "excalibur";
import { Resources } from "./resources";
import { MetronomeComponent, MetronomeSystem } from "./metronome";
import { Player } from "./player";
import { UI } from "./ui";
import { globalstate } from "./globalstate";

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

    const addBullet = () => {
      const radius = rand.integer(6, 15);
      const bulletActor = new Actor({
        pos: rand.pickOne([
          new Vector(800, 600),
          new Vector(0, 600),
          new Vector(800, 0),
          new Vector(0, 0),
        ]),
        radius,
        collisionType: CollisionType.Active,
      });
      bulletActor.body.mass = 1;
      bulletActor.body.bounciness = 1;
      bulletActor.body.friction = 0;
      bulletActor.graphics.add(
        new Circle({
          radius,
          color: Color.fromHex("#D9001D"),
        })
      );
      bulletActor.onCollisionStart = (self, other, side, contact) => {
        if (other.owner.name === "Player") {
          globalstate.playerHealth--;
          if (globalstate.playerHealth <= 0) {
            Resources.clicktrack101bpm.stop();
            TRACK.stop();
            engine.goToScene("gameOver");
          }
          self.owner.kill();
        }
        if (other.owner.name === "aoe") {
          globalstate.score++;
          self.owner.kill();
        }
      };
      this.world.add(bulletActor);
      bulletActor.actions.meet(player, rand.integer(70, 90));
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
        addBullet();
        const bulletTimer = new Timer({
          fcn: addBullet,
          repeats: true,
          interval: 3000,
        });
        bulletTimer.start();
        this.add(bulletTimer);
      }, 3000);
      engine.clock.schedule(() => {
        countdown.graphics.remove("countdown");
      }, 3333);
      countdown.graphics.use("countdown");
    };

    this.add(countdown);
  }
}
