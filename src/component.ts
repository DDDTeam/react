import {isEqual} from '@guanghechen/fast-deep-equal';
import {destroyDOM} from './destroy-dom.js';
import {extractChildren} from './h.js';
import {mountDOM} from './mount-dom.js';
import {patchDOM} from './patch-dom.js';
import {enqueueJob} from './scheduler.js';
import type {ComponentState, Context, VDOMNode, WithChildrenProps} from './types';
import {DOM_TYPES} from './types';

export abstract class Component<P = {}, S = ComponentState, ContextValueType = null> {
  private isMounted = false;
  public vdom: VDOMNode | null = null;
  private hostEl: HTMLElement | null = null;
  public parent: Component | null = null;

  public props: P & WithChildrenProps;
  public state: S = {} as S;

  public context: ContextValueType = null as ContextValueType;

  constructor(props = {} as P, parentComponent: Component | null) {
    this.props = props as P & WithChildrenProps;
    this.parent = parentComponent;
  }

  onMount(): void | Promise<void> {
    return Promise.resolve();
  }

  onUnmount(): void | Promise<void> {
    return Promise.resolve();
  }

  onUpdate(): void | Promise<void> {
    return Promise.resolve();
  }

  onWillUnmount(): void | Promise<void> {
    return Promise.resolve();
  }

  abstract render(): VDOMNode;

  get elements(): HTMLElement[] {
    if (this.vdom == null) {
      return [];
    }

    if (this.vdom.type === DOM_TYPES.FRAGMENT) {
      return extractChildren(this.vdom).flatMap(child => {
        if (child.type === DOM_TYPES.COMPONENT && (child as any).component) {
          return (child as any).component.elements;
        }
        return (child as any).el ? [(child as any).el] : [];
      });
    }

    return (this.vdom as any).el ? [(this.vdom as any).el] : [];
  }

  get firstElement(): HTMLElement | undefined {
    return this.elements[0];
  }

  get offset(): number {
    if (this.vdom?.type === DOM_TYPES.FRAGMENT && this.hostEl && this.firstElement) {
      return Array.from(this.hostEl.children).indexOf(this.firstElement);
    }
    return 0;
  }

  updateProps(props: Partial<P>): void {
    const newProps = {...this.props, ...props};

    let isContextUpdated = this.updateContext();
    if (isEqual(this.props, newProps) && !isContextUpdated) {
      return;
    }

    this.props = newProps;
    this.patch();
  }

  setState(state: Partial<S> | ((prevState: S, props: P) => Partial<S>)): void {
    if (typeof state === 'function') {
      this.state = {
        ...this.state,
        ...(state as (prevState: S, props: P) => Partial<S>)(this.state, this.props),
      };
    } else {
      this.state = {...this.state, ...state};
    }
    this.patch();
  }

  mount(hostEl: HTMLElement, index: number | null = null): void {
    if (this.isMounted) {
      throw new Error('Component is already mounted');
    }

    this.updateContext();

    this.vdom = this.render();
    mountDOM(this.vdom, hostEl, index, this as Component);
    this.hostEl = hostEl;
    this.isMounted = true;
  }

  unmount(): void {
    if (!this.isMounted) {
      return;
    }

    enqueueJob(() => this.onWillUnmount());

    if (this.vdom) {
      destroyDOM(this.vdom);
    }

    enqueueJob(() => this.onUnmount());
    this.vdom = null;
    this.hostEl = null;
    this.isMounted = false;
  }

  private patch(): void {
    if (!this.isMounted || !this.hostEl || !this.vdom) {
      return;
    }

    const vdom = this.render();
    this.vdom = patchDOM(this.vdom, vdom, this.hostEl, this as Component);
    enqueueJob(() => this.onUpdate());
  }

  private updateContext() {
    const context = Object.getPrototypeOf(this).constructor
      .contextType as Context<ContextValueType>;

    let curVNode: Component | null | undefined = this.parent;
    if (context != null) {
      while (curVNode) {
        if (Object.getPrototypeOf(curVNode).constructor === context.Provider) {
          this.context = (curVNode as any).props.value as ContextValueType;
          return true;
        }

        curVNode = curVNode.parent;
      }

      if (curVNode == null) {
        this.context = context.defaultValue;
      }
    }

    return false;
  }
}
