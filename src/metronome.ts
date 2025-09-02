import {
  Component,
  Engine,
  Query,
  System,
  SystemPriority,
  SystemType,
  World,
} from "excalibur";

type FrameBeat =
  | {
      tag: "beatStartFrame";
      value: {
        beat: Beat;
        onBeat: (msGracePeriod: number) => Beat | null;
        closestBeat: { beat: Beat; msFromBeat: Fraction };
        millisecondsPerBeat: Fraction;
      };
    }
  | {
      tag: "duringBeat";
      value: {
        beat: Beat;
        msSinceBeatStart: Fraction;
        msTillNextBeat: Fraction;
        onBeat: (msGracePeriod: number) => Beat | null;
        closestBeat: { beat: Beat; msFromBeat: Fraction };
        millisecondsPerBeat: Fraction;
      };
    };

type Beat =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "11"
  | "12"
  | "13"
  | "14"
  | "15"
  | "16";

const nextBeat = (beat: Beat) => {
  switch (beat) {
    case "1":
      return "2";
    case "2":
      return "3";
    case "3":
      return "4";
    case "4":
      return "5";
    case "5":
      return "6";
    case "6":
      return "7";
    case "7":
      return "8";
    case "8":
      return "9";
    case "9":
      return "10";
    case "10":
      return "11";
    case "11":
      return "12";
    case "12":
      return "13";
    case "13":
      return "14";
    case "14":
      return "15";
    case "15":
      return "16";
    case "16":
      return "1";
    default: {
      return beat satisfies never;
    }
  }
};

export function isDownBeat(beat: Beat) {
  return beat === "1" || beat === "5" || beat === "9" || beat === "13";
}

export class MetronomeComponent extends Component {
  public frameBeat: FrameBeat | null = null;
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

    this._millisecondsPerBeat = new Fraction(60000, bpm * 4);
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
          const beatNumber = (this._currentBeat % 16) + 1;
          const beatString = beatNumber.toString() as Beat;

          metronome.frameBeat = {
            tag: "beatStartFrame",
            value: {
              beat: beatString,
              onBeat: () => beatString,
              closestBeat: { beat: beatString, msFromBeat: new Fraction(0, 1) },
              millisecondsPerBeat: this._millisecondsPerBeat,
            },
          };
        }
      }

      // Subtract the beat duration
      this._accumulatedTime = this._accumulatedTime.subtract(
        this._millisecondsPerBeat
      );
      this._currentBeat++;
    } else {
      for (let entity of this.query.entities) {
        const metronome = entity.get(MetronomeComponent);
        if (metronome.frameBeat) {
          const beat = metronome.frameBeat.value.beat;
          const msTillNextBeat = this._millisecondsPerBeat.subtract(
            this._accumulatedTime
          );
          const msSinceBeatStart = this._accumulatedTime;

          const tillNext = msTillNextBeat.calculateMilliseconds();
          const sinceStart = msSinceBeatStart.calculateMilliseconds();

          const closestBeat = {
            beat: sinceStart < tillNext ? beat : nextBeat(beat),
            msFromBeat:
              sinceStart < tillNext ? msSinceBeatStart : msTillNextBeat,
          };

          metronome.frameBeat = {
            tag: "duringBeat",
            value: {
              beat,
              msSinceBeatStart,
              msTillNextBeat,
              closestBeat,
              millisecondsPerBeat: this._millisecondsPerBeat,
              onBeat: (msGracePeriod: number) => {
                if (tillNext < msGracePeriod) {
                  nextBeat(beat);
                }
                if (sinceStart < msGracePeriod) {
                  return beat;
                }
                return null;
              },
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
