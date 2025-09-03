import {
  Actor,
  AnimationStrategy,
  Circle,
  Color,
  CircleCollider,
  Animation,
  Engine,
} from "excalibur";

export class Bomb extends Actor {
  private _radiusStart: number;
  private _growthFactor: number;
  private _maxThrowDistance: number;
  constructor(
    radiusStart: number,
    growthFactor: number,
    maxThrowDistance: number
  ) {
    super();
    this._radiusStart = radiusStart;
    this._growthFactor = growthFactor;
    this._maxThrowDistance = maxThrowDistance;
  }
  override onInitialize(engine: Engine) {
    const direction = engine.input.pointers.primary.lastWorldPos.sub(
      this.globalPos
    );
    this.pos = direction
      .normalize()
      .scale(
        Math.max(
          this._radiusStart + 3 * this._growthFactor,
          Math.min(direction.magnitude, this._maxThrowDistance)
        )
      );
    const animation = new Animation({
      strategy: AnimationStrategy.End,
      frames: [
        {
          graphic: new Circle({
            radius: this._radiusStart,
            strokeColor: Color.Red,
            opacity: 0.3,
          }),
          duration: 100,
        },
        {
          graphic: new Circle({
            radius: this._radiusStart + this._growthFactor,
            strokeColor: Color.Red,
            opacity: 0.3,
          }),
          duration: 100,
        },
        {
          graphic: new Circle({
            radius: this._radiusStart + this._growthFactor,
            strokeColor: Color.Red,
            opacity: 0.3,
          }),
          duration: 200,
        },
      ],
    });
    animation.events.on("frame", (d) => {
      this.collider.set(
        new CircleCollider({
          radius: this._radiusStart + d.frameIndex * this._growthFactor,
        })
      );
    });
    animation.events.on("end", () => {
      this.kill();
    });
    this.graphics.add(animation);
  }
}
