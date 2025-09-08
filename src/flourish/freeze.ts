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

export type FreezeSettings = {
  radius: number;
};

export class Freeze extends Actor {
  private _settings: FreezeSettings;
  constructor(settings: FreezeSettings) {
    super({ radius: settings.radius });
    this._settings = settings;
  }
  override onInitialize(engine: Engine) {
    this.graphics.add(
      new Circle({
        radius: this._settings.radius,
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
      other.owner.freeze();
    }
  }
}
