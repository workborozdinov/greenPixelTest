import { _decorator, Component, Node } from 'cc';
const { ccclass, property, menu } = _decorator;

@ccclass('GameObject')
@menu('GameObject/GameObject')
export class GameObject extends Component {
    protected onLoad(): void {
        this._init();
        this._initBody();
        this._initRender();
    }

    public specify(info: any): void {}

    protected _init(): void {}
    protected _initBody(): void {}
    protected _initRender(): void {}
}
