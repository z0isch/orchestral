import { Actor, Color, Engine, GraphicsGroup, Line, vec } from "excalibur";
import { Resources } from "./resources";
import { MetronomeComponent } from "./metronome";

export class Player extends Actor {
  constructor() {
    super({
      name: "Player",
      x: 100,
      y: 100,
    });
  }

  override onInitialize() {
    this.addComponent(new MetronomeComponent());
  }

  override onPreUpdate(engine: Engine, elapsedMs: number): void {
    const mousePos =
      engine.input.pointers.currentFramePointerCoords.get(0)?.worldPos;
    let lineEnd = mousePos?.sub(this.pos).add(vec(31, 31));
    const frameBeat = this.get(MetronomeComponent).frameBeat;
    if (frameBeat !== null && mousePos) {
      const direction = mousePos.sub(this.pos);
      const distance = direction.distance();
      const maxDistance = Math.min(distance, 100);
      let offset = direction.normalize().scale(maxDistance);
      if (frameBeat % 4 === 2) {
        offset = offset.scale(-1);
      }
      lineEnd = offset.add(vec(31, 31));
      this.actions.moveBy({
        offset: offset,
        duration: 0,
      });
    }

    if (lineEnd) {
      const line = new Line({
        start: vec(31, 31),
        end: lineEnd,
        color: Color.White,
        thickness: 4,
      });
      line.opacity = 0.1;
      this.graphics.use(
        new GraphicsGroup({
          useAnchor: false,
          members: [
            {
              graphic: Resources.Sword.toSprite(),
              offset: vec(-31, -31),
            },
            line,
          ],
        })
      );
    }
  }
}
