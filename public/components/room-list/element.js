/** @import { Link } from "/mixins/link-list.js" */
import rooms from "/channels/rooms.js";
import ConnectElement from "/mixins/connect-element.js";
import { contextElementMixin, ContextEvent } from "/mixins/context-element.js";
import { linkListMixin } from "/mixins/link-list.js";

export default class RoomList extends contextElementMixin(linkListMixin(ConnectElement)) {
  #internals = this.attachInternals();
  /** @type {Link<string>} */
  link = this.newLink((set, [next], [current]) => {
    if (next === current) return;
    if (next === undefined) {
      this.#internals.states.delete("context");
      return;
    }

    this.#internals.states.add("context");
    set(next);
  });
  contextListener = this.context(RoomListContextEvent, this.link.values);
  connectedCallback() {
    this.contextListener({ signal: this.connectSignal });
    if (!this.isRoot) return;
    this.whileConnected(rooms.subscribe(async (iter) => {
      for await (const rooms of iter) {
        this.link.newIter(Iterator.from(rooms));
      }
    }));
  }
}

/** @extends {ContextEvent<string>} */
export class RoomListContextEvent extends ContextEvent {
  static type = "room-list-context";
}

customElements.define("room-list", RoomList);