import { _decorator, AudioSource, Component, log, Node, AudioClip, assetManager, director, SpriteFrame } from 'cc';

const { ccclass, requireComponent } = _decorator;

@ccclass('ImageManager')
@requireComponent(ImageManager)
export class ImageManager extends Component {
    public static instance: ImageManager = null;

    private _imagesBundle = null;
    protected onLoad(): void {
        this._init();
    }

    public getSpriteFrame(nameSpriteFrame: string): SpriteFrame {
        const spriteFrame: SpriteFrame = this._imagesBundle.get(nameSpriteFrame);

        return !!spriteFrame ? spriteFrame : null;
    }

    private _init(): void {
        ImageManager.instance = this;

        this._imagesBundle = assetManager.getBundle('image');
    }
}
