import { _decorator, Component, EventTouch, log, Vec2 } from 'cc';
import IInputCommand from './IInputCommand';
import { InputManager } from '../InputManager';
import { InputCatcher } from '../InputCatcher';
import { Ring } from '../../../Puzzle/Ring';
import { GameEvent } from '../../../Enums/GameEvent';
const { ccclass, property } = _decorator;

@ccclass('ItemInputCommand')
export class ItemInputCommand extends IInputCommand {
    constructor(manager: InputManager) {
        super(manager);
    }

    private _startDeflectionAngle: number = 0;
    private _startRingAngle: number = 0;
    private _isRotateDisable: boolean = false;

    onDown(touch: EventTouch, catcher: InputCatcher, controller: Ring) {
        this._isRotateDisable = controller.getSingleBlockersContactStatus();

        if (this._isRotateDisable) {
            controller.playBlockingRotate();

            return;
        }

        this._startRingAngle = controller.getAngle();

        const angle = this._calculateAngle(
            touch.getUILocation(),
            new Vec2(controller.node.getWorldPosition().x, controller.node.getWorldPosition().y)
        );

        this._startDeflectionAngle = angle;
    }

    onMove(touch: EventTouch, catcher: InputCatcher, controller: Ring) {
        if (this._isRotateDisable) return;

        const angle = this._calculateAngle(
            touch.getUILocation(),
            new Vec2(controller.node.getWorldPosition().x, controller.node.getWorldPosition().y)
        );

        controller.rotate(this._startRingAngle + (angle - this._startDeflectionAngle));
    }

    onUp(touch: EventTouch, catcher: InputCatcher, controller: Ring) {
        if (this._isRotateDisable) return;

        GameEvent.EventTarget.emit(GameEvent.EventType.CHECK_UNLOCKING);
    }

    private _calculateAngle(vecA: Vec2, vecB: Vec2): number {
        const subtractionVector: Vec2 = vecA.subtract(vecB);
        const angle: number = (Math.atan2(subtractionVector.y, subtractionVector.x) / Math.PI) * 180;

        return angle;
    }
}
