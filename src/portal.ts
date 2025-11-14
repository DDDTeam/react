import {hPortal} from './h.ts';
import type {PortalVDOMNode, VDOMNode} from './types/vdom.ts';

export function createPortal(
  children: VDOMNode | VDOMNode[],
  container: HTMLElement,
): PortalVDOMNode {
  const childrenArray = Array.isArray(children) ? children : [children];

  return hPortal(childrenArray, container);
}
