import { Copy, Entity, EntityField, EntityInterface } from "../decorators";

export type OptionalOrNothing<T> = T | null | undefined;
export type GenderMarker = 'M' | 'F' | 'X';

@Entity
export class Person {
  @EntityField()
  readonly name: string;

  @EntityField()
  readonly age: Optional<number>;

  @EntityField()
  readonly gender: Optional<GenderMarker>;

  constructor(@Copy('name') name: string,
              @Copy('age') age: Optional<number>,
              @Copy('gender') gender: Optional<GenderMarker>) {
    this.name = name;
    this.age = age;
    this.gender = gender;
  }

  static of(name: string, age?: OptionalOrNothing<number>, gender?: OptionalOrNothing<GenderMarker>) {
    return new Person(name, Optional.of(age), Optional.of(gender));
  }
}

@Entity
export class Optional<T> {
  @EntityField()
  readonly value: T | null;

  constructor(@Copy('value') value: OptionalOrNothing<T>) {
    if (value === undefined) {
      value = null;
    }

    this.value = value;
  }

  isEmpty(): boolean {
    return this.value === null;
  }

  static of<T>(value?: OptionalOrNothing<T>) {
    return new Optional<T>(value);
  }
}

export interface Optional<T> extends EntityInterface<T> {}
export interface Person extends EntityInterface<Person> {}