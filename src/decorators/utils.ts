export type CopyParam = {
  name: string;
  index: number
};

export const comparableMetadataKey = Symbol('comparable');
export const copyMetadataKey = Symbol('copy');
export const copyArgsMetadataKey = Symbol('copyArgs');
export const entityMetadataKey = Symbol('entity');

/**
 * @internal
 *
 * Return whether a given class is an {@link Entity}.
 *
 * @param target - The class in question.
 *
 * @returns Whether the class is an {@link Entity}.
 */
export function isEntity(target: any): boolean {
  return target &&
         target.constructor &&
         target.constructor.prototype &&
         typeof target.constructor.prototype === 'object' &&
         !!Reflect.getMetadata(entityMetadataKey, target.constructor.prototype);
}

/**
 * @internal
 *
 * Return whether a given class property is to be used to compare two instances
 * of the same class.
 *
 * @param target - The class in question.
 * @param property - The name of the property.
 *
 * @returns Whether this property is used to determine equality between two
 *  instances of this class.
 */
export function isComparable(target: any, property: string): boolean {
  return !!Reflect.getMetadata(comparableMetadataKey, target, property);
}

/**
 * @internal
 *
 * Return whether a given class property should be copied when copying a class
 * instance.
 *
 * @param target - The class in question.
 * @param property - The name of the property.
 *
 * @returns Whether this property is copied when an instance of this class is
 *  copied.
 */
export function isCopyable(target: any, property: string): boolean {
  return !!Reflect.getMetadata(copyMetadataKey, target, property);
}

/**
 * @internal
 *
 * Return the arguments of this class's constructor which are to be provided
 * when copying the class.
 *
 * @param target - The class in question.
 *
 * @returns An array of {@link CopyParam} indicating the name of the class's
 *  property to provide for each constructor argument and where in the
 *  constructor's argument list that property's value should go.
 */
export function getCopyArgs(target: any): CopyParam[] {
  const copyArgs = Reflect.getMetadata(copyArgsMetadataKey, target);

  if (!Array.isArray(copyArgs)) {
    return []
  }

  return copyArgs;
}

/**
 * @internal
 *
 * Verify that a class is properly annotated for copying - that is, that
 * property and constructor annotations match appropriately.
 *
 * @param copyableProperties - The names of the {@link Copyable @Copyable}
 *  annotated properties on this class.
 * @param annotatedParams - The names and indices of the {@link Copy @Copy}
 *  annotated params to this class's constructor.
 *
 * @throws {@link TypeError} Property `[name]` has no matching constructor
 *  argument annotation!
 * @throws {@link TypeError} Constructor argument `[name]` has no matching
 *  property annotation!
 */
export function verifyCopyable(copyableProperties: string[], annotatedParams: CopyParam[]) {
  const paramsSet = new Set(annotatedParams.map(({ name }) => name));
  const propsSet = new Set(copyableProperties);

  for (const property of copyableProperties) {
    if (!paramsSet.has(property)) {
      throw new TypeError(`Property ${property} has no matching constructor argument annotation!`);
    }
  }

  for (const { name } of annotatedParams) {
    if (!propsSet.has(name)) {
      throw new TypeError(`Constructor argument ${name} has no matching property annotation!`);
    }
  }
}

export function copyParamSort(a: CopyParam, b: CopyParam) {
  return a.index > b.index ? 1: -1;
}