import {
    _decorator,
    Node,
    Vec3,
    UITransform,
    Collider2D,
    Contact2DType,
    Sprite,
    Tween,
    tween,
    UIOpacity,
    log,
} from 'cc';
import { GameObject } from '../Managers/GameObject/GameObject';
import { GameEvent } from '../Enums/GameEvent';
import { SingleBlocker } from './SingleBlocker';
import { AudioManager } from '../Managers/AudioManager';
import { GameObjectManager } from '../Managers/GameObject/GameObjectManager';
import { ImageManager } from '../Managers/ImageManager';
import { InputCatcher } from '../Managers/Input/InputCatcher';

const { ccclass, property, requireComponent } = _decorator;

@ccclass('TweenNodeHelper')
class TweenNodeHelper {
    public set tween(tween: Tween<Node>) {
        this._tween = tween.call(() => (this.isPlaying = false));
    }

    private _tween: Tween<Node> = null;
    public isPlaying: boolean = false;

    public start() {
        if (!!this._tween && !this.isPlaying) {
            this._tween.start();

            this.isPlaying = true;
        }
    }
}

@ccclass('Ring')
@requireComponent(UIOpacity)
export class Ring extends GameObject {
    private _rangeDisableAngle: number[] = [60, 122];
    private _arrayNodesColliderContact: Node[] = [];

    //single blockers
    private _arrSingleBlockers: SingleBlocker[] = [];
    private _arrayAnglesSingleBlockers: number[] = [];
    private _singleBlockersPrefabName: string = '';
    private _singleBlockersSpriteFrame: string = '';

    //tween
    private _tweenBlockingRotate: TweenNodeHelper = new TweenNodeHelper();
    private _tweenUnlocking: Tween<Node> = null;
    private _dropOffset: Vec3 = new Vec3(0, -500, 0);

    //audio
    private _unlockAudioName: string = '';
    private _blockingAudioName: string = '';

    @property({
        type: Node,
    })
    public render: Node = null;

    private _collider: Collider2D = null;

    protected onEnable(): void {
        this._handleSubscriptions(true);
    }

    protected onDisable(): void {
        this._handleSubscriptions(false);
    }

    public rotate(angle: number): void {
        this.node.angle = angle;
    }

    public getAngle(): number {
        return this.node.angle;
    }

    public playBlockingRotate(): void {
        !!this._tweenBlockingRotate && this._tweenBlockingRotate.start();
    }

    public getSingleBlockersContactStatus(): boolean {
        const singleBlockersIndex: number = this._arrSingleBlockers.findIndex(
            (singleBlocker) => singleBlocker.isColliderContacting
        );

        return singleBlockersIndex !== -1;
    }

    public specify(info: any): void {
        info.arrayAnglesSingleBlockers &&
            !!info.arrayAnglesSingleBlockers.length &&
            (this._arrayAnglesSingleBlockers = [...info.arrayAnglesSingleBlockers]);

        !!info.spriteFrameName &&
            (this.render.getComponent(Sprite).spriteFrame = ImageManager.instance.getSpriteFrame(info.spriteFrameName));

        !!info.unlockAudioName && (this._unlockAudioName = info.unlockAudioName);
        !!info.blockingAudioName && (this._blockingAudioName = info.blockingAudioName);

        info.initAngle && (this.node.angle = info.initAngle);

        !!info.singleBlockersPrefabName && (this._singleBlockersPrefabName = info.singleBlockersPrefabName);
        !!info.singleBlockerSpriteFrame && (this._singleBlockersSpriteFrame = info.singleBlockerSpriteFrame);
    }

    private _handleSubscriptions(isOn: boolean): void {
        const func: string = isOn ? 'on' : 'off';

        if (!!this._collider) {
            this._collider[func](Contact2DType.BEGIN_CONTACT, this._onBeginContact, this);
            this._collider[func](Contact2DType.END_CONTACT, this._onEndContact, this);
        }

        GameEvent.EventTarget[func](GameEvent.EventType.CHECK_UNLOCKING, this._onCheckUnlocking, this);
    }

    private _calculatePositionOnRing(angle: number): Promise<Vec3> {
        const transform: UITransform = this.node.getComponent(UITransform);

        const singleBlockersPosition: Vec3 = new Vec3(
            (transform.width / 2) * Math.cos((angle / 180) * Math.PI),
            (transform.height / 2) * Math.sin((angle / 180) * Math.PI)
        );

        return new Promise<Vec3>((resolve) => {
            resolve(singleBlockersPosition);
        });
    }

    private _unlock(): void {
        this._tweenUnlocking && this._tweenUnlocking.start();
    }

    private async _createSingleBlockers(): Promise<void> {
        for (const angle of this._arrayAnglesSingleBlockers) {
            const currentAngle: number = angle > 360 ? angle - Math.trunc(angle / 360) * 360 : angle;

            if (this._rangeDisableAngle[0] < currentAngle && currentAngle < this._rangeDisableAngle[1]) return;
            const singleBlockersPosition: Vec3 = await this._calculatePositionOnRing(currentAngle);

            this._createSingleBlocker(this._singleBlockersPrefabName, singleBlockersPosition, {
                initAngle: currentAngle + 180,
                spriteFrameName: this._singleBlockersSpriteFrame,
            });
        }
    }

    private _createSingleBlocker(prefabName: string, position: Vec3, info: Object) {
        GameObjectManager.instance.createGameObject(
            prefabName,
            (gameObject: GameObject, gameObjectNode: Node) => {
                gameObjectNode.setParent(this.node);
                gameObjectNode.setPosition(position);
            },
            (gameObject: GameObject, gameObjectNode: Node) => {
                this._arrSingleBlockers.push(gameObjectNode.getComponent(SingleBlocker));
                gameObject.specify(info);
            }
        );
    }

    private _initAnimations(): void {
        this._tweenBlockingRotate.tween = tween(this.node)
            .call(() => {
                !!this._blockingAudioName && AudioManager.instance.play(this._blockingAudioName);
            })
            .sequence(
                tween(this.node).by(0.05, { angle: 2 }),
                tween(this.node).by(0.1, { angle: -4 }),
                tween(this.node).by(0.05, { angle: 2 })
            )
            .repeat(2);

        const UIOpacityComponent = this.getComponent(UIOpacity);

        this._tweenUnlocking = tween(this.node)
            .call(() => {
                this._handleSubscriptions(false);
                this.node.getComponentInChildren(InputCatcher).enabled = false;

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

    protected _init(): void {
        this._initAnimations();

        this._createSingleBlockers();
    }

    protected _initBody(): void {
        this._collider = this.getComponentInChildren(Collider2D);
    }

    protected _initRender(): void {}

    private _onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D): void {
        this._arrayNodesColliderContact.push(otherCollider.node);
    }

    private _onEndContact(selfCollider: Collider2D, otherCollider: Collider2D): void {
        const index: number = this._arrayNodesColliderContact.indexOf(otherCollider.node);

        if (index > -1) this._arrayNodesColliderContact.splice(index, 1);
    }

    private _onCheckUnlocking(): void {
        const isSingleBlockersContacting = this.getSingleBlockersContactStatus();

        if (!(isSingleBlockersContacting || !!this._arrayNodesColliderContact.length)) this._unlock();
    }
}
