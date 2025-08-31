import {
  Actor,
  SpriteSheet,
  Animation,
  vec,
  CollisionType,
  Vector,
  Random,
} from "excalibur";
import { MetronomeComponent } from "./metronome";
import { Resources } from "./resources";

export class Skunk extends Actor {
  private _skunkSpritesheetDR = SpriteSheet.fromImageSourceWithSourceViews({
    image: Resources.SkunkSpritesheetDR,
    sourceViews: [
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
    ],
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
      radius: 10,
      collisionType: CollisionType.Active,
    });
    this.body.mass = 1;
    this.body.bounciness = 1;
    this.body.friction = 0;
    this._skunkSpritesheetDR.sprites.forEach((sprite) => {
      sprite.scale = vec(0.75, 0.75);
    });
  }

  override onInitialize() {
    this.addComponent(new MetronomeComponent());
    this.graphics.add(
      "skunkDR",
      Animation.fromSpriteSheetCoordinates({
        spriteSheet: this._skunkSpritesheetDR,
        frameCoordinates: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
          { x: 3, y: 0 },
          { x: 4, y: 0 },
          { x: 5, y: 0 },
          { x: 6, y: 0 },
          { x: 7, y: 0 },
          { x: 8, y: 0 },
          { x: 9, y: 0 },
          { x: 10, y: 0 },
          { x: 11, y: 0 },
          { x: 12, y: 0 },
          { x: 13, y: 0 },
          { x: 14, y: 0 },
          { x: 15, y: 0 },
          { x: 16, y: 0 },
          { x: 17, y: 0 },
          { x: 18, y: 0 },
          { x: 19, y: 0 },
          { x: 20, y: 0 },
        ],
        durationPerFrame: 50,
      })
    );
    this.graphics.use("skunkDR");
  }
}
