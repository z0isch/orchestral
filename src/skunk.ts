import {
  Actor,
  SpriteSheet,
  Animation,
  vec,
  CollisionType,
  Vector,
  Random,
  Color,
} from "excalibur";
import { MetronomeComponent } from "./metronome";
import { Resources } from "./resources";

type SoundType = "consonance" | "dissonance";

export class Skunk extends Actor {
  soundType: SoundType;
  private _skunkSpritesheetDR = SpriteSheet.fromImageSourceWithSourceViews({
    image: Resources.SkunkSpritesheetDR,
    sourceViews: sourceViewsDR,
  });
  constructor() {
    const rand = new Random();
    super({
      name: "Skunk",
      pos: rand.pickOne([
        new Vector(800, 600),
        new Vector(0, 600),
        new Vector(800, 0),
        new Vector(0, 0),
      ]),
      radius: 25,
      collisionType: CollisionType.Active,
    });
    this.soundType = rand.pickOne(["consonance", "dissonance"]);
    this.body.mass = 1;
    this.body.bounciness = 1;
    this.body.friction = 0;
    this._skunkSpritesheetDR.sprites.forEach((sprite) => {
      sprite.scale = vec(0.75, 0.75);
    });
  }

  override onInitialize() {
    this.addComponent(new MetronomeComponent());
    const a = Animation.fromSpriteSheetCoordinates({
      spriteSheet: this._skunkSpritesheetDR,
      frameCoordinates: getFrameCoords(sourceViewsDR),
      durationPerFrame: 50,
    });
    a.tint = this.soundType === "consonance" ? Color.Red : Color.Blue;
    this.graphics.add("skunkDR", a);
    this.graphics.use("skunkDR");
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
