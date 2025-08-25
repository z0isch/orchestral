import { Entity, Engine } from "excalibur";
import { MetronomeComponent } from "./metronome";

export class UI extends Entity {
  private _activeEl = 0;
  private _uiElements: (HTMLElement | null)[] = [];

  constructor() {
    super();
    this.addComponent(new MetronomeComponent());
  }
  override onAdd(_engine: Engine): void {
    this._uiElements = [
      document.getElementById("one"),
      document.getElementById("two"),
      document.getElementById("three"),
      document.getElementById("four"),
    ];
    this._uiElements?.[this._activeEl]?.setAttribute("style", `opacity: 1`);
  }
  override onPreUpdate(_engine: Engine, _elapsed: number): void {
    if (this.get(MetronomeComponent).frameIsOnBeat) {
      this._uiElements?.[this._activeEl]?.setAttribute("style", `opacity: .1`);
      this._activeEl = (this._activeEl + 1) % 4;
      this._uiElements?.[this._activeEl]?.setAttribute("style", `opacity: 1`);
    }
  }
}
