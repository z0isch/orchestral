import {
  Component,
  Engine,
  Query,
  System,
  SystemPriority,
  SystemType,
  World,
} from "excalibur";

export type FrameBeat =
  | {
      tag: "beatStartFrame";
      value: {
        beat: Beat;
        msSinceBeatStart: Fraction;
        msTillNextBeat: Fraction;
        msPerBeat: Fraction;
      };
    }
  | {
      tag: "duringBeat";
      value: {
        beat: Beat;
        msSinceBeatStart: Fraction;
        msTillNextBeat: Fraction;
        msPerBeat: Fraction;
      };
    };

export type Beat =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12
  | 13
  | 14
  | 15
  | 16;

export function isDownBeat(beat: Beat) {
  return beat === 1 || beat === 5 || beat === 9 || beat === 13;
}

export class MetronomeComponent extends Component {
  public frameBeat: FrameBeat | null = null;
  constructor() {
    super();
  }
}

export class MetronomeSystem extends System {
  private _currentBeat = 0;
  private _msPerBeat: Fraction;
  private _fixedUpdateTimestep: Fraction;
  private _accumulatedTime: Fraction;
  private _started: boolean = false;
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;
  public query: Query<typeof MetronomeComponent>;

  constructor(world: World, engine: Engine, bpm: number) {
    super();
    this.query = world.query([MetronomeComponent]);

    this._msPerBeat = new Fraction(60000, bpm * 4);
    this._fixedUpdateTimestep = new Fraction(engine.fixedUpdateTimestep!, 1);
    this._accumulatedTime = new Fraction(0, 1);
  }

  public static getInitialFrameBeat(bpm: number): FrameBeat {
    return {
      tag: "beatStartFrame",
      value: {
        beat: 1 as Beat,
        msSinceBeatStart: new Fraction(0, 1),
        msTillNextBeat: new Fraction(60000, bpm * 4),
        msPerBeat: new Fraction(60000, bpm * 4),
      },
    };
  }

  update(_elapsed: number): void {
    if (!this._started) return;
    this._accumulatedTime = this._accumulatedTime.add(
      this._fixedUpdateTimestep
    );

    if (this._accumulatedTime.greaterThanOrEqual(this._msPerBeat)) {
      for (let entity of this.query.entities) {
        const metronome = entity.get(MetronomeComponent);
        if (metronome) {
          const beat = (this._currentBeat % 16) + 1;

          metronome.frameBeat = {
            tag: "beatStartFrame",
            value: {
              beat: beat as Beat,
              msSinceBeatStart: new Fraction(0, 1),
              msTillNextBeat: this._msPerBeat,
              msPerBeat: this._msPerBeat,
            },
          };
        }
      }

      // Subtract the beat duration
      this._accumulatedTime = this._accumulatedTime.subtract(this._msPerBeat);
      this._currentBeat++;
    } else {
      for (let entity of this.query.entities) {
        const metronome = entity.get(MetronomeComponent);
        if (metronome.frameBeat) {
          metronome.frameBeat = {
            tag: "duringBeat",
            value: {
              beat: metronome.frameBeat.value.beat,
              msSinceBeatStart: this._accumulatedTime,
              msTillNextBeat: this._msPerBeat.subtract(this._accumulatedTime),
              msPerBeat: this._msPerBeat,
            },
          };
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
    const gcd = this.gcd(Math.abs(numerator), Math.abs(denominator));
    this.numerator = numerator / gcd;
    this.denominator = denominator / gcd;
  }

  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b);
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

  calculateMilliseconds(): number {
    return this.numerator / this.denominator;
  }
}

export function msDistanceFromBeat(frameBeat: FrameBeat, beat: Beat): Fraction {
  const shifted = frameBeat.value.beat - beat;
  const onBeatOrAfterBeat = shifted >= 0 && shifted <= 8;
  const sinceStartOrTillNext = onBeatOrAfterBeat
    ? frameBeat.value.msSinceBeatStart
    : frameBeat.value.msTillNextBeat;
  const beatDistance = 8 - Math.abs(Math.abs(beat - frameBeat.value.beat) - 8);
  const factor = Math.max(0, beatDistance - 1);
  let base = sinceStartOrTillNext;
  for (let i = 0; i < factor; i++) {
    base = base.add(frameBeat.value.msPerBeat);
  }
  return base;
}
