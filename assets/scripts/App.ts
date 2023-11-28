import { _decorator, Component, assetManager, log, Node } from 'cc';

const { ccclass, property, disallowMultiple, executionOrder } = _decorator;

@ccclass('App')
@disallowMultiple()
@executionOrder(-10000)
export class App extends Component {
    @property({ type: Node })
    public holder: Node = null;

    private _bundlesNamesList: string[] = ['sound', 'image', 'level', 'prefab'];

    protected async start() {
        await this._loadAssetBundle();

        this._startGame();
    }

    private async _loadAssetBundle(): Promise<void> {
        for (const bundleName of this._bundlesNamesList) {
            await this._loadBundle(bundleName);
        }

        return Promise.resolve();
    }

    private _loadBundle(bundleName: string): Promise<Object | Error> {
        return new Promise<Object | Error>((resolve, reject) => {
            assetManager.loadBundle(bundleName, (err, bundle) => {
                if (err) {
                    return reject(err);
                }

                bundle.loadDir('', (err, assets) => {
                    if (err) {
                        return reject(err);
                    }
                    log(`Loading bundle ${bundleName}`);
                    resolve(bundle);
                });
            });
        });
    }

    private _startGame() {
        this.holder.active = true;
    }
}
