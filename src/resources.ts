import {
  DefaultLoader,
  DefaultLoaderOptions,
  Engine,
  ImageSource,
  Sound,
} from "excalibur";

// It is convenient to put your resources in one place
export const Resources = {
  TickStartSound: new Sound("./sounds/Buttons and Navigation/Button 5.m4a"),
  GoSound: new Sound("./sounds/Complete and Success/Complete 1.m4a"),
  MaestroSpritesheetDR: new ImageSource("./images/maestro-spritesheet-dr.png"),
  MaestroSpritesheetUL: new ImageSource("./images/maestro-spritesheet-ul.png"),
  SkunkSpritesheetDR: new ImageSource("./images/skunk-spritesheet-dr.png"),
  clicktrack90bpm: new Sound("./sounds/clicktrack-90bpm.mp3"),
  clicktrack101bpm: new Sound("./sounds/clicktrack-101bpm.mp3"),
  clicktrack120bpm: new Sound("./sounds/clicktrack-120bpm.mp3"),
  song101bpm: new Sound("./sounds/song-101bpm.mp3"),
  kenneyTinyTown: new ImageSource(
    "./images/kenney_tiny-town/Tilemap/tilemap.png"
  ),
} as const; // the 'as const' is a neat typescript trick to get strong typing on your resources.
// So when you type Resources.Sword -> ImageSource

// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader

class Loader extends DefaultLoader {
  private _resolveUserAction: (() => void) | null = null;
  private _waitingClick = false;
  constructor(settings: DefaultLoaderOptions) {
    super(settings);
  }
  override onDraw(ctx: CanvasRenderingContext2D): void {
    if (!this.isLoaded()) {
      super.onDraw(ctx);
    } else if (!this._waitingClick) {
      const playButton = document.getElementById(
        "play-button"
      ) as HTMLButtonElement;
      playButton.style.display = "block";
      playButton.onclick = () => {
        playButton.style.display = "none";
        (document.getElementById("title") as HTMLDivElement).style.display =
          "none";
        if (this._resolveUserAction) {
          this._resolveUserAction();
          this._resolveUserAction = null;
        }
      };
      this._waitingClick = true;
    }
  }

  override onUserAction(): Promise<void> {
    return new Promise((resolve) => {
      this._resolveUserAction = resolve;
    });
  }

  override onInitialize(engine: Engine): void {
    (document.getElementById("title") as HTMLDivElement).style.display =
      "block";
    super.onInitialize(engine);
  }
}

export const loader = new Loader({ loadables: Object.values(Resources) });
