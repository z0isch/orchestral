import { BeamSettings } from "./beat-action/beam";
import { BombSettings } from "./beat-action/bomb";
import { ConeSettings } from "./beat-action/cone";
import { Beat } from "./metronome";

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

  //Debug settings
  doCountdown: boolean;
  playMusic: boolean;
  playerInvincible: boolean;
};

export let globalstate: GlobalState = {
  playerHealth: 10,
  maxHealth: 10,
  score: 0,
  dissonanceScore: 0,
  consonanceScore: 0,
  beatActions: new Map([
    [1, { tag: "beam", value: { width: 3, angle: 0 } }],
    [5, { tag: "beam", value: { width: 3, angle: 0 } }],
    [9, { tag: "beam", value: { width: 3, angle: 0 } }],
    [13, { tag: "beam", value: { width: 3, angle: 0 } }],
  ]),
  doCountdown: true,
  playMusic: true,
  playerInvincible: false,
};
