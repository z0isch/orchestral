import { Actor, Color, Engine, Line, vec, Keys, Circle } from "excalibur";
import { MetronomeComponent } from "./metronome";
import { BeatAction, globalstate } from "./globalstate";
import { AOE } from "./beat-actions/aoe";
import { Beam } from "./beat-actions/beam";
import { Cone } from "./beat-actions/cone";
import { Bomb } from "./beat-actions/bomb";
import { Skunk } from "./skunk";
import * as Maestro from "./spirte-sheet/maestro";
export class Player extends Actor {
  private _lineActor = new Actor();
  private _isWalking = false;
  public invincible = false;
  constructor() {
    super({
      name: "Player",
      x: 400,
      y: 300,
      radius: 4,
    });
    Maestro.spritesheetDR.sprites.forEach((sprite) => {
      sprite.scale = vec(0.1, 0.1);
    });
    Maestro.spritesheetUL.sprites.forEach((sprite) => {
      sprite.scale = vec(0.1, 0.1);
    });
  }

  override onInitialize() {
    this.addChild(this._lineActor);
    this.addComponent(new MetronomeComponent());
    this.graphics.add("maestroDR", Maestro.animationDR);
    this.graphics.add("maestroUL", Maestro.animationUL);
    this.graphics.add("maestroIdleDR", Maestro.spritesheetDR.getSprite(4, 0));
    this.graphics.use("maestroIdleDR");
    this.graphics.add("maestroIdleUL", Maestro.spritesheetUL.getSprite(4, 0));
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
    if (engine.input.keyboard.wasPressed(Keys.W)) {
      this._isWalking = !this._isWalking;
    }
    const mousePos = engine.input.pointers.primary.lastWorldPos;
    const frameBeat = this.get(MetronomeComponent).frameBeat;
    if (frameBeat !== null) {
      if (
        engine.input.keyboard.wasPressed(Keys.X) &&
        frameBeat.value.closestBeat.beat === "1"
      ) {
        const onBeat =
          frameBeat.value.closestBeat.msFromBeat.calculateMilliseconds();
        if (onBeat > 75) {
          console.log(onBeat);
          this.scene?.camera.shake(5, 5, 200);
        } else {
          const freezeFlourish = new Actor({ radius: 200 });
          freezeFlourish.graphics.add(
            new Circle({
              radius: 180,
              color: Color.Azure,
              opacity: 0.3,
            })
          );
          freezeFlourish.onCollisionStart = (self, other, side, contact) => {
            if (other.owner instanceof Skunk) {
              other.owner.freeze(1500);
            }
          };
          engine.clock.schedule(() => {
            freezeFlourish.kill();
          }, 200);
          this.addChild(freezeFlourish);
        }
        // if (
        //   frameBeat.value.closestBeat !== null &&
        //   engine.input.keyboard.wasPressed(Keys.X)
        // ) {
        // const aoeSize =
        //   8 *
        //   Math.exp(
        //     -frameBeat.value.closestBeat.msFromBeat.calculateMilliseconds() / 80
        //   );
        // const cone = new Beam(aoeSize);
        // const t = new Timer({
        //   fcn: () => {
        //     cone.kill();
        //   },
        //   repeats: false,
        //   interval: 80,
        // });
        // engine.add(t);
        // this.addChild(cone);
        // t.start();
      }
      switch (frameBeat.tag) {
        case "beatStartFrame": {
          const processBeat = (action: BeatAction) => {
            const direction = mousePos.sub(this.pos);
            const distance = direction.distance();
            if (this._isWalking) {
              this.actions.moveBy({
                offset: direction.normalize().scale(Math.min(distance, 60)),
                duration: 100,
              });
            }
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
                  break;
                }
                case "forward": {
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
                  const coneActor = new Cone(60, 60);
                  this.addChild(coneActor);
                  engine.clock.schedule(() => {
                    coneActor.kill();
                    this.removeChild(coneActor);
                  }, 500);
                  break;
                }
                case "forward-beam": {
                  const beamActor = new Beam(15);
                  this.addChild(beamActor);
                  engine.clock.schedule(() => {
                    beamActor.kill();
                    this.removeChild(beamActor);
                  }, 400);

                  break;
                }
                case "bomb": {
                  const bomb = new Bomb(40, 10, 150);
                  this.addChild(bomb);
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
                case "bomb": {
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
