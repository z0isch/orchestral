import { Actor, Color, Engine, Line, vec, Keys } from "excalibur";
import {
  msDistanceFromBeat,
  isDownBeat,
  MetronomeComponent,
} from "./metronome";
import { BeatAction, globalstate } from "./globalstate";
import { AOE } from "./beat-action/aoe";
import { Beam } from "./beat-action/beam";
import { Cone } from "./beat-action/cone";
import { Bomb } from "./beat-action/bomb";
import * as Maestro from "./spirte-sheet/maestro";
import { Freeze } from "./flourish/freeze";
export class Player extends Actor {
  private _lineActor = new Actor();
  private _isWalking = true;
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
      if (engine.input.keyboard.wasPressed(Keys.X)) {
        const msAroundFirstBeat = msDistanceFromBeat(
          frameBeat,
          1
        ).calculateMilliseconds();
        if (msAroundFirstBeat <= 100) {
          this.addChild(new Freeze(200, 1500));
        } else if (msAroundFirstBeat < 200) {
          this.scene?.camera.shake(5, 5, 200);
        }
      }
      switch (frameBeat.tag) {
        case "beatStartFrame": {
          const processBeat = (action: BeatAction | null) => {
            const direction = mousePos.sub(this.pos);
            const distance = direction.distance();
            if (this._isWalking && isDownBeat(frameBeat.value.beat)) {
              this.actions.moveBy({
                offset: direction.normalize().scale(Math.min(distance, 60)),
                duration: frameBeat.value.msPerBeat.calculateMilliseconds() * 2,
              });
            }
            return (() => {
              switch (action) {
                case "aoe": {
                  const aoe = new AOE(32, 8);
                  this.addChild(aoe);
                  break;
                }
                case "cone": {
                  const coneActor = new Cone(60, 60);
                  this.addChild(coneActor);
                  engine.clock.schedule(() => {
                    coneActor.kill();
                    this.removeChild(coneActor);
                  }, frameBeat.value.msPerBeat.calculateMilliseconds() * 2);
                  break;
                }
                case "beam": {
                  const beamActor = new Beam(12);
                  this.addChild(beamActor);
                  engine.clock.schedule(() => {
                    beamActor.kill();
                    this.removeChild(beamActor);
                  }, frameBeat.value.msPerBeat.calculateMilliseconds());

                  break;
                }
                case "bomb": {
                  const bomb = new Bomb(40, 10, 150);
                  this.addChild(bomb);
                  break;
                }
                case null: {
                  break;
                }
                default: {
                  return action satisfies never;
                }
              }
            })();
          };
          switch (frameBeat.value.beat) {
            case 1:
              processBeat(globalstate.beataction1);
              break;
            case 2:
              processBeat(globalstate.beataction2);
              break;
            case 3:
              processBeat(globalstate.beataction3);
              break;
            case 4:
              processBeat(globalstate.beataction4);
              break;
            case 5:
              processBeat(globalstate.beataction5);
              break;
            case 6:
              processBeat(globalstate.beataction6);
              break;
            case 7:
              processBeat(globalstate.beataction7);
              break;
            case 8:
              processBeat(globalstate.beataction8);
              break;
            case 9:
              processBeat(globalstate.beataction9);
              break;
            case 10:
              processBeat(globalstate.beataction10);
              break;
            case 11:
              processBeat(globalstate.beataction11);
              break;
            case 12:
              processBeat(globalstate.beataction12);
              break;
            case 13:
              processBeat(globalstate.beataction13);
              break;
            case 14:
              processBeat(globalstate.beataction14);
              break;
            case 15:
              processBeat(globalstate.beataction15);
              break;
            case 16:
              processBeat(globalstate.beataction16);
              break;
            default: {
              frameBeat.value.beat satisfies never;
            }
          }
          break;
        }
        case "duringBeat": {
          break;
        }
        default: {
          frameBeat satisfies never;
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
