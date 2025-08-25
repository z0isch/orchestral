import {
  Component,
  Engine,
  Query,
  System,
  SystemPriority,
  SystemType,
  World,
} from "excalibur";

export class MetronomeComponent extends Component {
  public frameIsOnBeat = false;
  constructor() {
    super();
  }
}

export class MetronomeSystem extends System {
  private _frameCount = 0;
  private _framesPerBeat: number;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;
  public query: Query<typeof MetronomeComponent>;

  constructor(world: World, engine: Engine, bpm: number) {
    super();
    this.query = world.query([MetronomeComponent]);
    this._framesPerBeat = Math.round(
      ((60 / bpm) * 1000) / engine.fixedUpdateTimestep!
    );
  }

  update(_elapsed: number): void {
    if ((this._frameCount + 1) % this._framesPerBeat === 0) {
      for (let entity of this.query.entities) {
        const metronome = entity.get(MetronomeComponent);
        if (metronome) {
          metronome.frameIsOnBeat = true;
        }
      }
      this._frameCount = 0;
    } else {
      for (let entity of this.query.entities) {
        const metronome = entity.get(MetronomeComponent);
        if (metronome) {
          metronome.frameIsOnBeat = false;
        }
      }
      this._frameCount++;
    }
  }
}
