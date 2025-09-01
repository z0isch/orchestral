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
};

export let globalstate: GlobalState = {
  playerHealth: 3,
  maxHealth: 3,
  score: 0,
  dissonanceScore: 0,
  consonanceScore: 0,
  beataction1: "forward",
  beataction2: "forward-cone",
  beataction3: "forward-aoe",
  beataction4: "forward-beam",
};
