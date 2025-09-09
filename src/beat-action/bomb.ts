import {
  Actor,
  AnimationStrategy,
  Circle,
  Color,
  CircleCollider,
  Animation,
  Engine,
} from "excalibur";
import { Fraction } from "../metronome";

export type BombSettings = {
  radiusStart: number;
  growthFactor: number;
  maxThrowDistance: number;
};

export class Bomb extends Actor {
  private _settings: BombSettings;
  private _msPerBeat: Fraction;
  constructor(settings: BombSettings, msPerBeat: Fraction) {
    super();
    this._settings = settings;
    this._msPerBeat = msPerBeat;
  }

  override onInitialize(engine: Engine) {
    const direction = engine.input.pointers.primary.lastWorldPos.sub(
      this.globalPos
    );
    this.pos = direction
      .normalize()
      .scale(
        Math.max(
          this._settings.radiusStart + 2 * this._settings.growthFactor,
          Math.min(direction.magnitude, this._settings.maxThrowDistance)
        )
      );
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
