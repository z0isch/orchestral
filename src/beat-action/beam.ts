import {
  Actor,
  Engine,
  PolygonCollider,
  Color,
  Polygon,
  Vector,
} from "excalibur";

export type BeamSettings = {
  width: number;
  angle: number;
};

export class Beam extends Actor {
  private _settings: BeamSettings;
  private _direction: Vector;
  constructor(settings: BeamSettings, direction: Vector) {
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
    const beamPoints = [
      direction
        .sub(direction.normal().scale(this._settings.width))
        .add(direction.scale(3)),
      direction
        .scale(500)
        .sub(
          direction.normal().scale(this._settings.width).add(direction.scale(3))
        ),
      direction
        .scale(500)
        .add(
          direction.normal().scale(this._settings.width).add(direction.scale(3))
        ),
      direction
        .add(direction.normal().scale(this._settings.width))
        .add(direction.scale(3)),
    ];
    this.collider.set(
      new PolygonCollider({
        points: beamPoints,
      })
    );
    const beam = new Polygon({
      points: beamPoints,
      color: Color.Orange,
    });
    beam.opacity = 0.5;
    this.graphics.use(beam, { offset: direction.scale(253) });
  }
}
