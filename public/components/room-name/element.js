export default class RoomName extends HTMLElement {
  shadow = this.attachShadow({ mode: "open" });

}

customElements.define("room-name", RoomName);