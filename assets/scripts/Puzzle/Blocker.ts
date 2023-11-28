import {
    _decorator,
    Node,
    Collider2D,
    Contact2DType,
    IPhysics2DContact,
    UIOpacity,
    Tween,
    tween,
    Vec3,
    Sprite,
} from 'cc';
import { GameObject } from '../Managers/GameObject/GameObject';
import { GameEvent } from '../Enums/GameEvent';
import { AudioManager } from '../Managers/AudioManager';
import { ImageManager } from '../Managers/ImageManager';

const { ccclass, requireComponent } = _decorator;

@ccclass('Blocker')
@requireComponent(UIOpacity)
export class Blocker extends GameObject {
    get isColliderContacting(): boolean {
        return !!this._arrayNodesColliderContact.length;
    }

    private _collider: Collider2D = null;
    private _arrayNodesColliderContact: Node[] = [];

    private _tweenUnlocking: Tween<Node> = null;
    private _dropOffset: Vec3 = new Vec3(0, -500, 0);

    private _unlockAudioName: string = '';

    protected onEnable(): void {
        this._handleSubscriptions(true);
    }

    protected onDisable(): void {
        this._handleSubscriptions(false);
    }

    public specify(info: any): void {
        !!info.unlockAudioName && (this._unlockAudioName = info.unlockAudioName);
        !!info.spriteFrameName &&
            (this.node.getComponentInChildren(Sprite).spriteFrame = ImageManager.instance.getSpriteFrame(
                info.spriteFrameName
            ));
    }

    private _handleSubscriptions(isOn: boolean): void {
        const func: string = isOn ? 'on' : 'off';

        if (!!this._collider) {
            this._collider[func](Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
            this._collider[func](Contact2DType.END_CONTACT, this._onEndContact, this);
        }

        GameEvent.EventTarget[func](GameEvent.EventType.CHECK_UNLOCKING, this._onCheckUnlocking, this);
    }

    protected _initBody(): void {
        this._collider = this.getComponentInChildren(Collider2D);
    }

    protected _init(): void {
        this._initAnimations();
    }

    private _unlock(): void {
        this._tweenUnlocking.start();
    }

    private _initAnimations(): void {
        const UIOpacityComponent = this.getComponent(UIOpacity);

        this._tweenUnlocking = tween(this.node)
            .call(() => {
                this._handleSubscriptions(false);
                !!this._unlockAudioName && AudioManager.instance.play(this._unlockAudioName);
            })
            .by(
                0.5,
                { position: this._dropOffset },
                {
                    easing: 'sineIn',
                    onUpdate(target: Node, ratio: number) {
                        UIOpacityComponent.opacity = (1 - ratio) * 255;
                    },
                }
            )
            .call(() => {
                this.node.active = false;
            });
    }

    private _onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        this._arrayNodesColliderContact.push(otherCollider.node);
    }

    private _onEndContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        const index: number = this._arrayNodesColliderContact.indexOf(otherCollider.node);

        if (index > -1) this._arrayNodesColliderContact.splice(index, 1);
    }

    private _onCheckUnlocking(): void {
        !this._arrayNodesColliderContact.length && this._unlock();
    }
}
