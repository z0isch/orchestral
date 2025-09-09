import {
  Component,
  System,
  SystemType,
  SystemPriority,
  Query,
  World,
} from "excalibur";
import { FreezableComponent } from "./freezable";
import { FrameBeat, MetronomeComponent } from "./metronome";

export class OnBeatStartComponent extends Component {
  onBeatStartAction: (beat: FrameBeat) => void;
  constructor(onBeatStartAction: (beat: FrameBeat) => void) {
    super();
    this.onBeatStartAction = onBeatStartAction;
  }
}

export class OnBeatStartSystem extends System {
  public systemType = SystemType.Update;
  public priority = SystemPriority.Highest;
  public query: Query<typeof OnBeatStartComponent | typeof MetronomeComponent>;

  constructor(world: World) {
    super();
    this.query = world.query([OnBeatStartComponent, MetronomeComponent]);
  }
  update(_elapsed: number): void {
    for (let entity of this.query.entities) {
      const onBeatStart = entity.get(OnBeatStartComponent);
      const metronome = entity.get(MetronomeComponent);
      const freezable = entity.get(FreezableComponent);
      switch (metronome.frameBeat?.tag) {
        case "beatStartFrame": {
          const currentlyUnFrozen = freezable?.frozenState.tag === "unFrozen";
          if (!freezable || currentlyUnFrozen) {
            onBeatStart.onBeatStartAction(metronome.frameBeat);
          }
          break;
        }
        case "duringBeat": {
          break;
        }
        case undefined: {
          break;
        }
        default: {
          metronome.frameBeat satisfies never;
          break;
        }
      }
    }
  }
}
