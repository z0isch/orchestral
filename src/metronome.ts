import {
  Component,
  Engine,
  Query,
  System,
  SystemPriority,
  SystemType,
  World,
} from "excalibur";

type Beat = "1" | "2" | "3" | "4";

export class MetronomeComponent extends Component {
  public frameBeat: Beat | null = null;
  constructor() {
    super();
  }
}

export class MetronomeSystem extends System {
  private _currentBeat = 0;
  private _millisecondsPerBeat: Fraction;
  private _fixedUpdateTimestep: Fraction;
  private _accumulatedTime: Fraction;
  private _started: boolean = false;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;
  public query: Query<typeof MetronomeComponent>;

  constructor(world: World, engine: Engine, bpm: number) {
    super();
    this.query = world.query([MetronomeComponent]);

    this._millisecondsPerBeat = new Fraction(60000, bpm);
    this._fixedUpdateTimestep = new Fraction(engine.fixedUpdateTimestep!, 1);
    this._accumulatedTime = new Fraction(0, 1);
  }

  update(_elapsed: number): void {
    if (!this._started) return;
    this._accumulatedTime = this._accumulatedTime.add(
      this._fixedUpdateTimestep
    );

    if (this._accumulatedTime.greaterThanOrEqual(this._millisecondsPerBeat)) {
      for (let entity of this.query.entities) {
        const metronome = entity.get(MetronomeComponent);
        if (metronome) {
          if (this._currentBeat % 4 === 0) {
            metronome.frameBeat = "1";
          } else if (this._currentBeat % 4 === 1) {
            metronome.frameBeat = "2";
          } else if (this._currentBeat % 4 === 2) {
            metronome.frameBeat = "3";
          } else {
            metronome.frameBeat = "4";
          }
        }
      }

      // Subtract the beat duration
      this._accumulatedTime = this._accumulatedTime.subtract(
        this._millisecondsPerBeat
      );
      this._currentBeat++;
    } else {
      // No beat this frame
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

class Fraction {
  constructor(public numerator: number, public denominator: number) {
    this.numerator = numerator;
    this.denominator = denominator;
  }

  add(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator + other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  subtract(other: Fraction): Fraction {
    return new Fraction(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  greaterThanOrEqual(other: Fraction): boolean {
    return (
      this.numerator * other.denominator >= other.numerator * this.denominator
    );
  }
}
