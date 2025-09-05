import {
  Actor,
  SpriteSheet,
  Animation,
  vec,
  CollisionType,
  Vector,
  Random,
  Color,
  Engine,
} from "excalibur";
import { MetronomeComponent } from "./metronome";
import { Resources } from "./resources";
import { Player } from "./player";

export class Skunk extends Actor {
  private _isFrozen = false;
  private _freezeBeats = 0;
  private _stepDistanceMin;
  private _stepDistanceMax;
  private _skunkSpritesheetDR = SpriteSheet.fromImageSourceWithSourceViews({
    image: Resources.SkunkSpritesheetDR,
    sourceViews: sourceViewsDR,
  });
  private _skunkAnimationDR = Animation.fromSpriteSheetCoordinates({
    spriteSheet: this._skunkSpritesheetDR,
    frameCoordinates: getFrameCoords(sourceViewsDR),
    durationPerFrame: 50,
  });
  private _player: Player;
  constructor(
    player: Player,
    stepDistanceMin: number,
    stepDistanceMax: number
  ) {
    const rand = new Random();
    const angle = rand.floating(0, Math.PI * 2);
    const distance = 200;
    const pos = new Vector(
      Math.cos(angle) * distance,
      Math.sin(angle) * distance
    ).add(player.pos);
    super({
      name: "Skunk",
      pos,
      radius: 7,
      collisionType: CollisionType.Active,
    });
    this.body.mass = 1;
    this.body.bounciness = 0.5;
    this.body.friction = 0;
    this._stepDistanceMin = stepDistanceMin;
    this._stepDistanceMax = stepDistanceMax;
    this._player = player;
    this._skunkSpritesheetDR.sprites.forEach((sprite) => {
      sprite.scale = vec(0.3, 0.3);
    });
  }

  override onInitialize() {
    this.addComponent(new MetronomeComponent());
    this.graphics.add("skunkDR", this._skunkAnimationDR);
    this.graphics.use("skunkDR");
  }

  override onPreUpdate(engine: Engine) {
    const rand = new Random();
    const frameBeat = this.get(MetronomeComponent).frameBeat;
    if (frameBeat === null) return;

    if (this._isFrozen) {
      switch (frameBeat.tag) {
        case "beatStartFrame": {
          this._freezeBeats++;
          if (this._freezeBeats >= 9) {
            this._skunkAnimationDR.tint = Color.White;
            this._skunkAnimationDR.opacity = 1;
            this.body.collisionType = CollisionType.Active;
            this._isFrozen = false;
            this._freezeBeats = 0;
          }
          break;
        }
        case "duringBeat": {
          break;
        }
      }
    }

    if (frameBeat.value.beat % 4 === 0 && !this._isFrozen) {
      console.log(rand.integer(this._stepDistanceMin, this._stepDistanceMax));
      switch (frameBeat.tag) {
        case "beatStartFrame": {
          this.actions.moveTo({
            pos: this._player.pos
              .sub(this.pos)
              .normalize()
              .scale(rand.integer(this._stepDistanceMin, this._stepDistanceMax))
              .add(this.pos),
            duration: frameBeat.value.msPerBeat.calculateMilliseconds() * 2,
          });
          break;
        }
        case "duringBeat": {
          break;
        }
        default: {
          frameBeat satisfies never;
          break;
        }
      }
    }
  }

  public freeze(timeMs: number) {
    this._skunkAnimationDR.tint = Color.Azure;
    this._skunkAnimationDR.opacity = 0.8;
    this.body.collisionType = CollisionType.Passive;
    this.actions.clearActions();
    this._isFrozen = true;
  }
}

const getFrameCoords = (sourceViews: Array<unknown>) => {
  return sourceViews.map(() => {
    return { x: 0, y: 0 };
  });
};

const sourceViewsDR = [
  {
    x: 56,
    y: 24,
    width: 50,
    height: 46,
  },
  {
    x: 219,
    y: 25,
    width: 44,
    height: 44,
  },
  {
    x: 376,
    y: 24,
    width: 48,
    height: 45,
  },
  {
    x: 536,
    y: 24,
    width: 50,
    height: 47,
  },
  {
    x: 56,
    y: 118,
    width: 50,
    height: 48,
  },
  {
    x: 218,
    y: 119,
    width: 47,
    height: 45,
  },
  {
    x: 378,
    y: 117,
    width: 45,
    height: 47,
  },
  {
    x: 534,
    y: 116,
    width: 50,
    height: 48,
  },
  {
    x: 55,
    y: 212,
    width: 51,
    height: 48,
  },
  {
    x: 216,
    y: 211,
    width: 49,
    height: 47,
  },
  {
    x: 376,
    y: 209,
    width: 49,
    height: 50,
  },
  {
    x: 535,
    y: 210,
    width: 47,
    height: 47,
  },
  {
    x: 54,
    y: 302,
    width: 50,
    height: 50,
  },
  {
    x: 215,
    y: 304,
    width: 48,
    height: 47,
  },
  {
    x: 376,
    y: 303,
    width: 48,
    height: 46,
  },
  {
    x: 536,
    y: 305,
    width: 51,
    height: 46,
  },
  {
    x: 55,
    y: 397,
    width: 49,
    height: 47,
  },
  {
    x: 218,
    y: 399,
    width: 46,
    height: 46,
  },
  {
    x: 377,
    y: 398,
    width: 46,
    height: 45,
  },
  {
    x: 537,
    y: 399,
    width: 48,
    height: 47,
  },
  {
    x: 57,
    y: 492,
    width: 48,
    height: 46,
  },
];
