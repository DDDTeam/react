import type {Component} from '../component';

export const isProvider = (component: Component) => {
  return component.constructor.name.includes('Provider');
};
