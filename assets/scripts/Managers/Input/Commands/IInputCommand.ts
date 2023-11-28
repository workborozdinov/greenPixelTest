import { EventTouch, Node, Component, Vec2, v3, v2, Vec3 } from 'cc';
import { InputCatcher } from '../InputCatcher';
import { InputManager } from '../InputManager';

interface TouchInfo {
    time: number;
    location: Vec2;
    position: Vec2;
    worldPosition: Vec2;
}

interface InputInfo {
    id: number;
    down: TouchInfo;
    last: TouchInfo;
    current: TouchInfo;
}

export default class IInputCommand {
    public node: Node = null;
    public manager: InputManager = null;
    public touches: Map<number, InputInfo> = null;

    constructor(manager: InputManager) {
        this.node = manager.node;
        this.manager = manager;
        this.touches = new Map();
    }

    onDown(touch: EventTouch, catcher: InputCatcher, controller: Component) {}
    onMove(touch: EventTouch, catcher: InputCatcher, controller: Component) {}
    onUp(touch: EventTouch, catcher: InputCatcher, controller: Component) {}

    createTouchInfo(touch: EventTouch, catcher: InputCatcher): InputInfo {
        let id = touch.getID();

        const inputInfo: InputInfo = {
            id,
            down: this.getTouchInfo(touch, catcher),
            last: this.getTouchInfo(touch, catcher),
            current: this.getTouchInfo(touch, catcher),
        };

        this.touches.set(id, inputInfo);
        return inputInfo;
    }

    refreshTouchInfo(touchInfo: InputInfo, touch: EventTouch, catcher: InputCatcher) {
        touchInfo.last = touchInfo.current;
        touchInfo.current = this.getTouchInfo(touch, catcher);
    }

    findTouch(touch: EventTouch): InputInfo {
        return this.touches.get(touch.getID());
    }

    destroyTouch(touch: EventTouch) {
        this.touches.delete(touch.getID());
    }

    getTouchInfo(touch: EventTouch, catcher: InputCatcher): TouchInfo {
        const location: Vec2 = touch.getLocationInView();
        const worldPosition: Vec2 = touch.getLocation();
        const position: Vec3 = this.node.worldPosition.subtract(v3(worldPosition.x, worldPosition.y));

        return {
            time: this.manager.time,
            location,
            position: v2(position.x, position.y),
            worldPosition,
        };
    }
}
