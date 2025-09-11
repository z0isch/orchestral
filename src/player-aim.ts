import {
  Component,
  Vector,
  System,
  Query,
  SystemPriority,
  SystemType,
  Axes,
  vec,
  World,
} from "excalibur";

export class PlayerAimComponent extends Component {
  public lastRightStickGamepadAxes: Vector = vec(0, 0);
  constructor() {
    super();
  }
}

export class PlayerAimSystem extends System {
  public systemType = SystemType.Update;
  public priority = SystemPriority.Average;
  public query: Query<typeof PlayerAimComponent>;
  constructor(world: World) {
    super();
    this.query = world.query([PlayerAimComponent]);
  }

  override update(): void {
    for (let entity of this.query.entities) {
      const playerAim = entity.get(PlayerAimComponent);
      if (playerAim && playerAim.owner?.scene) {
        const rightStickAxes = vec(
          playerAim.owner.scene.engine.input.gamepads
            .at(0)
            ?.getAxes(Axes.RightStickX),
          playerAim.owner.scene.engine.input.gamepads
            .at(0)
            ?.getAxes(Axes.RightStickY)
        ).normalize();
        if (rightStickAxes.x !== 0 && rightStickAxes.y !== 0) {
          playerAim.lastRightStickGamepadAxes = rightStickAxes;
        }
      }
    }
  }
}
