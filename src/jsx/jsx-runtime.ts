import { h, hFragment, hString } from '../h';
import type { IEvent, IProp, VDOMNode } from '../types';

export const Fragment = Symbol('Fragment');

export type Child = VDOMNode | string | number | boolean | null | undefined;

// Функция для нормализации дочерних элементов
function normalizeChild(child: Child): VDOMNode | null {
	if (child == null || child === false) {
		return null;
	}
	if (
		typeof child === 'string' ||
		typeof child === 'number' ||
		typeof child === 'boolean'
	) {
		return hString(String(child));
	}
	return child as VDOMNode;
}

export function jsx(
	tag: unknown,
	props?: IProp,
	...children: Array<Child | Child[]>
): VDOMNode {
	// Fragment
	if (tag === Fragment) {
		const normalizedChildren = children
			.flat()
			.map(normalizeChild)
			.filter((c): c is VDOMNode => c != null);
		return hFragment(normalizedChildren);
	}

	// Components (функция-конструктор / класс)
	if (
		typeof tag === 'function' ||
		(typeof tag === 'object' && tag != null && 'render' in tag)
	) {
		const componentProps: IProp = { ...(props ?? {}) };

		if (children.length > 0) {
			componentProps.children = children
				.flat()
				.map(normalizeChild)
				.filter((c): c is VDOMNode => c != null);
		}

		return h(tag as any, componentProps);
	}

	// DOM элементы — собираем события и атрибуты
	const events: IEvent = {};
	const attributes: IProp = {};

	if (props) {
		Object.entries(props).forEach(([key, value]) => {
			if (key.startsWith('on') && typeof value === 'function') {
				const eventName = key.slice(2).toLowerCase();
				(events as Record<string, Function>)[eventName] = value as Function;
			} else if (key === 'className') {
				attributes['class'] = value;
			} else if (key === 'style' && typeof value === 'object') {
				attributes['style'] = value;
			} else if (key !== 'children' && key !== 'key') {
				attributes[key] = value;
			}
		});
	}

	const normalizedChildren = children
		.flat()
		.map(normalizeChild)
		.filter((c): c is VDOMNode => c != null);

	return h(tag as any, { ...attributes, on: events }, normalizedChildren);
}
