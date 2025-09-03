import {
  Actor,
  Engine,
  PolygonCollider,
  Color,
  Polygon,
  vec,
  lerp,
} from "excalibur";

export class Cone extends Actor {
  private _coneSize: number;
  private _coneWidth: number;
  constructor(coneSize: number, coneWidth: number) {
    super();
    this._coneSize = coneSize;
    this._coneWidth = coneWidth;
  }

  override onInitialize(engine: Engine) {
    const direction = engine.input.pointers.primary.lastWorldPos
      .sub(this.globalPos)
      .normalize();

    const conePoints = [
      vec(0, 0),
      direction
        .scale(this._coneSize)
        .add(direction.normal().scale(this._coneWidth)),
      direction
        .scale(this._coneSize)
        .sub(direction.normal().scale(this._coneWidth)),
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
          ? lerp(this._coneSize / 2, this._coneSize, t)
          : lerp(this._coneSize, this._coneSize / 2, t);
      })()
    );
    this.graphics.use(cone, {
      offset,
    });
  }
}
