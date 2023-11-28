import { _decorator, AudioSource, Component, log, Node, AudioClip, assetManager, director } from 'cc';

const { ccclass, requireComponent } = _decorator;

@ccclass('AudioManager')
@requireComponent(AudioSource)
export class AudioManager extends Component {
    public static instance: AudioManager = null;

    private _audioSource: AudioSource = null;
    private _soundsBundle: any = null;

    protected onLoad(): void {
        this._init();
    }

    public play(audioName: string, volume: number = 1, isLoop: boolean = false): void {
        const audioClip: AudioClip = this._soundsBundle.get(audioName, AudioClip);

        if (!!audioClip) {
            this._audioSource.clip = audioClip;
            this._audioSource.loop = isLoop;
            this._audioSource.volume = volume;
            this._audioSource.play();
        }
    }

    private _init(): void {
        AudioManager.instance = this;

        this._audioSource = this.getComponent(AudioSource);
        this._soundsBundle = assetManager.getBundle('sound');
    }
}
