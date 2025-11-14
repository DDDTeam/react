import {Component} from './component';
import {createContext} from './context';
import {h, hFragment, hString} from './h';
import {render} from './render';
import {createRef} from './ref';
import type {Ref} from './ref';
import type {ComponentType} from './types/types.ts';
import {createPortal} from './portal.ts';

export type {ComponentType, Ref};
export {Component, createContext, createRef, h, hFragment, hString, render, createPortal};
