import {
  Actor,
  Color,
  Engine,
  Line,
  SpriteSheet,
  Animation,
  vec,
  Keys,
  Timer,
} from "excalibur";
import { Resources } from "./resources";
import { MetronomeComponent } from "./metronome";
import { BeatAction, globalstate } from "./globalstate";
import { AOE } from "./beat-actions/aoe";
import { Beam } from "./beat-actions/beam";
import { Cone } from "./beat-actions/cone";

export class Player extends Actor {
  private _lineActor = new Actor();
  private _maestroSpritesheetDR = SpriteSheet.fromImageSourceWithSourceViews({
    image: Resources.MaestroSpritesheetDR,
    sourceViews: [
      { x: 322, y: 125, width: 449 - 322, height: 328 - 125 },
      { x: 1087, y: 122, width: 1212 - 1087, height: 334 - 122 },
      { x: 1868, y: 127, width: 1972 - 1868, height: 336 - 127 },
      { x: 2639, y: 122, width: 2731 - 2639, height: 334 - 122 },
      { x: 332, y: 570, width: 433 - 332, height: 781 - 570 },
      { x: 1100, y: 572, width: 1206 - 1100, height: 778 - 572 },
      { x: 1866, y: 572, width: 1982 - 1866, height: 781 - 572 },
      { x: 2639, y: 578, width: 2756 - 2639, height: 778 - 578 },
      { x: 330, y: 1023, width: 457 - 330, height: 1229 - 1023 },
      { x: 1092, y: 1028, width: 1225 - 1100, height: 1226 - 1028 },
      { x: 1855, y: 1023, width: 1993 - 1855, height: 1229 - 1023 },
      { x: 2620, y: 1020, width: 2737 - 2620, height: 1223 - 1020 },
      { x: 316, y: 1470, width: 457 - 316, height: 1676 - 1470 },
      { x: 1092, y: 1462, width: 1220 - 1100, height: 1679 - 1462 },
      { x: 1868, y: 1462, width: 1985 - 1868, height: 1674 - 1462 },
      { x: 2639, y: 1462, width: 2742 - 2639, height: 1682 - 1462 },
      { x: 330, y: 1915, width: 433 - 330, height: 2127 - 1915 },
      { x: 1100, y: 1915, width: 1206 - 1100, height: 2129 - 1915 },
      { x: 1863, y: 1912, width: 1982 - 1863, height: 2127 - 1912 },
      { x: 2623, y: 1918, width: 2756 - 2623, height: 2129 - 1918 },
      { x: 319, y: 2368, width: 449 - 319, height: 2574 - 2368 },
    ],
  });
  private _maestroSpritesheetUL = SpriteSheet.fromImageSourceWithSourceViews({
    image: Resources.MaestroSpritesheetUL,
    sourceViews: [
      { x: 322, y: 125, width: 449 - 322, height: 328 - 125 },
      { x: 1087, y: 122, width: 1212 - 1087, height: 334 - 122 },
      { x: 1868, y: 127, width: 1972 - 1868, height: 336 - 127 },
      { x: 2639, y: 122, width: 2731 - 2639, height: 334 - 122 },
      { x: 332, y: 570, width: 433 - 332, height: 781 - 570 },
      { x: 1100, y: 572, width: 1206 - 1100, height: 778 - 572 },
      { x: 1866, y: 572, width: 1982 - 1866, height: 781 - 572 },
      { x: 2639, y: 578, width: 2756 - 2639, height: 778 - 578 },
      { x: 330, y: 1023, width: 457 - 330, height: 1229 - 1023 },
      { x: 1092, y: 1028, width: 1225 - 1100, height: 1226 - 1028 },
      { x: 1855, y: 1023, width: 1993 - 1855, height: 1229 - 1023 },
      { x: 2620, y: 1020, width: 2737 - 2620, height: 1223 - 1020 },
      { x: 316, y: 1470, width: 457 - 316, height: 1676 - 1470 },
      { x: 1092, y: 1462, width: 1220 - 1100, height: 1679 - 1462 },
      { x: 1868, y: 1462, width: 1985 - 1868, height: 1674 - 1462 },
      { x: 2639, y: 1462, width: 2742 - 2639, height: 1682 - 1462 },
      { x: 330, y: 1915, width: 433 - 330, height: 2127 - 1915 },
      { x: 1100, y: 1915, width: 1206 - 1100, height: 2129 - 1915 },
      { x: 1863, y: 1912, width: 1982 - 1863, height: 2127 - 1912 },
      { x: 2623, y: 1918, width: 2756 - 2623, height: 2129 - 1918 },
      { x: 319, y: 2368, width: 449 - 319, height: 2574 - 2368 },
    ],
  });
  constructor() {
    super({
      name: "Player",
      x: 400,
      y: 400,
      radius: 4,
    });
    this._maestroSpritesheetDR.sprites.forEach((sprite) => {
      sprite.scale = vec(0.1, 0.1);
    });
    this._maestroSpritesheetUL.sprites.forEach((sprite) => {
      sprite.scale = vec(0.1, 0.1);
    });
  }

