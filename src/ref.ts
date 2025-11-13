export interface Ref<T = HTMLElement> {
	current: T | null;
}

export function createRef<T = HTMLElement>(): Ref<T> {
	return {
		current: null,
	};
}
