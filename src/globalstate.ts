export type BeatAction =
  | "forward"
  | "forward-aoe"
  | "moveToMouse"
  | "backward"
  | "forward-cone"
  | "forward-beam";

export type GlobalState = {
  playerHealth: number;
  maxHealth: number;
  score: number;
  dissonanceScore: number;
  consonanceScore: number;
  beataction1: BeatAction;
  beataction2: BeatAction;
  beataction3: BeatAction;
  beataction4: BeatAction;
  doCountdown: boolean;
  playMusic: boolean;
};

export let globalstate: GlobalState = {
  playerHealth: 100,
  maxHealth: 100,
  score: 0,
  dissonanceScore: 0,
  consonanceScore: 0,
  beataction1: "forward",
  beataction2: "forward-aoe",
  beataction3: "forward-beam",
  beataction4: "forward-cone",
  doCountdown: false,
  playMusic: true,
};
