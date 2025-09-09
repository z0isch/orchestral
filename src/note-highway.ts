import {
  Actor,
  Color,
  CoordPlane,
  Engine,
  GraphicsGroup,
  Line,
  range,
  Polygon,
  vec,
  Vector,
  Text,
  Font,
  Circle,
} from "excalibur";
import {
  Beat,
  FrameBeat,
  isDownBeat,
  MetronomeComponent,
  MetronomeSystem,
} from "./metronome";
import { globalstate } from "./globalstate";

// Perspective configuration
const PERSPECTIVE_SCALE = 0.4; // How much the far end of the highway shrinks (0 = point, 1 = no perspective)

// Helper functions for perspective calculations
function getPerspectiveWidth(
  baseWidth: number,
  distanceFromPlayer: number,
  maxDistance: number
): number {
  const t = distanceFromPlayer / maxDistance; // 0 at player, 1 at far end
  return baseWidth * (1 - t * (1 - PERSPECTIVE_SCALE));
}

function getPerspectiveLinePoints(
  baseWidth: number,
  y: number,
  distanceFromPlayer: number,
  maxDistance: number,
  centerX: number
): { start: Vector; end: Vector } {
  const perspectiveWidth = getPerspectiveWidth(
    baseWidth,
    distanceFromPlayer,
    maxDistance
  );
  const halfWidth = perspectiveWidth / 2;

  return {
    start: vec(centerX - halfWidth, y),
    end: vec(centerX + halfWidth, y),
  };
}

export class NoteHighway extends Actor {
  private _width: number = 0;
  private _height: number = 0;
  private _highwayActor = new Actor({ anchor: vec(0, 0) });
  private _notesActor = new Actor({ anchor: vec(0, 0) });
  private _permCenterLineActor = new Actor({ anchor: vec(0, 0) });
  private _bpm: number;
  constructor(bpm: number) {
    super({
      pos: vec(0, 0),
      coordPlane: CoordPlane.Screen,
    });
    this._bpm = bpm;
  }

  override onInitialize(engine: Engine) {
    this._width = engine.screen.resolution.width / 6;
    this._height = (engine.screen.resolution.height * 2) / 4 - 100;
    this.pos = vec(engine.screen.resolution.width / 2 - this._width / 2, 0);
    const metronomeComponent = new MetronomeComponent();
    this.addComponent(metronomeComponent);

    // Create perspective center line
    const centerLinePoints = getPerspectiveLinePoints(
      this._width,
      this._height,
      0,
      this._height,
      this._width / 2
    );
    this._permCenterLineActor.graphics.add(
      "centerLine",
      new Line({
        start: centerLinePoints.start,
        end: centerLinePoints.end,
        thickness: 2,
        color: Color.Red,
      })
    );
    this._permCenterLineActor.graphics.add(
      "centerLineBeat",
      new Line({
        start: centerLinePoints.start,
        end: centerLinePoints.end,
        thickness: this._height / 15 / 4,
        color: Color.Red,
      })
    );

    // Create trapezoid highway shape using perspective
    const nearWidth = this._width;
    const farWidth = getPerspectiveWidth(
      this._width,
      this._height,
      this._height
    );
    const centerX = this._width / 2;

    const trapezoidPoints = [
      vec(centerX - nearWidth / 2, this._height), // bottom left
      vec(centerX + nearWidth / 2, this._height), // bottom right
      vec(centerX + farWidth / 2, 0), // top right
      vec(centerX - farWidth / 2, 0), // top left
    ];

    const outlineActor = new Actor({ anchor: vec(0, 0) });
    outlineActor.graphics.add(
      new GraphicsGroup({
        members: [
          {
            graphic: new Polygon({
              points: trapezoidPoints,
              lineWidth: 2,
              strokeColor: Color.White,
              color: Color.Black,
            }),
            offset: vec(0, 0),
          },
        ],
        useAnchor: false,
      })
    );
    outlineActor.graphics.opacity = 0.15;
    this.addChild(outlineActor);

    this._notesActor.graphics.opacity = 0.8;
    this._notesActor.z = 3;
    this.addChild(this._notesActor);

    this._highwayActor.graphics.opacity = 0.5;
    this.addChild(this._highwayActor);

    this._permCenterLineActor.graphics.opacity = 0.5;
    this._permCenterLineActor.z = 2;
    this.addChild(this._permCenterLineActor);

    this._drawBeatLines(MetronomeSystem.getInitialFrameBeat(this._bpm));
  }

