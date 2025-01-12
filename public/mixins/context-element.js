/** @import State from "/lib/state.js" */
/** 
 * @template {CustomElementConstructor} T
 * @param {T} Base */
export const contextElementMixin = (Base) => {
  /**
   * @class
   * @extends Base */
  class ContextElement extends Base {
    /**
     * @template E
     * @param {{ type: string, new(detail: ContextEventDetail<E>): ContextEvent<E> }} eventConstructor
     * @param {State<E>['subscribe']} values values to callback */
    context(eventConstructor, values) {
      /** @param {AddEventListenerOptions} [options] */
      return (options) => {
        this.addEventListener(eventConstructor.type, /** @param {Event} e */(e) => {
          if (!(e instanceof eventConstructor)) return;
          e.stopPropagation();
          e.detail(values());
        }, options);
      };
    }
  }

  return ContextElement;
};

const ContextElement = contextElementMixin(HTMLElement);
export default ContextElement;

/**
 * @template T
 * @extends {CustomEvent<ContextEventDetail<T>>} */
export class ContextEvent extends CustomEvent {
  static type = "context";
  /** @param {ContextEventDetail<T>} detail */
  constructor(detail) {
    super(new.target.type, { detail, bubbles: true, composed: true });
  }
}

/** @template T @typedef {(values: ReturnType<State<T>['subscribe']>) => void} ContextEventDetail */