export class Metronome {
  private beatInterval: number
  private startTime = -1
  private _lastBeat = -1
  private _isOnBeat = false
  private _beatPhase = 0

  constructor(bpm: number) {
    this.beatInterval = 60 / bpm
  }

  start(audioTime: number): void {
    this.startTime = audioTime
    this._lastBeat = -1
    this._isOnBeat = false
    this._beatPhase = 0
  }

  sync(audioTime: number): void {
    if (this.startTime < 0) return
    const elapsed = audioTime - this.startTime
    const currentBeat = Math.floor(elapsed / this.beatInterval)
    this._isOnBeat = currentBeat > this._lastBeat
    this._lastBeat = currentBeat
    this._beatPhase = (elapsed % this.beatInterval) / this.beatInterval
  }

  get isOnBeat(): boolean {
    return this._isOnBeat
  }

  get interval(): number {
    return this.beatInterval
  }

  get beatPhase(): number {
    return this._beatPhase
  }
}
