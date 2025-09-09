import {
  Actor,
  Text,
  Color,
  Engine,
  Entity,
  Font,
  Random,
  Scene,
  Timer,
  Vector,
  SpriteSheet,
  TileMap,
  CoordPlane,
} from "excalibur";
import { Resources } from "./resources";
import { MetronomeComponent, MetronomeSystem } from "./metronome";
import { Player } from "./player";
import { UI } from "./ui";
import { globalstate } from "./globalstate";
import { Skunk } from "./skunk";
import { NoteHighway } from "./note-highway";
import { Raccoon } from "./raccoon";
import { FreezableSystem } from "./freezable";
import { OnBeatStartSystem } from "./onBeatStart";

const BPM = 85;
const TRACK = Resources.song85bpm;

export class MyLevel extends Scene {
  override onInitialize(engine: Engine): void {
    const rand = new Random();
    const kenneyTinyTownSpriteSheet = SpriteSheet.fromImageSource({
      image: Resources.kenneyTinyTown,
      grid: {
        rows: 11,
        columns: 12,
        spriteHeight: 16,
        spriteWidth: 16,
      },
      spacing: {
        margin: {
          x: 1,
          y: 1,
        },
      },
    });
    const tilemap = new TileMap({
      rows: 100,
      columns: 100,
      tileWidth: 15,
      tileHeight: 15,
    });
    for (let tile of tilemap.tiles) {
      const tileIndex =
        rand.floating(0, 1) < 0.95 ? 0 : rand.floating(0, 1) < 0.9 ? 1 : 2;
      const sprite = kenneyTinyTownSpriteSheet.getSprite(tileIndex, 0);
      if (sprite) {
        tile.addGraphic(sprite);
      }
    }

    this.add(tilemap);

    const metronomeSystem = new MetronomeSystem(this.world, engine, BPM);
    this.world.add(metronomeSystem);
    this.world.add(new OnBeatStartSystem(this.world));
    this.world.add(new FreezableSystem(this.world));

    const player = new Player();
    this.add(player);

    this.camera.strategy.radiusAroundActor(player, 80);
    this.camera.zoom = 2;

    const ui = new UI();
    this.add(ui);

    const noteHighway = new NoteHighway(BPM);
    this.add(noteHighway);

    const clicktrack = new Entity({});
    let isPlaying = false;
    clicktrack.addComponent(new MetronomeComponent());
    clicktrack.onPreUpdate = () => {
      const frameBeat = clicktrack.get(MetronomeComponent).frameBeat;
      const isOnFirstBeat =
        frameBeat?.tag === "beatStartFrame" && frameBeat.value.beat === 1;
      if (isOnFirstBeat && !isPlaying && globalstate.playMusic) {
        TRACK.play();
        isPlaying = true;
      }
    };
    this.add(clicktrack);
    const skunkTimer = new Timer({
      fcn: () => {
        this.world.add(new Skunk(player, 15, 40));
      },
      repeats: true,
      interval: 700,
    });
    this.add(skunkTimer);
    const raccoonTimer = new Timer({
      fcn: () => {
        this.world.add(new Raccoon(player));
      },
      repeats: true,
      interval: 5000,
    });
    this.add(raccoonTimer);
    const startGame = () => {
      metronomeSystem.trigger();
      skunkTimer.start();
      raccoonTimer.start();
    };
    if (globalstate.doCountdown) {
      const countdown = new Actor({
        coordPlane: CoordPlane.Screen,
        pos: new Vector(
          engine.screen.resolution.width / 2,
          engine.screen.resolution.height / 2
        ),
      });
      countdown.onInitialize = () => {
        let text = new Text({
          text: "3",
          font: new Font({ size: 100 }),
          color: Color.White,
        });
        countdown.graphics.add("countdown", text);
        Resources.TickStartSound.play();
        engine.clock.schedule(() => {
          text.text = "2";
          Resources.TickStartSound.play();
        }, 1000);
        engine.clock.schedule(() => {
          text.text = "1";
          Resources.TickStartSound.play();
        }, 2000);
        engine.clock.schedule(() => {
          text.text = "GO!";
          Resources.GoSound.play();
          startGame();
        }, 3000);
        engine.clock.schedule(() => {
          countdown.graphics.remove("countdown");
        }, 3333);
        countdown.graphics.use("countdown");
      };
      this.add(countdown);
    } else {
      startGame();
    }
  }
}
