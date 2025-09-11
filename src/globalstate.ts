import { Resource } from "excalibur";
import { BeamSettings } from "./beat-action/beam";
import { BombSettings } from "./beat-action/bomb";
import { ConeSettings } from "./beat-action/cone";
import { Beat } from "./metronome";
import { FreezeSettings } from "./flourish/freeze";

export type Flourish = {
  tag: "freeze";
  value: FreezeSettings;
};

export type BeatAction =
  | { tag: "cone"; value: ConeSettings }
  | { tag: "beam"; value: BeamSettings }
  | { tag: "bomb"; value: BombSettings };

export type GlobalState = {
  playerHealth: number;
  maxHealth: number;
  score: number;
  dissonanceScore: number;
  consonanceScore: number;
  beatActions: Map<Beat, BeatAction>;
  flourishes: Map<Beat, Flourish>;

  //Debug settings
  doCountdown: boolean;
  playMusic: boolean;
  playerInvincible: boolean;
};

export async function loadConfig() {
  const config = new Resource("./config.json", "json", true) as Resource<any>;
  await config.load();
  config.data.beatActions = config.data.beatActions = new Map(
    config.data.beatActions
  );
  config.data.flourishes = new Map(config.data.flourishes);
  globalstate = { ...globalstate, ...config.data };
}

export let globalstate: GlobalState = {
  playerHealth: 5,
  maxHealth: 5,
  score: 0,
  dissonanceScore: 0,
  consonanceScore: 0,
  //Loaded dynamically from config.json
  beatActions: new Map(),
  flourishes: new Map(),
  doCountdown: true,
  playMusic: true,
  playerInvincible: false,
};
