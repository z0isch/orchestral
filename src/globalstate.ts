export type BeatAction = "forward" | "forward-aoe" | "moveToMouse" | "backward";
export type GlobalState = {
  playerHealth: number;
  score: number;
  beataction1: BeatAction;
  beataction2: BeatAction;
  beataction3: BeatAction;
  beataction4: BeatAction;
};

export let globalstate: GlobalState = {
  playerHealth: 3,
  score: 0,
  beataction1: "moveToMouse",
  beataction2: "forward-aoe",
  beataction3: "backward",
  beataction4: "forward-aoe",
};
