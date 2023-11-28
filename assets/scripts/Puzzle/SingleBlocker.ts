import { _decorator, Node, Collider2D, Contact2DType, IPhysics2DContact, Sprite } from 'cc';
import { GameObject } from '../Managers/GameObject/GameObject';
import { ImageManager } from '../Managers/ImageManager';
const { ccclass } = _decorator;

@ccclass('SingleBlocker')
export class SingleBlocker extends GameObject {
    get isColliderContacting(): boolean {
        return !!this._arrayNodesColliderContact.length;
    }

    private _collider: Collider2D = null;

    private _arrayNodesColliderContact: Node[] = [];

    protected onEnable(): void {
        this._handleSubscriptions(true);
    }

    protected onDisable(): void {
        this._handleSubscriptions(false);
    }

    private _handleSubscriptions(isOn: boolean): void {
        const func: string = isOn ? 'on' : 'off';

        if (!!this._collider) {
            this._collider[func](Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
            this._collider[func](Contact2DType.END_CONTACT, this._onEndContact, this);
        }
    }

    public specify(info: any): void {
        !!info.initAngle && (this.node.angle = info.initAngle);
        !!info.spriteFrameName &&
            (this.node.getComponentInChildren(Sprite).spriteFrame = ImageManager.instance.getSpriteFrame(
                info.spriteFrameName
            ));
    }

    protected _initBody(): void {
        this._collider = this.getComponentInChildren(Collider2D);
    }

    private _onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this._arrayNodesColliderContact.push(otherCollider.node);
    }

    private _onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const index: number = this._arrayNodesColliderContact.indexOf(otherCollider.node);

        if (index > -1) this._arrayNodesColliderContact.splice(index, 1);
    }
}
