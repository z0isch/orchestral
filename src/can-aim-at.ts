import { Component, System, SystemPriority, SystemType } from "excalibur";

export class CanAimAtComponent extends Component {}

export class CanAimAtSystem extends System {
  public systemType = SystemType.Update;
  public priority = SystemPriority.Average;
  constructor() {
    super();
  }
  update(): void {}
}
