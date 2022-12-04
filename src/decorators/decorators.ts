import 'reflect-metadata';
import {
  comparableMetadataKey,
  copyArgsMetadataKey,
  copyMetadataKey,
  entityMetadataKey,
  copyParamSort,
  getCopyArgs,
  isComparable,
  isCopyable,
  isEntity,
  verifyCopyable
} from './utils';
import { Constructable, ParameterDecorator, PropertyDecorator } from './types';

/**
 * Class annotation - Extends the functionality of a class to ensure that it
 * implements the {@link EntityInterface Entity} interface.
 *
 * Adds the following methods to the annotated class:
 *
 * {@link EntityInterface.isEqual isEqual}
 *
 * {@link EntityInterface.copy copy}
 *
 * @param constructor The constructor for the class to extend.
 */
export function Entity<T extends Constructable>(constructor: T) {
  Reflect.defineMetadata(entityMetadataKey, true, constructor.prototype);

  const areFieldsEqual = (thisValue: any, otherValue: any): boolean => {
    // If both are entities, compare using `isEqual`
    if (isEntity(thisValue)) {
      if (!thisValue.isEqual(otherValue)) {
        return false;
      }
      // If both are primitives, compare using ===
    } else {
      if (thisValue !== otherValue) {
        return false;
      }
    }

    return true;
  }
  const copyField= (original: any) => {
    if (!isEntity(original)) {
      return original;
    }

    return original.copy();
  }

  /** Implements {@link EntityInterface.isEqual isEqual}. */
  constructor.prototype.isEqual = function<T extends { [key: string]: any }>(this: any, other: T) {
    if (!(other instanceof constructor)) {
      return false;
    }

    const properties = Object.keys(this).filter(key => isComparable(constructor.prototype, key));

    for (const property of properties ) {
      if (property in other) {
        if (Array.isArray(this[property])) {
          if (this[property].length !== other[property].length) {
            return false;
          }

          for (let i = 0; i < this[property].length; i++) {
            const thisValue = this[property][i];
            const otherValue = other[property][i];

            if (!areFieldsEqual(thisValue, otherValue)) {
              return false;
            }
          }
        } else {
          const thisValue = this[property];
          const otherValue = other[property];

          if (!areFieldsEqual(thisValue, otherValue)) {
            return false;
          }
        }
      } else {
        return false;
      }
    }

    return true;
  }

  /** Implements {@link EntityInterface.copy copy}. */
  constructor.prototype.copy = function(this: any): typeof constructor.prototype {
    const copyableProperties = Object.keys(this).filter(key => isCopyable(constructor.prototype, key));
    const annotatedArguments = getCopyArgs(constructor).sort(copyParamSort) ;
    verifyCopyable(copyableProperties, annotatedArguments);

    const values = annotatedArguments.map(({ name }) => {
      const thisValue = this[name];

      if (Array.isArray(thisValue)) {
        return thisValue.map(copyField);
      } else {
        return copyField(thisValue);
      }
    });

    return new constructor(...values);
  }
}

/**
 * Property annotation - Annotate a class property to indicate that it should
 * be compared with the same property on another instance of the same class when
 * one of the instance's `isEqual()` method is called. Any property not
 * annotated with {@link Comparable @Comparable} will be ignored when evaluating the
 * quality of two instances of the same class.
 *
 * @returns A decorator marking this property as one that should be compared
 *  with the same property on another instance of the same class when checking
 *  whether those instances are equal.
 */
export function Comparable(): PropertyDecorator {
  return function(target: Object, propertyKey: string|symbol): void {
    Reflect.defineMetadata(comparableMetadataKey, true, target, propertyKey);
  }
}

/**
 * Property annotation - Annotate a class property as being copyable. The name
 * of this property must match the name provided to a {@link Copy @Copy}
 * annotation on a constructor parameter. For example:
 *
 * @example
 * ```typescript
 * class Person {
 *   @Copyable()
 *   readonly string: name;
 *
 *   constructor(@Copy('name') name: string) {
 *     this.name = name;
 *   }
 * }
 *
 * // Equivalently
 * class Person {
 *   @Copyable()
 *   readonly string: name;
 *
 *   constructor(@Copy('name') personName: string) {
 *     this.name = personName;
 *   }
 * }
 *
 * // Will not work
 * class Person {
 *   @Copyable()
 *   readonly string: personName;
 *
 *   constructor(@Copy('name') name: string) {
 *     this.personName = name;
 *   }
 * }
 * ```
 */
export function Copyable(): PropertyDecorator {
  return function(target: Object, propertyKey: string|symbol): void {
    Reflect.defineMetadata(copyMetadataKey, true, target, propertyKey);
  }
}

/**
 * A utility decorator that combines the functionality of {@link Comparable} and
 * {@link Copyable}. May be used in place of annotating a property as both
 * `Comparable()` and `Copyable()`, a common use case for most entities.
 *
 * @returns A decorator annotating a property as both used for copying and for
 *  checking equality across entities.
 */
export function EntityField(): PropertyDecorator {
  return function(target: Object, propertyKey: string|symbol): void {
    Comparable()(target, propertyKey);
    Copyable()(target, propertyKey);
  }
}

/**
 * Constructor parameter annotation - Annotate a constructor param with the name
 * of the property which maps to it. For example:
 *
 * @example
 * ```typescript
 * class Person {
 *   @Copyable()
 *   readonly string: name;
 *
 *   constructor(@Copy('name') name: string) {
 *     this.name = name;
 *   }
 * }
 *
 * // Equivalently
 * class Person {
 *   @Copyable()
 *   readonly string: name;
 *
 *   constructor(@Copy('name') personName: string) {
 *     this.name = personName;
 *   }
 * }
 *
 * // Will not work
 * class Person {
 *   @Copyable()
 *   readonly string: personName;
 *
 *   constructor(@Copy('name') name: string) {
 *     this.personName = name;
 *   }
 * }
 * ```
 *
 * @param name The name of the property of the object which should be provided
 *  to the constructor when copying the object. Must match the name of a
 *  property of this class annotated with {@link Copyable @Copyable} (see
 *  example).
 *
 * @returns A decorator for this constructor parameter indicating which class
 *  property should be inserted for this parameter when copying the entity.
 */
export function Copy(name: string): ParameterDecorator {
  return function (target: any, argName: string | symbol, index: number): void {
    const existingCopyArgs = getCopyArgs(target);
    existingCopyArgs.push({ name, index });
    Reflect.defineMetadata(copyArgsMetadataKey, existingCopyArgs, target);
  }
}

