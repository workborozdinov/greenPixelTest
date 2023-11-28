import { _decorator, Component, assetManager, JsonAsset } from 'cc';
import { World } from '../World/World';

const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager extends Component {
    @property({
        type: World,
    })
    public world: World = null;

    public static instance: LevelManager = null;

    private _levelsBundle = null;

    protected onLoad(): void {
        this._init();
    }

    private _init() {
        LevelManager.instance = this;

        this._levelsBundle = assetManager.getBundle('level');

        const levelData = this._levelsBundle.get('level1', JsonAsset);
        levelData && (this.world.levelData = levelData.json);
    }
}
