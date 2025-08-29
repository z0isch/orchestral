import { Entity, Engine } from "excalibur";
import { MetronomeComponent } from "./metronome";
import { BeatAction, globalstate } from "./globalstate";

export class UI extends Entity {
  private _activeEl: number | null = null;
  private _uiElements: (HTMLElement | null)[] = [];

  constructor() {
    super();
    this.addComponent(new MetronomeComponent());

    const select1 = document.getElementById(
      "move-select1"
    ) as HTMLSelectElement;
    select1.value = globalstate.beataction1;
    const select2 = document.getElementById(
      "move-select2"
    ) as HTMLSelectElement;
    select2.value = globalstate.beataction2;
    const select3 = document.getElementById(
      "move-select3"
    ) as HTMLSelectElement;
    select3.value = globalstate.beataction3;
    const select4 = document.getElementById(
      "move-select4"
    ) as HTMLSelectElement;
    select4.value = globalstate.beataction4;
  }
  override onAdd(_engine: Engine): void {
    this._uiElements = [
      document.getElementById("one"),
      document.getElementById("two"),
      document.getElementById("three"),
      document.getElementById("four"),
    ];
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

    globalstate.beataction1 = (
      document.getElementById("move-select1") as HTMLSelectElement
    ).value as BeatAction;
    globalstate.beataction2 = (
      document.getElementById("move-select2") as HTMLSelectElement
    ).value as BeatAction;
    globalstate.beataction3 = (
      document.getElementById("move-select3") as HTMLSelectElement
    ).value as BeatAction;
    globalstate.beataction4 = (
      document.getElementById("move-select4") as HTMLSelectElement
    ).value as BeatAction;
  }
}
