import { Entity, Engine } from "excalibur";
import { MetronomeComponent } from "./metronome";
import { BeatAction, globalstate } from "./globalstate";

export class UI extends Entity {
  private _uiElements: HTMLElement[] = [];
  private _selectElements: HTMLSelectElement[] = [];
  private _healthBar: HTMLElement;
  private _scoreElement: HTMLElement;
  private _consonanceProgressFill: HTMLElement;
  private _consonanceProgressLabel: HTMLElement;
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

    this._scoreElement = document.getElementById("score-value") as HTMLElement;
    this._scoreElement.textContent = globalstate.score.toString();

    this._consonanceProgressFill = document.getElementById(
      "consonance-progress-fill"
    ) as HTMLElement;

    this._consonanceProgressLabel = document.getElementById(
      "consonance-progress-label"
    ) as HTMLElement;
  }
  private _updateUI(): void {
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
    const filledHearts = "❤️".repeat(Math.max(0, globalstate.playerHealth));
    const emptyHearts = "🖤".repeat(
      Math.min(
        globalstate.maxHealth,
        globalstate.maxHealth - globalstate.playerHealth
      )
    );
    this._healthBar.innerHTML = filledHearts + emptyHearts;
    this._scoreElement.textContent = globalstate.score.toString();

    const scoreDifference =
      globalstate.consonanceScore - globalstate.dissonanceScore;

    let progressPercent = ((scoreDifference + 3) / 6) * 100;
    progressPercent = Math.max(0, Math.min(100, progressPercent));
    this._consonanceProgressFill.style.width = `100%`;
    this._consonanceProgressFill.style.background = `linear-gradient(90deg, #ff4444 0%, #ff4444 ${progressPercent}%, #4444ff ${progressPercent}%, #4444ff 100%)`;

    // Update the label with the current difference value
    this._consonanceProgressLabel.textContent =
      Math.abs(scoreDifference).toString();

    // Update label color based on the difference value
    if (scoreDifference > 0) {
      this._consonanceProgressLabel.style.color = "#ff4444"; // Red for positive (consonance winning)
    } else if (scoreDifference < 0) {
      this._consonanceProgressLabel.style.color = "#4444ff"; // Blue for negative (dissonance winning)
    } else {
      this._consonanceProgressLabel.style.color = "white"; // White for zero (balanced)
    }
  }
  override onAdd(_engine: Engine): void {
    this._updateUI();
  }
  override onPreUpdate(_engine: Engine, _elapsed: number): void {
    this._updateUI();
  }
}
