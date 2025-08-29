export type BeatAction = "forward" | "backward";
export type GlobalState = {
  playerHealth: number;
  beataction1: BeatAction;
  beataction2: BeatAction;
  beataction3: BeatAction;
  beataction4: BeatAction;
};

export let globalstate: GlobalState = {
  playerHealth: 3,
  beataction1: "forward",
  beataction2: "forward",
  beataction3: "backward",
  beataction4: "forward",
};
