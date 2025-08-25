import { ImageSource, Loader, Sound } from "excalibur";

// It is convenient to put your resources in one place
export const Resources = {
  Sword: new ImageSource("./images/sword.png"), // Vite public/ directory serves the root images,
  ButtonSound: new Sound(
    "./sounds/Notifications and Alerts/Notification 5.m4a"
  ),
  clicktrack90bpm: new Sound("./sounds/clicktrack-90bpm.mp3"),
  clicktrack101bpm: new Sound("./sounds/clicktrack-101bpm.mp3"),
  clicktrack120bpm: new Sound("./sounds/clicktrack-120bpm.mp3"),
  song101bpm: new Sound("./sounds/song-101bpm.mp3"),
} as const; // the 'as const' is a neat typescript trick to get strong typing on your resources.
// So when you type Resources.Sword -> ImageSource

// We build a loader and add all of our resources to the boot loader
// You can build your own loader by extending DefaultLoader
export const loader = new Loader();
for (const res of Object.values(Resources)) {
  loader.addResource(res);
}
