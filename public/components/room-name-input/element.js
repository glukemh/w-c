import ConnectElement from "/mixins/connect-element.js";
import { formAssociatedMixin } from "/mixins/form-associated.js";
import { RoomListContextEvent } from "/components/room-list/element.js";

export default class RoomName extends formAssociatedMixin(ConnectElement) {
  connectedCallback() {
    this.dispatchEvent(new RoomListContextEvent(async (iter) => {
      for await (const room of this.whileConnected(iter)) {
        this.internals.setFormValue(room);
      }
    }));
  }
}

customElements.define("room-name-input", RoomName);