import { EventTarget } from 'cc';

const eventTarget: EventTarget = new EventTarget();

enum Events {
    NONE,
    INPUT,
    FIRST_TAP,

    CHECK_UNLOCKING,
}

export class GameEvent {
    public static EventTarget: EventTarget = eventTarget;
    public static EventType: typeof Events = Events;
}
