/**
 * @fileoverview Exports Utils, interfaces, and types.
 */
import * as React from "react";

/**
 * Forms new array of children suitable for rendering in the grid.
 *
 * @param children React children
 * @returns Array of React nodes 
 */
export function renderInOrder(children: React.ReactNode): React.ReactNode[] {
  const elements: React.ReactNode[] = [];
  React.Children.forEach(children, child => {
    if (React.isValidElement(child)) {
      elements.push(child);
    }
  });
  return elements;
};

export type Scalar = number;

export type Grid<S extends Scalar> = S[][];

type Tuple<S extends Scalar> = [S, S];

export interface Reconciliation<S extends Scalar = number> {
  id: string;
  motion: keyof typeof Motion,
  args: Tuple<S>;
  result: S;
  location: {
    src: Tuple<number>,
    dst: Tuple<number>,
  };
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