  override onInitialize() {
    this.addChild(this._lineActor);
    this.addComponent(new MetronomeComponent());
    this.graphics.add(
      "maestroDR",
      Animation.fromSpriteSheetCoordinates({
        spriteSheet: this._maestroSpritesheetDR,
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
    this.graphics.add(
      "maestroUL",
      Animation.fromSpriteSheetCoordinates({
        spriteSheet: this._maestroSpritesheetUL,
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
    this.graphics.add(
      "maestroIdleDR",
      this._maestroSpritesheetDR.getSprite(4, 0)
    );
    this.graphics.use("maestroIdleDR");
    this.graphics.add(
      "maestroIdleUL",
      this._maestroSpritesheetUL.getSprite(4, 0)
    );
  }
  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    const angle = this.vel.toAngle();
    if (this.vel.x === 0 && this.vel.y === 0) {
      const angleToMouse = engine.input.pointers.primary.lastWorldPos
        .sub(this.pos)
        .toAngle();
      if (angleToMouse >= Math.PI && angleToMouse < (3 * Math.PI) / 2) {
        this.graphics.use("maestroIdleUL");
      } else {
        this.graphics.use("maestroIdleDR");
      }
    } else if (angle >= Math.PI && angle < (3 * Math.PI) / 2) {
      this.graphics.use("maestroUL");
    } else {
      this.graphics.use("maestroDR");
    }
    const mousePos = engine.input.pointers.primary.lastWorldPos;
    const frameBeat = this.get(MetronomeComponent).frameBeat;
    if (frameBeat !== null) {
      if (
        frameBeat.value.closestBeat !== null &&
        engine.input.keyboard.wasPressed(Keys.X)
      ) {
        const aoeSize =
          8 *
          Math.exp(
            -frameBeat.value.closestBeat.msFromBeat.calculateMilliseconds() / 80
          );
        const cone = new Beam(aoeSize);
        const t = new Timer({
          fcn: () => {
            cone.kill();
          },
          repeats: false,
          interval: 80,
        });
        engine.add(t);
        this.addChild(cone);
        t.start();
      }
      switch (frameBeat.tag) {
        case "beatStartFrame": {
          const processBeat = (action: BeatAction) => {
            const direction = mousePos.sub(this.pos);
            const distance = direction.distance();
            return (() => {
              switch (action) {
                case "moveToMouse": {
                  const direction = mousePos.sub(this.pos);
                  this.vel =
                    direction.magnitude < 1
                      ? vec(0, 0)
                      : direction.normalize().scale(75);
                  break;
                }
                case "forward-aoe": {
                  const aoe = new AOE(32, 8);
                  this.addChild(aoe);
                  // this.actions
                  //   .moveBy({
                  //     offset: direction
                  //       .normalize()
                  //       .scale(Math.min(distance, 60)),
                  //     duration: 100,
                  //   })
                  //   .callMethod(() => {
                  //     const aoe = new AOE(32, 8);
                  //     this.addChild(aoe);
                  //   });
                  break;
                }
                case "forward": {
                  this.actions.moveBy({
                    offset: direction
                      .normalize()
                      .scale(Math.min(distance, 100)),
                    duration: 400,
                  });
                  break;
                }
                case "backward": {
                  this.actions.moveBy({
                    offset: direction
                      .normalize()
                      .scale(Math.min(distance, 50) * -1),
                    duration: 100,
                  });
                  break;
                }
                case "forward-cone": {
                  const coneActor = new Cone(50, 50);
                  this.addChild(coneActor);
                  this.actions
                    .moveBy({
                      offset: direction
                        .normalize()
                        .scale(Math.min(distance, 30)),
                      duration: 400,
                    })
                    .callMethod(() => {
                      coneActor.kill();
                      this.removeChild(coneActor);
                    });
                  break;
                }
                case "forward-beam": {
                  const beamActor = new Beam(10);
                  this.addChild(beamActor);
                  this.actions
                    .moveBy({
                      offset: direction
                        .normalize()
                        .scale(Math.min(distance, 30)),
                      duration: 400,
                    })
                    .callMethod(() => {
                      beamActor.kill();
                      this.removeChild(beamActor);
                    });
                  break;
                }
                default: {
                  return action satisfies never;
                }
              }
            })();
          };

          switch (frameBeat.value.beat) {
            case "1": {
              processBeat(globalstate.beataction1);
              break;
            }
            case "2": {
              processBeat(globalstate.beataction2);
              break;
            }
            case "3": {
              processBeat(globalstate.beataction3);
              break;
            }
            case "4": {
              processBeat(globalstate.beataction4);
              break;
            }
            default: {
              frameBeat.value.beat satisfies never;
            }
          }
          break;
        }
        case "duringBeat": {
          const processBeat = (action: BeatAction) => {
            return (() => {
              switch (action) {
                case "moveToMouse": {
                  const direction = mousePos.sub(this.pos);
                  this.vel =
                    direction.magnitude < 1
                      ? vec(0, 0)
                      : direction.normalize().scale(75);
                }
                case "forward-aoe": {
                  return null;
                }
                case "forward": {
                  return null;
                }
                case "backward": {
                  return null;
                }
                case "forward-cone": {
                  return null;
                }
                case "forward-beam": {
                  return null;
                }
                default: {
                  return action satisfies never;
                }
              }
            })();
          };

          (() => {
            switch (frameBeat.value.beat) {
              case "1": {
                processBeat(globalstate.beataction1);
                break;
              }
              case "2": {
                processBeat(globalstate.beataction2);
                break;
              }
              case "3": {
                processBeat(globalstate.beataction3);
                break;
              }
              case "4": {
                processBeat(globalstate.beataction4);
                break;
              }
              default: {
                return frameBeat.value.beat satisfies never;
              }
            }
          })();
          break;
        }
        default: {
          return frameBeat satisfies never;
        }
      }
    }
    const line = new Line({
      start: vec(0, 0),
      end: mousePos.sub(this.pos),
      color: Color.White,
      thickness: 4,
    });
    line.opacity = 0.1;
    this._lineActor.graphics.use(line, {
      anchor: vec(0, 0),
      offset: vec(0, 0),
    });
  }
}
