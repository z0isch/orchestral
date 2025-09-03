export type BeatAction = "aoe" | "cone" | "beam" | "bomb";

export type GlobalState = {
  playerHealth: number;
  maxHealth: number;
  score: number;
  dissonanceScore: number;
  consonanceScore: number;
  beataction1: BeatAction | null;
  beataction2: BeatAction | null;
  beataction3: BeatAction | null;
  beataction4: BeatAction | null;
  beataction5: BeatAction | null;
  beataction6: BeatAction | null;
  beataction7: BeatAction | null;
  beataction8: BeatAction | null;
  beataction9: BeatAction | null;
  beataction10: BeatAction | null;
  beataction11: BeatAction | null;
  beataction12: BeatAction | null;
  beataction13: BeatAction | null;
  beataction14: BeatAction | null;
  beataction15: BeatAction | null;
  beataction16: BeatAction | null;

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
  beataction1: "beam",
  beataction2: null,
  beataction3: null,
  beataction4: null,
  beataction5: "beam",
  beataction6: null,
  beataction7: null,
  beataction8: null,
  beataction9: "bomb",
  beataction10: null,
  beataction11: null,
  beataction12: null,
  beataction13: "cone",
  beataction14: null,
  beataction15: null,
  beataction16: null,
  doCountdown: true,
  playMusic: true,
  playerInvincible: false,
};
