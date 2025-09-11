import {
  Actor,
  AnimationStrategy,
  Circle,
  Color,
  CircleCollider,
  Animation,
  Engine,
  Vector,
} from "excalibur";
import { Fraction } from "../metronome";

export type BombSettings = {
  radiusStart: number;
  growthFactor: number;
};

export class Bomb extends Actor {
  private _settings: BombSettings;
  private _msPerBeat: Fraction;
  private _target: Vector;
  constructor(
    settings: BombSettings,
    msPerBeat: Fraction,
    player: Actor,
    target: Vector
  ) {
    super();
    this._settings = settings;
    this._msPerBeat = msPerBeat;
    this._target = target.sub(player.pos);
  }

  override onInitialize(engine: Engine) {
    this.pos = this._target;
    const animation = new Animation({
      strategy: AnimationStrategy.End,
      frames: [
        {
          graphic: new Circle({
            radius: this._settings.radiusStart,
            strokeColor: Color.Red,
            opacity: 0.3,
          }),
          duration: this._msPerBeat.calculateMilliseconds(),
        },
        {
          graphic: new Circle({
            radius: this._settings.radiusStart + this._settings.growthFactor,
            strokeColor: Color.Red,
            opacity: 0.3,
          }),
          duration: this._msPerBeat.calculateMilliseconds(),
        },
        {
          graphic: new Circle({
            radius: this._settings.radiusStart + this._settings.growthFactor,
            strokeColor: Color.Red,
            opacity: 0.3,
          }),
          duration: this._msPerBeat.calculateMilliseconds() * 2,
        },
      ],
    });
    animation.events.on("frame", (d) => {
      this.collider.set(
        new CircleCollider({
          radius:
            this._settings.radiusStart +
            d.frameIndex * this._settings.growthFactor,
        })
      );
    });
    this.graphics.add(animation);
  }
}
