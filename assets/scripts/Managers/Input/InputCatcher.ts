import { _decorator, Component, Node, Enum, EventTouch } from 'cc';
import { GameEvent } from '../../Enums/GameEvent';
import { InputDirection } from './Enums/InputDirection';
import { InputType } from './Enums/InputType';
const { ccclass, property, menu } = _decorator;

@ccclass('InputCatcher')
@menu('Input/InputCatcher')
export class InputCatcher extends Component {
    @property({
        type: Enum(InputDirection),
        tooltip: 'место откуда пришел инпут, по энаму InputDirection',
    })
    public direction: InputDirection = InputDirection.None;
    @property({
        type: Component,
        tooltip: 'компонента, которая будет передана в команду. В команде можно будет использовать ее методы',
    })
    public handler: Component = null;

    onEnable() {
        this._handleSubscriptions(true);
    }

    onDisable() {
        this._handleSubscriptions(false);
    }

    _handleSubscriptions(isOn: boolean) {
        const func = isOn ? 'on' : 'off';

        this.node[func](Node.EventType.TOUCH_START, this.onDown, this);
        this.node[func](Node.EventType.TOUCH_MOVE, this.onMove, this);
        this.node[func](Node.EventType.TOUCH_END, this.onUp, this);
        this.node[func](Node.EventType.TOUCH_CANCEL, this.onUp, this);
    }

    onDown(event: EventTouch) {
        GameEvent.EventTarget.emit(
            GameEvent.EventType.INPUT,
            InputType.Down,
            this.direction,
            event.touch,
            this,
            this.handler
        );
    }

    onMove(event: EventTouch) {
        GameEvent.EventTarget.emit(
            GameEvent.EventType.INPUT,
            InputType.Move,
            this.direction,
            event.touch,
            this,
            this.handler
        );
    }

    onUp(event: EventTouch) {
        GameEvent.EventTarget.emit(
            GameEvent.EventType.INPUT,
            InputType.Up,
            this.direction,
            event.touch,
            this,
            this.handler
        );
    }
}
