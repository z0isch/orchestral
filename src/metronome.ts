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
  public frameBeat: number | null = null;
  constructor() {
    super();
  }
}

export class MetronomeSystem extends System {
  private _currentBeat = 0;
  private _frameCount = 0;
  private _framesPerBeat: number;
  private _exactFramesPerBeat: number;
  private _accumulatedError = 0;
  private _started: boolean = false;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;
  public query: Query<typeof MetronomeComponent>;

  constructor(world: World, engine: Engine, bpm: number) {
    super();
    this.query = world.query([MetronomeComponent]);
    this._exactFramesPerBeat =
      ((60 / bpm) * 1000) / engine.fixedUpdateTimestep!;
    this._framesPerBeat = Math.round(this._exactFramesPerBeat);
  }

  update(_elapsed: number): void {
    if (!this._started) {
      return;
    }

    this._frameCount++;

    // Calculate the error between our rounded frames per beat and the exact value
    const roundingError = this._exactFramesPerBeat - this._framesPerBeat;
    this._accumulatedError += Math.abs(roundingError);

    // Determine the effective frames per beat for this beat, compensating for drift
    let effectiveFramesPerBeat = this._framesPerBeat;

    // If we've accumulated enough error (>= 1 frame), compensate
    if (this._accumulatedError >= 1.0) {
      if (roundingError > 0) {
        // We rounded down, so occasionally add a frame
        effectiveFramesPerBeat = this._framesPerBeat + 1;
      } else {
        // We rounded up, so occasionally subtract a frame
        effectiveFramesPerBeat = this._framesPerBeat - 1;
      }
      this._accumulatedError -= 1.0;
    }

    // Check if it's time for a beat
    if (this._frameCount >= effectiveFramesPerBeat) {
      for (let entity of this.query.entities) {
        const metronome = entity.get(MetronomeComponent);
        if (metronome) {
          metronome.frameBeat = this._currentBeat;
        }
      }
      this._currentBeat++;
      this._frameCount = 0;
    } else {
      for (let entity of this.query.entities) {
        const metronome = entity.get(MetronomeComponent);
        if (metronome) {
          metronome.frameBeat = null;
        }
      }
    }
  }

  trigger() {
    this._started = true;
  }
}
