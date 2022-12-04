export type PropertyDecorator = (target: Object, propertyKey: string | symbol) => void;
export type ParameterDecorator = (target: any, argName: string | symbol, index: number) => void;
export type Constructable = { new(...args: any[]): {} };

/**
 * The interface implemented by all classes annotated with {@link Entity}.
 */
export interface EntityInterface<T> {
  /**
   * Return whether this {@link Entity} is equal to some other value. Returns
   * false if both are not of the same type. Otherwise, compares all properties
   * annotated with {@link Comparable @Comparable}.
   *
   * @param other The value against which to compare this {@link Entity}.
   *
   * @returns Whether this {@link Entity} is equal to the provided value.
   */
  isEqual: (other: any) => boolean;

  /**
   * Return a copy of this {@link Entity}.
   *
   * @returns A copy of this {@link Entity}.
   */
  copy: () => T;
}