import { Entity, Engine } from "excalibur";
import { MetronomeComponent } from "./metronome";
import { BeatAction, globalstate } from "./globalstate";

export class UI extends Entity {
  private _healthBar: HTMLElement;
  private _scoreElement: HTMLElement;
  constructor() {
    super();
    this.addComponent(new MetronomeComponent());

    (document.getElementById("health-bar") as HTMLElement).style.display =
      "block";

    this._healthBar = document.getElementById(
      "health-bar-inner"
    ) as HTMLElement;

    this._scoreElement = document.getElementById("score-value") as HTMLElement;
    this._scoreElement.textContent = globalstate.score.toString();
  }

  private _updateUI(): void {
    const scoreEl = this._scoreElement.parentElement;
    if (scoreEl) {
      scoreEl.style.display = "flex";
    }
    const filledHearts = "❤️".repeat(Math.max(0, globalstate.playerHealth));
    const emptyHearts = "🖤".repeat(
      Math.min(
        globalstate.maxHealth,
        globalstate.maxHealth - globalstate.playerHealth
      )
    );
    this._healthBar.innerHTML = filledHearts + emptyHearts;
    this._scoreElement.textContent = globalstate.score.toString();
  }
  override onAdd(_engine: Engine): void {
    this._updateUI();
  }
  override onPreUpdate(_engine: Engine, _elapsed: number): void {
    this._updateUI();
  }
}
