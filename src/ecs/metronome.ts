export class Metronome {
  private _beatInterval: number
  private _subInterval: number
  private startTime = -1
  private _lastBeat = -1
  private _lastSub = -1
  private _isOnBeat = false
  private _isOnSub = false
  private _beatPhase = 0
  private _subBeat = 0
  private _subPhase = 0

  readonly subdivisions: number

  constructor(bpm: number, subdivisions = 4) {
    this._beatInterval = 60 / bpm
    this.subdivisions = subdivisions
    this._subInterval = this._beatInterval / subdivisions
  }

  start(audioTime: number): void {
    this.startTime = audioTime
    this._lastBeat = -1
    this._lastSub = -1
    this._isOnBeat = false
    this._isOnSub = false
    this._beatPhase = 0
    this._subBeat = 0
    this._subPhase = 0
  }

  sync(audioTime: number): void {
    if (this.startTime < 0) return
    const elapsed = audioTime - this.startTime

    const currentBeat = Math.floor(elapsed / this._beatInterval)
    this._isOnBeat = currentBeat > this._lastBeat
    this._lastBeat = currentBeat
    this._beatPhase = (elapsed % this._beatInterval) / this._beatInterval

    const currentSub = Math.floor(elapsed / this._subInterval)
    this._isOnSub = currentSub > this._lastSub
    this._lastSub = currentSub
    this._subBeat = currentSub % this.subdivisions
    this._subPhase = (elapsed % this._subInterval) / this._subInterval
  }

  get isOnBeat(): boolean { return this._isOnBeat }
  get isOnSubBeat(): boolean { return this._isOnSub }

  get interval(): number { return this._beatInterval }
  get subInterval(): number { return this._subInterval }

  get beatPhase(): number { return this._beatPhase }
  get subBeat(): number { return this._subBeat }
  get subPhase(): number { return this._subPhase }
}