  override onPreUpdate(engine: Engine): void {
    const frameBeat = this.get(MetronomeComponent).frameBeat;
    if (frameBeat === null) return;
    this._drawBeatLines(frameBeat);
  }

  private _drawBeatLines(frameBeat: FrameBeat) {
    switch (frameBeat.tag) {
      case "beatStartFrame": {
        if (isDownBeat(frameBeat.value.beat)) {
          this._permCenterLineActor.graphics.use("centerLineBeat");
        } else {
          this._permCenterLineActor.graphics.use("centerLine");
        }
        const flourishes = globalstate.flourishes
          .entries()
          .map(([beat, _flourish]) => ({
            beat,
            note: "␣",
            color: Color.ExcaliburBlue,
          }));
        const { highway, notes } = beatLines(
          frameBeat.value.beat,
          Array.from(flourishes),
          this._width,
          this._height
        );
        this._notesActor.graphics.use(notes);
        this._highwayActor.graphics.use(highway);

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
  currentBeat: Beat,
  notes: Array<{ beat: Beat; note: string; color: Color }>,
  width: number,
  height: number
): { highway: GraphicsGroup; notes: GraphicsGroup } {
  const partHeight = height / 15;
  const centerX = width / 2;

  const members = range(0, 15).map((i) => {
    const rev = 16 - i;
    const onDownBeat = rev % 4 === currentBeat % 4;
    const onUpBeat = rev % 4 === (currentBeat + 2) % 4;

    const lineY = height - i * partHeight;
    const distanceFromPlayer = height - lineY;

    const linePoints = getPerspectiveLinePoints(
      width,
      lineY,
      distanceFromPlayer,
      height,
      centerX
    );

    return {
      highwayMember: {
        graphic: new Line({
          start: linePoints.start,
          end: linePoints.end,
          thickness: Math.max(
            3 * getPerspectiveWidth(1, distanceFromPlayer, height),
            0.3
          ),
          color: onDownBeat
            ? Color.White
            : onUpBeat
            ? Color.Gray
            : Color.Transparent,
        }),
        offset: vec(0, 0),
      },
      noteMembers: notes.flatMap(({ beat, note, color }) => {
        const futureBeat = (currentBeat + 16 - rev) % 16;
        const isNoteBeat = futureBeat === beat - 1;
        const perspectiveThickness =
          partHeight * getPerspectiveWidth(1, distanceFromPlayer, height);
        return isNoteBeat
          ? [
              {
                graphic: new Text({
                  text: note,
                  font: new Font({ size: perspectiveThickness * 2 }),
                  color: Color.Black,
                }),
                offset: linePoints.start.add(
                  vec(
                    getPerspectiveWidth(width, distanceFromPlayer, height) / 2 -
                      perspectiveThickness / 2,
                    -perspectiveThickness
                  )
                ),
              },
              {
                graphic: new Circle({
                  radius: perspectiveThickness * 1.25,
                  color,
                }),
                offset: linePoints.start.add(
                  vec(
                    getPerspectiveWidth(width, distanceFromPlayer, height) / 2 -
                      perspectiveThickness,
                    -perspectiveThickness * 1.25
                  )
                ),
              },
            ]
          : [];
      }),
    };
  });

  return {
    highway: new GraphicsGroup({
      members: members.map((x) => x.highwayMember),
      useAnchor: false,
    }),
    notes: new GraphicsGroup({
      members: members.flatMap((x) => x.noteMembers),
      useAnchor: false,
    }),
  };
}
