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
  constructor(settings: BeamSettings, player: Actor, target: Vector) {
    super();
    this._settings = settings;
    this._direction = target.sub(player.pos).normalize();
  }

  override onInitialize(engine: Engine) {
    const beamPoints = [
      this._direction
        .sub(this._direction.normal().scale(this._settings.width))
        .add(this._direction.scale(3)),
      this._direction
        .scale(500)
        .sub(
          this._direction
            .normal()
            .scale(this._settings.width)
            .add(this._direction.scale(3))
        ),
      this._direction
        .scale(500)
        .add(
          this._direction
            .normal()
            .scale(this._settings.width)
            .add(this._direction.scale(3))
        ),
      this._direction
        .add(this._direction.normal().scale(this._settings.width))
        .add(this._direction.scale(3)),
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
    this.graphics.use(beam, { offset: this._direction.scale(253) });
  }
}
