import { _decorator, Component, EventTouch, Enum, log } from 'cc';
import { GameEvent } from '../../Enums/GameEvent';
import IInputCommand from './Commands/IInputCommand';
import { InputDirection } from './Enums/InputDirection';
import { InputType } from './Enums/InputType';
import { InputCatcher } from './InputCatcher';

import { ItemInputCommand } from './Commands/ItemInputCommand';

const { ccclass, property, menu } = _decorator;

@ccclass('InputManager')
@menu('Input/InputManager')
export class InputManager extends Component {
    @property({ visible: false })
    public commands: Map<InputDirection, IInputCommand> = new Map();
    @property({ visible: false })
    public time: number = 0;

    private _isFirstTap: boolean = true;
    private _isInput: boolean = false;

    protected onLoad(): void {
        this._handleSubscription(true);

        this.commands[InputDirection.Item] = new ItemInputCommand(this);
    }

    protected update(deltaTime: number): void {
        this.time += deltaTime;
    }

    private _handleSubscription(isOn: boolean): void {
        const func = isOn ? 'on' : 'off';

        GameEvent.EventTarget.on(GameEvent.EventType.INPUT, this._onInput, this);
    }

    private _onInput(
        type: InputType,
        direction: InputDirection,
        touch: EventTouch,
        catcher: InputCatcher,
        handler: Component
    ): void {
        const command = this.commands[direction];

        switch (type) {
            case InputType.Down:
                if (command) {
                    command.onDown(touch, catcher, handler);
                }

                if (this._isFirstTap) {
                    this._isFirstTap = false;
                    GameEvent.EventTarget.emit(GameEvent.EventType.FIRST_TAP);
                }

                this._isInput = true;
                break;

            case InputType.Move:
                if (command) {
                    command.onMove(touch, catcher, handler);
                }
                break;

            case InputType.Up:
                if (command) {
                    command.onUp(touch, catcher, handler);
                    this._isInput = false;
                }
                break;
        }
    }
}
