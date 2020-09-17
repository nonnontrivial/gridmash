/**
 * @fileoverview Exports interfaces, types, and utils
 */
import * as React from "react";

/**
 * Forms new array of react children suitable for rendering in the grid.
 *
 * @param children React children
 * @returns Array of React nodes 
 */
export function renderInOrder(children: React.ReactNode): React.ReactNode[] {
    // TODO: switch API to allow this to work
    const elements: React.ReactNode[] = [];
    React.Children.forEach(children, child => {
	elements.push(child);
    });
    return elements;
};

export type Scalar = number;

export type Grid<S extends Scalar> = S[][];

export interface Reconciliation<S extends Scalar = number> {
    id: string;
    result: S;
    motion: keyof typeof Motion;
    src: [number, number];
    dst: [number, number];
}

export enum Motion {
    UP = "UP",
    DOWN = "DOWN",
    LEFT = "LEFT",
    RIGHT = "RIGHT",
}

export type KeyEvent = "keydown" | "keypress" | "keyup";

export const defaultKeyMap = new Map([
    [Motion.UP, "ArrowUp"],
    [Motion.DOWN, "ArrowDown"],
    [Motion.LEFT, "ArrowLeft"],
    [Motion.RIGHT, "ArrowRight"],
]);
