import { DefaultLoader, ImageSource, Sound } from "excalibur";

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

//We need to wait for the user to click the play button audio
let resolveUserAction: (() => void) | null = null;

export const loader = new DefaultLoader();
loader.onBeforeLoad = async () => {
  const title = document.getElementById("title") as HTMLDivElement;
  title.style.display = "block";
  const playButton = document.getElementById(
    "play-button"
  ) as HTMLButtonElement;
  playButton.style.display = "block";
  playButton.onclick = () => {
    playButton.style.display = "none";
    title.style.display = "none";
    if (resolveUserAction) {
      resolveUserAction();
      resolveUserAction = null;
    }
  };
};
loader.onUserAction = async () => {
  return new Promise((resolve) => {
    resolveUserAction = resolve;
  });
};

for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
