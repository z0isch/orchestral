import { Entity, Engine } from "excalibur";
import { MetronomeComponent } from "./metronome";
import { BeatAction, globalstate } from "./globalstate";

export class UI extends Entity {
  private _uiElements: HTMLElement[] = [];
  private _selectElements: HTMLSelectElement[] = [];
  private _healthBar: HTMLElement;
  constructor() {
    super();
    this.addComponent(new MetronomeComponent());
    this._uiElements = [
      document.getElementById("one") as HTMLElement,
      document.getElementById("two") as HTMLElement,
      document.getElementById("three") as HTMLElement,
      document.getElementById("four") as HTMLElement,
    ];

    this._selectElements = [
      document.getElementById("move-select1") as HTMLSelectElement,
      document.getElementById("move-select2") as HTMLSelectElement,
      document.getElementById("move-select3") as HTMLSelectElement,
      document.getElementById("move-select4") as HTMLSelectElement,
    ];

    this._selectElements[0].value = globalstate.beataction1;
    this._selectElements[1].value = globalstate.beataction2;
    this._selectElements[2].value = globalstate.beataction3;
    this._selectElements[3].value = globalstate.beataction4;

    this._healthBar = document.getElementById(
      "health-bar-inner"
    ) as HTMLElement;
    this._healthBar.innerHTML = "❤️".repeat(globalstate.playerHealth);
  }
  override onAdd(_engine: Engine): void {}
  override onPreUpdate(_engine: Engine, _elapsed: number): void {
    const frameBeat = this.get(MetronomeComponent).frameBeat;
    if (frameBeat !== null) {
      switch (frameBeat.tag) {
        case "beatStartFrame": {
          this._uiElements[0].setAttribute("style", `opacity: .1`);
          this._uiElements[1].setAttribute("style", `opacity: .1`);
          this._uiElements[2].setAttribute("style", `opacity: .1`);
          this._uiElements[3].setAttribute("style", `opacity: .1`);
          switch (frameBeat.value.beat) {
            case "1": {
              this._uiElements[0].setAttribute("style", `opacity: .5`);
              break;
            }
            case "2": {
              this._uiElements[1].setAttribute("style", `opacity: .5`);
              break;
            }
            case "3": {
              this._uiElements[2].setAttribute("style", `opacity: .5`);
              break;
            }
            case "4": {
              this._uiElements[3].setAttribute("style", `opacity: .5`);
              break;
            }
            default: {
              frameBeat.value.beat satisfies never;
            }
          }
        }
        case "duringBeat": {
          break;
        }
        default: {
          frameBeat satisfies never;
        }
      }
    }

    globalstate.beataction1 = this._selectElements[0].value as BeatAction;
    globalstate.beataction2 = this._selectElements[1].value as BeatAction;
    globalstate.beataction3 = this._selectElements[2].value as BeatAction;
    globalstate.beataction4 = this._selectElements[3].value as BeatAction;
  }
  override onPostUpdate(_engine: Engine, _elapsed: number): void {
    this._healthBar.innerHTML = "❤️".repeat(globalstate.playerHealth);
  }
}
