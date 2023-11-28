import { _decorator, Component, Node, log, Vec3, isValid } from 'cc';
import { GameObject } from '../Managers/GameObject/GameObject';
import { GameObjectManager } from '../Managers/GameObject/GameObjectManager';

const { ccclass } = _decorator;

@ccclass('World')
export class World extends Component {
    set levelData(value: any[]) {
        this._levelData = value;

        this._loadLevel();
    }

    private _levelData: any[] = [];

    private _holder: Node = null;

    private async _loadLevel(): Promise<void> {
        this._holder = await this._createHolder();

        if (!!this._holder) {
            this._toggleHolder(false);

            const promises: Promise<boolean>[] = this._levelData.map((objectData) => {
                const prefabName: string = objectData.prefabName;
                const position: Vec3 = new Vec3(objectData.position.x, objectData.position.y, objectData.position.z);
                const info: Object = objectData.info || {};

                return this._createGameObject(prefabName, position, info);
            });

            Promise.all(promises).then(() => {
                this._toggleHolder(true);

                log(`Level load`);
            });
        }
    }

    private _createHolder(): Promise<Node> {
        const holder = new Node('Holder');

        holder.setParent(this.node);

        return new Promise<Node | null>((resolve, reject) => {
            resolve(holder), reject(null);
        });
    }

    private _toggleHolder(isActive: boolean): void {
        if (isValid(this._holder) && this._holder.active !== isActive) this._holder.active = isActive;
    }

    private _createGameObject(prefabName: string, position: Vec3, info: Object): Promise<boolean> {
        if (!isValid(this._holder)) return;

        GameObjectManager.instance.createGameObject(
            prefabName,
            (gameObject: GameObject, gameObjectNode: Node) => {
                gameObjectNode.setPosition(position);
                gameObjectNode.setParent(this._holder);
            },
            (gameObject: GameObject, gameObjectNode: Node) => {
                gameObject.specify(info);

                return new Promise<boolean>((resolve) => {
                    resolve(true);
                });
            }
        );
    }
}
