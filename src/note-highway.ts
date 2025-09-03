import {
  Actor,
  Color,
  CoordPlane,
  Engine,
  GraphicsGroup,
  Line,
  range,
  vec,
} from "excalibur";
import { Beat, MetronomeComponent } from "./metronome";

export class NoteHighway extends Actor {
  private _linesActor = new Actor({ anchor: vec(0, 0) });
  private _permCenterLineActor = new Actor({ anchor: vec(0, 0) });
  private _centerLineActor = new Actor({ anchor: vec(0, 0) });
  constructor() {
    super({
      pos: vec(0, 0),
      coordPlane: CoordPlane.Screen,
    });
  }

  override onInitialize(engine: Engine) {
    this.addComponent(new MetronomeComponent());
    this._permCenterLineActor.graphics.add(
      "centerLine",
      new Line({
        start: vec(engine.screen.resolution.width / 2, 450),
        end: vec(engine.screen.resolution.width / 2, 600),
        thickness: 3,
        color: Color.Red,
      })
    );
    this._permCenterLineActor.graphics.opacity = 0.3;
    this.addChild(this._permCenterLineActor);
    this.addChild(this._centerLineActor);
    this.addChild(this._linesActor);
  }

  override onPreUpdate(engine: Engine): void {
    const frameBeat = this.get(MetronomeComponent).frameBeat;
    if (frameBeat === null) return;

    this._permCenterLineActor.graphics.use("centerLine");
    switch (frameBeat.tag) {
      case "beatStartFrame": {
        if (parseInt(frameBeat.value.beat) % 4 == 0) {
          this._centerLineActor.graphics.add(
            "centerLine",
            new Line({
              start: vec(
                engine.screen.resolution.width / 2,
                parseInt(frameBeat.value.beat) % 16 === 0 ? 400 : 500
              ),
              end: vec(engine.screen.resolution.width / 2, 600),
              thickness: parseInt(frameBeat.value.beat) % 16 === 0 ? 30 : 10,
              color: Color.ExcaliburBlue,
            })
          );
          this._centerLineActor.graphics.opacity = 0.2;
          this._centerLineActor.graphics.use("centerLine");
        } else {
          this._centerLineActor.graphics.remove("centerLine");
        }
        this._linesActor.graphics.use(
          beatLines(
            engine,
            frameBeat.value.beat,
            engine.screen.resolution.width / 15
          )
        );
        this._linesActor.graphics.opacity = 0.2;

        break;
      }
      case "duringBeat": {
        break;
      }
      default: {
        frameBeat satisfies never;
      }
    }
  }
}

function beatLines(
  engine: Engine,
  currentBeat: Beat,
  partWidth: number
): GraphicsGroup {
  const beatNum = parseInt(currentBeat);
  const members = range(0, 15).map((i) => {
    const onDownBeat = i % 4 === beatNum % 4;
    const isFirstBeat = onDownBeat && (8 + i) % 16 === beatNum % 16;
    return {
      graphic: new Line({
        start: vec(
          engine.screen.resolution.width / 2,
          isFirstBeat ? 450 : onDownBeat ? 550 : 575
        ),
        end: vec(engine.screen.resolution.width / 2, 600),
        thickness: isFirstBeat ? 30 : 3,
        color: onDownBeat ? Color.ExcaliburBlue : Color.White,
      }),
      offset: vec((i - 8) * partWidth, 0),
    };
  });
  return new GraphicsGroup({
    useAnchor: false,
    members,
  });
}
