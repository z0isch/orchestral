export type BeatAction =
  | "forward"
  | "forward-aoe"
  | "moveToMouse"
  | "backward"
  | "forward-cone";
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
  beataction2: "forward-aoe",
  beataction3: "forward",
  beataction4: "forward-cone",
};
