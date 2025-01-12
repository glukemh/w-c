/** @import { Link } from "/mixins/link-list.js" */
import rooms from "/channels/rooms.js";
import ConnectElement from "/mixins/connect-element.js";
import { linkListMixin } from "/mixins/link-list.js";

export default class RoomList extends linkListMixin(ConnectElement) {
  shadow = this.attachShadow({ mode: "open" });
  /** @type {Link<string>} */
  get link() { return super.link; }
  connectedCallback() {
    this.link.value(async (iter) => {
      for await (const room of iter) {
        this.shadow.textContent = room;
      }
    });
    if (!this.isRoot) return;
    this.whileConnected(rooms.subscribe(async (iter) => {
      for await (const rooms of iter) {
        this.link.newIter(Iterator.from(rooms));
      }
    }));
  }
}

customElements.define("room-list", RoomList);