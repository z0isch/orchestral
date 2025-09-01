import {
  Actor,
  AnimationStrategy,
  Circle,
  Color,
  CircleCollider,
  Animation,
} from "excalibur";

export class AOE extends Actor {
  private _radiusStart: number;
  private _growthFactor: number;
  constructor(radiusStart: number, growthFactor: number) {
    super();
    this._radiusStart = radiusStart;
    this._growthFactor = growthFactor;
  }
  override onInitialize() {
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
