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
      value: { beat: Beat; onBeat: (msGrace: number) => Beat | null };
    }
  | {
      tag: "duringBeat";
      value: {
        beat: Beat;
        msSinceBeatStart: Fraction;
        msTillNextBeat: Fraction;
        onBeat: (msGrace: number) => Beat | null;
      };
    };

type Beat = "1" | "2" | "3" | "4";

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
            metronome.frameBeat = {
              tag: "beatStartFrame",
              value: { beat: "1", onBeat: () => "1" },
            };
          } else if (this._currentBeat % 4 === 1) {
            metronome.frameBeat = {
              tag: "beatStartFrame",
              value: { beat: "2", onBeat: () => "2" },
            };
          } else if (this._currentBeat % 4 === 2) {
            metronome.frameBeat = {
              tag: "beatStartFrame",
              value: { beat: "3", onBeat: () => "3" },
            };
          } else {
            metronome.frameBeat = {
              tag: "beatStartFrame",
              value: { beat: "4", onBeat: () => "4" },
            };
          }
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
          metronome.frameBeat = {
            tag: "duringBeat",
            value: {
              beat,
              msSinceBeatStart,
              msTillNextBeat,
              onBeat: (msGrace: number) => {
                const tillNext =
                  msTillNextBeat.numerator / msTillNextBeat.denominator;
                const sinceStart =
                  msSinceBeatStart.numerator / msSinceBeatStart.denominator;
                if (tillNext < msGrace) {
                  switch (beat) {
                    case "1": {
                      return "2";
                    }
                    case "2": {
                      return "3";
                    }
                    case "3": {
                      return "4";
                    }
                    case "4": {
                      return "1";
                    }
                    default: {
                      return beat satisfies never;
                    }
                  }
                }
                if (sinceStart < msGrace) {
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
