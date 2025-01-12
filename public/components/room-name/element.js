import ConnectElement from "/mixins/connect-element.js";
import { RoomListContextEvent } from "/components/room-list/element.js";

export default class RoomName extends ConnectElement {
  shadow = this.attachShadow({ mode: "open" });
  connectedCallback() {
    this.dispatchEvent(new RoomListContextEvent(async (iter) => {
      for await (const room of this.whileConnected(iter)) {
        this.shadow.textContent = room;
      }
    }));
  }
}

customElements.define("room-name", RoomName);