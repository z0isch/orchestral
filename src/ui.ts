import { Entity, Engine } from "excalibur";
import { MetronomeComponent } from "./metronome";

export class UI extends Entity {
  private _activeEl: number | null = null;
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
    this._uiElements[0]?.setHTMLUnsafe("FORWARD");
    this._uiElements[1]?.setHTMLUnsafe("FORWARD");
    this._uiElements[2]?.setHTMLUnsafe("BACKWARD");
    this._uiElements[3]?.setHTMLUnsafe("FORWARD");
  }
  override onPreUpdate(_engine: Engine, _elapsed: number): void {
    if (this.get(MetronomeComponent).frameBeat !== null) {
      if (this._activeEl === null) {
        this._activeEl = 0;
        this._uiElements?.[this._activeEl]?.setAttribute("style", `opacity: 1`);
      } else {
        this._uiElements?.[this._activeEl]?.setAttribute(
          "style",
          `opacity: .1`
        );
        this._activeEl = (this._activeEl + 1) % 4;
        this._uiElements?.[this._activeEl]?.setAttribute(
          "style",
          `opacity: .5`
        );
      }
    }
  }
}
