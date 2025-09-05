import { Actor, Engine, PolygonCollider, Color, Polygon } from "excalibur";

export type BeamSettings = {
  width: number;
  angle: number;
};

export class Beam extends Actor {
  private _settings: BeamSettings;
  constructor(settings: BeamSettings) {
    super();
    this._settings = settings;
  }

  override onInitialize(engine: Engine) {
    const direction = engine.input.pointers.primary.lastWorldPos
      .sub(this.globalPos)
      .normalize()
      .rotate(this._settings.angle);
    const beamPoints = [
      direction
        .sub(direction.normal().scale(this._settings.width))
        .add(direction.scale(3)),
      direction
        .scale(300)
        .sub(
          direction.normal().scale(this._settings.width).add(direction.scale(3))
        ),
      direction
        .scale(300)
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
    this.graphics.use(beam, { offset: direction.scale(153) });
  }
}
