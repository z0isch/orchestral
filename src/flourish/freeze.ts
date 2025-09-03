import {
  Actor,
  Circle,
  Collider,
  CollisionContact,
  Color,
  Engine,
  Side,
} from "excalibur";
import { Skunk } from "../skunk";

export class Freeze extends Actor {
  private _radius: number;
  private _freezeLength: number;
  constructor(radius: number, freezeLength: number) {
    super({ radius });
    this._radius = radius;
    this._freezeLength = freezeLength;
  }
  override onInitialize(engine: Engine) {
    this.graphics.add(
      new Circle({
        radius: this._radius,
        color: Color.Azure,
        opacity: 0.3,
      })
    );
    engine.clock.schedule(() => {
      this.kill();
    }, 200);
  }
  override onCollisionStart(
    self: Collider,
    other: Collider,
    side: Side,
    contact: CollisionContact
  ): void {
    if (other.owner instanceof Skunk) {
      other.owner.freeze(this._freezeLength);
    }
  }
}
