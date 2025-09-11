import {
  Actor,
  Color,
  Engine,
  vec,
  Keys,
  Axes,
  Buttons,
  Vector,
  TransformComponent,
  Query,
} from "excalibur";
import {
  msDistanceFromBeat,
  MetronomeComponent,
  Beat,
  isDownBeat,
  nextBeat,
} from "./metronome";
import { globalstate, loadConfig } from "./globalstate";
import { Beam } from "./beat-action/beam";
import { Cone } from "./beat-action/cone";
import { Bomb } from "./beat-action/bomb";
import * as Maestro from "./spirte-sheet/maestro";
import { Freeze } from "./flourish/freeze";
import { Resources } from "./resources";
import { PlayerAimComponent } from "./player-aim";
import { CanAimAtComponent } from "./can-aim-at";

export class Player extends Actor {
  private _lineActor = new Actor();
  public invincible = false;
  private _sprintedOnBeat: Beat | null = null;
  private _missedSprintOnBeat: Beat | null = null;
  private _currentAim: Vector | null = null;
  private _currentAimQuery: Query<
    typeof CanAimAtComponent | typeof TransformComponent
  > | null = null;
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
    this.addComponent(new PlayerAimComponent());
    this.graphics.add("maestroDR", Maestro.animationDR);
    this.graphics.add("maestroUL", Maestro.animationUL);
    this.graphics.add("maestroIdleDR", Maestro.spritesheetDR.getSprite(4, 0));
    this.graphics.use("maestroIdleDR");
    this.graphics.add("maestroIdleUL", Maestro.spritesheetUL.getSprite(4, 0));
    this._lineActor.graphics.opacity = 0.1;
  }

  override onAdd(engine: Engine): void {
    this._currentAimQuery =
      engine.currentScene.world.query([
        CanAimAtComponent,
        TransformComponent,
      ]) ?? null;
    engine.input.pointers.primary.on("down", () => {
      const frameBeat = this.get(MetronomeComponent).frameBeat;
      if (frameBeat === null) return;
      for (const [beat, flourish] of globalstate.flourishes) {
        const msAroundFlourish = msDistanceFromBeat(
          frameBeat,
          beat
        ).calculateMilliseconds();
        if (msAroundFlourish <= 90) {
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
    //const mousePos = engine.input.pointers.primary.lastWorldPos;
    const frameBeat = this.get(MetronomeComponent).frameBeat;
    if (frameBeat === null) return;

    this.vel = vec(
      engine.input.gamepads.at(0)?.getAxes(Axes.LeftStickX),
      engine.input.gamepads.at(0)?.getAxes(Axes.LeftStickY)
    )
      .normalize()
      .scale(45);
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

    if (frameBeat !== null) {
      if (frameBeat.tag === "duringBeat") {
        if (frameBeat.value.msTillNextBeat.calculateMilliseconds() <= 100) {
          for (let entity of this._currentAimQuery?.entities ?? []) {
            const currentAimDistance =
              this._currentAim === null
                ? null
                : this.pos.distance(this._currentAim);
            const entityTransform = entity.get(TransformComponent);
            if (
              currentAimDistance === null ||
              this.pos.distance(entityTransform.pos) < currentAimDistance
            ) {
              this._currentAim = entityTransform.pos;
            }
          }
          // this._lineActor.graphics.use(
          //   new Line({
          //     start: vec(0, 0),
          //     end: (this._currentAim ?? vec(0, 0))
          //       .sub(this.pos)
          //       .normalize()
          //       .scale(300),
          //     // playerAim.lastRightStickGamepadAxes.x === 0 &&
          //     // playerAim.lastRightStickGamepadAxes.y === 0
          //     //   ? mousePos.sub(this.pos)
          //     //   : playerAim.lastRightStickGamepadAxes.scale(300),
          //     color: Color.White,
          //     thickness: 4,
          //   }),
          //   {
          //     anchor: vec(0, 0),
          //     offset: vec(0, 0),
          //   }
          //);
        }
      }
      if (
        frameBeat.tag === "beatStartFrame" &&
        this._sprintedOnBeat !== null &&
        nextBeat(frameBeat.value.beat) === this._sprintedOnBeat
      ) {
        this._sprintedOnBeat = null;
      }
      if (
        frameBeat.tag === "beatStartFrame" &&
        this._missedSprintOnBeat !== null
      ) {
        let beat = frameBeat.value.beat;
        Array.from({ length: 7 }).forEach(() => (beat = nextBeat(beat)));
        if (beat === this._missedSprintOnBeat) {
          this._missedSprintOnBeat = null;
          Object.values(this.graphics.graphics).forEach((g) => {
            g.tint = Color.White;
            g.opacity = 1;
          });
        }
      }

      if (
        engine.input.keyboard.wasPressed(Keys.L) ||
        engine.input.gamepads.at(0)?.wasButtonPressed(Buttons.RightTrigger)
      ) {
        const { msAroundPress, sprintForBeat } = (() => {
          const msAroundThisBeat = msDistanceFromBeat(
            frameBeat,
            frameBeat.value.beat
          ).calculateMilliseconds();
          const msAroundNextBeat = msDistanceFromBeat(
            frameBeat,
            nextBeat(frameBeat.value.beat)
          ).calculateMilliseconds();
          if (msAroundThisBeat < msAroundNextBeat) {
            return {
              msAroundPress: msAroundThisBeat,
              sprintForBeat: frameBeat.value.beat,
            };
          } else {
            return {
              msAroundPress: msAroundNextBeat,
              sprintForBeat: nextBeat(frameBeat.value.beat),
            };
          }
        })();

        if (isDownBeat(sprintForBeat)) {
          if (
            msAroundPress <= 90 &&
            this._sprintedOnBeat !== sprintForBeat &&
            this._missedSprintOnBeat === null
          ) {
            this._sprintedOnBeat = sprintForBeat;
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
          }
        } else if (this._missedSprintOnBeat === null) {
          this._missedSprintOnBeat = sprintForBeat;
          Object.values(this.graphics.graphics).forEach((g) => {
            g.tint = Color.Red;
            g.opacity = 0.7;
          });
          this.scene?.camera.shake(5, 5, 200);
        }
      }

      if (
        engine.input.gamepads.at(0)?.wasButtonPressed(Buttons.LeftTrigger) ||
        engine.input.keyboard.wasPressed(Keys.K)
      ) {
        for (const [beat, flourish] of globalstate.flourishes) {
          const msAroundFlourish = msDistanceFromBeat(
            frameBeat,
            beat
          ).calculateMilliseconds();
          if (msAroundFlourish <= 90) {
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
      }
      const playerAim = this.get(PlayerAimComponent);
      if (playerAim) {
        switch (frameBeat.tag) {
          case "beatStartFrame": {
            for (const [beat, beatAction] of globalstate.beatActions) {
              if (beat === frameBeat.value.beat) {
                const direction = (this._currentAim ?? vec(0, 0))
                  .sub(this.pos)
                  .normalize();
                switch (beatAction.tag) {
                  case "cone": {
                    const coneActor = new Cone(
                      beatAction.value,
                      this.vel.normalize()
                    );
                    this.addChild(coneActor);
                    engine.clock.schedule(() => {
                      coneActor.kill();
                      this.removeChild(coneActor);
                    }, frameBeat.value.msPerBeat.calculateMilliseconds() * 2);
                    break;
                  }
                  case "beam": {
                    const beamActor = new Beam(beatAction.value, direction);
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
                      frameBeat.value.msPerBeat,
                      direction
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
    }
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
