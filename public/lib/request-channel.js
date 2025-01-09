import StateCommunication from "/lib/state-communication.js";

/**
 * @template T
 * @extends StateCommunication<T> */
export default class RequestChannel extends StateCommunication {
  request() {
    const controller = new AbortController();
    return /** @type {Promise<T>} */(new Promise((resolve) => {
      this.channel.addEventListener("message", ({ data }) => {
        switch (data.action) {
          case "send/current":
          case "send/next":
            resolve(data.value);
            controller.abort();
            break;
        }
      }, { signal: controller.signal });
    }));
  }

  async * subscribe() {
    const controller = new AbortController();
    try {
      /** @type {T[]} */
      const vals = [await this.request()];
      /** @type {PromiseWithResolvers<boolean>} */
      let next = Promise.withResolvers();
      this.channel.addEventListener("message", ({ data }) => {
        if (data.action === "send/next") {
          vals.push(data.value);
          next.resolve(true);
          next = Promise.withResolvers();
        }
      }, { signal: controller.signal });
      do {
        yield* vals;
        vals.splice(0);
      } while (await next.promise);
    } finally {
      controller.abort();
    }
  }
}
