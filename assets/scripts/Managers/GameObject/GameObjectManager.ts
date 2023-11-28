import { _decorator, Component, Node, Enum, Prefab, instantiate, assetManager } from 'cc';
import { GameObject } from './GameObject';
const { ccclass } = _decorator;

@ccclass('GameObjectManager')
export class GameObjectManager extends Component {
    public static instance: GameObjectManager = null;

    private _prefabBundle = null;

    protected onLoad(): void {
        this._init();
    }

    public createGameObject(prefabName: string, preAction: Function, callback: Function) {
        const prefab = this._prefabBundle.get(prefabName);

        if (!!prefab) {
            const gameObjectNode: Node = instantiate(prefab);
            const gameObject: GameObject = gameObjectNode.getComponent(GameObject);

            preAction(gameObject, gameObjectNode);
            callback(gameObject, gameObjectNode);
        }
    }

    private _init(): void {
        GameObjectManager.instance = this;

        this._prefabBundle = assetManager.getBundle('prefab');
    }
}
