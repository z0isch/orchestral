import {
  Actor,
  Engine,
  PolygonCollider,
  Color,
  Polygon,
  vec,
  lerp,
  Vector,
} from "excalibur";

export type ConeSettings = {
  coneSize: number;
  coneWidth: number;
  angle: number;
};

export class Cone extends Actor {
  private _settings: ConeSettings;
  private _direction: Vector;
  constructor(settings: ConeSettings, direction: Vector) {
    super();
    this._settings = settings;
    this._direction = direction.normalize();
  }

  override onInitialize(engine: Engine) {
    const conePoints = [
      vec(0, 0),
      this._direction
        .scale(this._settings.coneSize)
        .add(this._direction.normal().scale(this._settings.coneWidth)),
      this._direction
        .scale(this._settings.coneSize)
        .sub(this._direction.normal().scale(this._settings.coneWidth)),
    ];
    this.collider.set(
      new PolygonCollider({
        points: conePoints,
      })
    );
    const cone = new Polygon({
      points: conePoints,
      color: Color.Azure,
      opacity: 0.8,
    });

    // Crazy calculation, the offset follows a star pattern around the actor
    const offset = this._direction.scale(
      (() => {
        const angle = this._direction.toAngle();
        const fortyFiveDegrees = Math.PI / 4;
        const segment = Math.floor(angle / fortyFiveDegrees);
        const t = (angle % fortyFiveDegrees) / fortyFiveDegrees;
        return segment % 2 === 0
          ? lerp(this._settings.coneSize / 2, this._settings.coneSize, t)
          : lerp(this._settings.coneSize, this._settings.coneSize / 2, t);
      })()
    );
    this.graphics.use(cone, {
      offset,
    });
  }
}
