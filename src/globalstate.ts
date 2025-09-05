import { Beat } from "./metronome";

export type BeatAction = "aoe" | "cone" | "beam" | "bomb";

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
    [1, "beam"],
    [5, "beam"],
    [9, "bomb"],
    [13, "cone"],
  ]),
  doCountdown: true,
  playMusic: true,
  playerInvincible: false,
};
