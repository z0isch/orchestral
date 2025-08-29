
export type BeatAction = "forward" | "backward"
export type GlobalState = {
    beataction1: BeatAction,
    beataction2: BeatAction,
    beataction3: BeatAction,
    beataction4: BeatAction 
};

export let globalstate: GlobalState = {
    beataction1: "forward",
    beataction2: "forward",
    beataction3: "forward",
    beataction4: "forward" 
};