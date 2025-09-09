import {
  Actor,
  Circle,
  Collider,
  Color,
  Engine,
  Random,
  Sprite,
  vec,
  Vector,
} from "excalibur";
import { MetronomeComponent } from "./metronome";
import { Resources } from "./resources";
import { Player } from "./player";
import { globalstate } from "./globalstate";
import { AOE } from "./beat-action/aoe";
import { Beam } from "./beat-action/beam";
import { Bomb } from "./beat-action/bomb";
import { Cone } from "./beat-action/cone";
import { FreezableComponent } from "./freezable";
import { OnBeatStartComponent } from "./onBeatStart";

export class Raccoon extends Actor {
  private _player: Actor;
  constructor(player: Actor) {
    const rand = new Random();
    const angle = rand.floating(0, Math.PI * 2);
    const distance = 150;
    const pos = new Vector(
      Math.cos(angle) * distance,
      Math.sin(angle) * distance
    ).add(player.pos);
    super({
      name: "Skunk",
      pos,
      radius: 7,
    });
    this.body.mass = 1;
    this.body.bounciness = 0.5;
    this.body.friction = 0;
    this._player = player;
  }

  override onInitialize() {
    this.addComponent(new MetronomeComponent());
    const raccoon = new Sprite({ image: Resources.Raccoon });
    raccoon.scale = vec(0.02, 0.02);
    this.graphics.add("raccoon", raccoon);
    this.graphics.use("raccoon");
    this.addComponent(new FreezableComponent());
    this.addComponent(
      new OnBeatStartComponent((frameBeat) => {
        if (frameBeat.value.beat % 4 === 0) {
          const rand = new Random();
          if (this.pos.distance(this._player.pos) > 100) {
            if (rand.integer(0, 100) < 50) {
              this.actions.moveTo({
                pos: this._player.pos
                  .sub(this.pos)
                  .normalize()
                  .scale(50)
                  .add(this.pos),
                duration: frameBeat.value.msPerBeat.calculateMilliseconds() * 2,
              });
            } else {
              this.scene?.engine.currentScene.add(
                new Bullet({ radius: 3, shooter: this, player: this._player })
              );
            }
          } else {
            if (rand.integer(0, 100) < 50) {
              this.actions.moveTo({
                pos: this._player.pos
                  .sub(this.pos)
                  .normalize()
                  .negate()
                  .scale(40)
                  .add(this.pos),
                duration: frameBeat.value.msPerBeat.calculateMilliseconds() * 2,
              });
            } else {
              this.scene?.engine.currentScene.add(
                new Bullet({ radius: 3, shooter: this, player: this._player })
              );
            }
          }
        }
      })
    );
  }

  override onCollisionStart(self: Collider, other: Collider): void {
    if (other.owner instanceof Player) {
      other.owner.doDomage();
    }
    if (
      other.owner instanceof AOE ||
      other.owner instanceof Beam ||
      other.owner instanceof Cone ||
      other.owner instanceof Bomb
    ) {
      globalstate.score++;
      self.owner.kill();
    }
  }
}

class Bullet extends Actor {
  private _radius: number;
  private _player: Actor;
  private _direction: Vector | null = null;
  constructor(settings: { radius: number; shooter: Actor; player: Actor }) {
    super({
      pos: settings.shooter.pos,
      radius: settings.radius,
    });
    this._radius = settings.radius;
    this._player = settings.player;
  }

  override onInitialize() {
    this.addComponent(new MetronomeComponent());
    this.graphics.add(new Circle({ radius: this._radius, color: Color.Red }));
    this._direction = this._player.pos.sub(this.pos).normalize();
    this.addComponent(
      new OnBeatStartComponent((frameBeat) => {
        if (frameBeat.value.beat % 4 === 0 && this._direction) {
          this.actions.moveBy({
            offset: this._direction.scale(70),
            duration: frameBeat.value.msPerBeat.calculateMilliseconds() * 2,
          });
        }
      })
    );
  }

  override onPreUpdate(engine: Engine, elapsed: number): void {
    if (this.pos.distance(this._player.pos) > 300) {
      this.kill();
      return;
    }
  }

  override onCollisionStart(self: Collider, other: Collider): void {
    if (
      other.owner instanceof AOE ||
      other.owner instanceof Beam ||
      other.owner instanceof Cone ||
      other.owner instanceof Bomb
    ) {
      self.owner.kill();
    }

    if (other.owner instanceof Player) {
      this.kill();
      if (!other.owner.invincible) {
        other.owner.invincible = true;
        this.scene?.engine.clock.schedule(() => {
          if (other.owner instanceof Player) other.owner.invincible = false;
        }, 1000);
        if (!globalstate.playerInvincible) {
          globalstate.playerHealth--;
        }
        if (globalstate.playerHealth <= 0) {
          Resources.clicktrack101bpm.stop();
          Resources.song101bpm.stop();
          this.scene?.engine.goToScene("gameOver");
        }
      }
    }
  }
}
