import { Actor, Color, Engine, Line, vec, Keys } from "excalibur";
import {
  msDistanceFromBeat,
  MetronomeComponent,
  Beat,
  isDownBeat,
} from "./metronome";
import { globalstate, loadConfig } from "./globalstate";
import { Beam } from "./beat-action/beam";
import { Cone } from "./beat-action/cone";
import { Bomb } from "./beat-action/bomb";
import * as Maestro from "./spirte-sheet/maestro";
import { Freeze } from "./flourish/freeze";
import { Resources } from "./resources";

export class Player extends Actor {
  private _lineActor = new Actor();
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

  override onAdd(engine: Engine): void {
    engine.input.pointers.primary.on("down", () => {
      const frameBeat = this.get(MetronomeComponent).frameBeat;
      if (frameBeat === null) return;
      for (const [beat, flourish] of globalstate.flourishes) {
        const msAroundFlourish = msDistanceFromBeat(
          frameBeat,
          beat
        ).calculateMilliseconds();
        if (msAroundFlourish <= 60) {
          switch (flourish.tag) {
            case "freeze": {
              this.addChild(new Freeze(flourish.value));
              break;
            }
            default:
              flourish.tag satisfies never;
              break;
          }
        } else if (
          msAroundFlourish < frameBeat.value.msPerBeat.calculateMilliseconds()
        ) {
          this.scene?.camera.shake(5, 5, 200);
        }
      }
    });
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    loadConfig();
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
      if (engine.input.keyboard.wasPressed(Keys.Space)) {
        const nextBeat = ((frameBeat.value.beat + 1) % 16) as Beat;
        const previousBeat = ((frameBeat.value.beat - 1) % 16) as Beat;
        const msAroundClick = Math.min(
          msDistanceFromBeat(
            frameBeat,
            frameBeat.value.beat
          ).calculateMilliseconds(),
          msDistanceFromBeat(frameBeat, nextBeat).calculateMilliseconds(),
          msDistanceFromBeat(frameBeat, previousBeat).calculateMilliseconds()
        );
        if (
          isDownBeat(frameBeat.value.beat) ||
          isDownBeat(nextBeat) ||
          isDownBeat(previousBeat)
        ) {
          if (msAroundClick <= 60) {
            this.invincible = true;
            this.actions
              .moveBy({
                offset: this.vel.normalize().scale(60),
                duration: frameBeat.value.msPerBeat.calculateMilliseconds() * 2,
              })
              .toPromise()
              .then(() => {
                this.invincible = false;
              });
          } else if (
            msAroundClick < frameBeat.value.msPerBeat.calculateMilliseconds()
          ) {
            this.scene?.camera.shake(5, 5, 200);
          }
        }
      }

      if (engine.input.keyboard.isHeld(Keys.W)) {
        this.vel.y = -30;
      }
      if (engine.input.keyboard.isHeld(Keys.A)) {
        this.vel.x = -30;
      }
      if (engine.input.keyboard.isHeld(Keys.D)) {
        this.vel.x = 30;
      }
      if (engine.input.keyboard.isHeld(Keys.S)) {
        this.vel.y = 30;
      }

      if (engine.input.keyboard.wasReleased(Keys.W)) {
        this.vel.y = 0;
      }
      if (engine.input.keyboard.wasReleased(Keys.A)) {
        this.vel.x = 0;
      }
      if (engine.input.keyboard.wasReleased(Keys.D)) {
        this.vel.x = 0;
      }
      if (engine.input.keyboard.wasReleased(Keys.S)) {
        this.vel.y = 0;
      }
      switch (frameBeat.tag) {
        case "beatStartFrame": {
          for (const [beat, beatAction] of globalstate.beatActions) {
            if (beat === frameBeat.value.beat) {
              switch (beatAction.tag) {
                case "cone": {
                  const coneActor = new Cone(beatAction.value);
                  this.addChild(coneActor);
                  engine.clock.schedule(() => {
                    coneActor.kill();
                    this.removeChild(coneActor);
                  }, frameBeat.value.msPerBeat.calculateMilliseconds() * 2);
                  break;
                }
                case "beam": {
                  const beamActor = new Beam(beatAction.value);
                  this.addChild(beamActor);
                  engine.clock.schedule(() => {
                    beamActor.kill();
                    this.removeChild(beamActor);
                  }, frameBeat.value.msPerBeat.calculateMilliseconds());

                  break;
                }
                case "bomb": {
                  const bomb = new Bomb(
                    beatAction.value,
                    frameBeat.value.msPerBeat
                  );
                  this.addChild(bomb);
                  engine.clock.schedule(() => {
                    bomb.kill();
                    this.removeChild(bomb);
                  }, frameBeat.value.msPerBeat.calculateMilliseconds() * 4);
                  break;
                }

                default: {
                  beatAction satisfies never;
                  break;
                }
              }
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

  public doDomage() {
    if (!this.invincible) {
      this.invincible = true;
      this.scene?.engine.clock.schedule(() => {
        this.invincible = false;
      }, 1000);
      if (!globalstate.playerInvincible) {
        globalstate.playerHealth--;
      }
      if (globalstate.playerHealth <= 0) {
        Resources.song101bpm.stop();
        this.scene?.engine.goToScene("gameOver");
      }
    }
  }
}
