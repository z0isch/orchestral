import {
  Component,
  System,
  SystemType,
  SystemPriority,
  Query,
  BodyComponent,
  GraphicsComponent,
  ActionsComponent,
  World,
  Color,
  CollisionType,
} from "excalibur";
import { MetronomeComponent } from "./metronome";

type FrozenState =
  | { tag: "waitingToBeFrozen" }
  | { tag: "frozen"; value: { frozenForBeats: number } }
  | { tag: "unFrozen" };

export class FreezableComponent extends Component {
  public frozenState: FrozenState = { tag: "unFrozen" };
  constructor() {
    super();
  }

  public freeze(): void {
    this.frozenState = { tag: "waitingToBeFrozen" };
  }
}

export class FreezableSystem extends System {
  public systemType = SystemType.Update;
  public priority = SystemPriority.Average;
  public query: Query<
    | typeof FreezableComponent
    | typeof BodyComponent
    | typeof GraphicsComponent
    | typeof MetronomeComponent
    | typeof ActionsComponent
  >;

  constructor(world: World) {
    super();
    this.query = world.query([
      FreezableComponent,
      BodyComponent,
      GraphicsComponent,
      MetronomeComponent,
      ActionsComponent,
    ]);
  }

  update(_elapsed: number): void {
    for (let entity of this.query.entities) {
      const freezable = entity.get(FreezableComponent);
      const body = entity.get(BodyComponent);
      const graphics = entity.get(GraphicsComponent);
      const actions = entity.get(ActionsComponent);
      const metronome = entity.get(MetronomeComponent);

      if (freezable.frozenState.tag === "waitingToBeFrozen") {
        if (graphics.current) {
          graphics.current.tint = Color.Azure;
          graphics.current.opacity = 0.8;
        }
        body.collisionType = CollisionType.Passive;
        actions.clearActions();
        freezable.frozenState = {
          tag: "frozen",
          value: { frozenForBeats: 0 },
        };
      }

      if (
        metronome.frameBeat?.tag === "beatStartFrame" &&
        freezable.frozenState.tag === "frozen"
      ) {
        freezable.frozenState.value.frozenForBeats++;
        if (freezable.frozenState.value.frozenForBeats >= 9) {
          if (graphics.current) {
            graphics.current.tint = Color.White;
            graphics.current.opacity = 1;
          }
          body.collisionType = CollisionType.Active;
          freezable.frozenState = { tag: "unFrozen" };
        }
      }
    }
  }
}
