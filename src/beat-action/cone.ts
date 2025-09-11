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
    this._direction = direction;
  }

  override onInitialize(engine: Engine) {
    const direction =
      this._direction.x === 0 && this._direction.y === 0
        ? engine.input.pointers.primary.lastWorldPos
            .sub(this.globalPos)
            .normalize()
            .rotate(this._settings.angle)
        : this._direction;

    const conePoints = [
      vec(0, 0),
      direction
        .scale(this._settings.coneSize)
        .add(direction.normal().scale(this._settings.coneWidth)),
      direction
        .scale(this._settings.coneSize)
        .sub(direction.normal().scale(this._settings.coneWidth)),
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
    const offset = direction.scale(
      (() => {
        const angle = direction.toAngle();
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
