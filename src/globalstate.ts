export type BeatAction =
  | "forward"
  | "forward-aoe"
  | "moveToMouse"
  | "backward"
  | "forward-cone"
  | "forward-beam"
  | "bomb";

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
  playerHealth: 3,
  maxHealth: 3,
  score: 0,
  dissonanceScore: 0,
  consonanceScore: 0,
  beataction1: "forward-beam",
  beataction2: "bomb",
  beataction3: "forward-cone",
  beataction4: "forward-aoe",
  doCountdown: true,
  playMusic: true,
};
