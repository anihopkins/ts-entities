import { Copy, Entity, EntityField, EntityInterface } from '../decorators';

export type OptionalOrNothing<T> = T | null | undefined;
export type GenderMarker = 'M' | 'F' | 'X';

@Entity
export class Person {
  @EntityField()
  readonly name: string;

  @EntityField()
  readonly age: Optional<number>;

  @EntityField()
  readonly genders: Optional<GenderMarker>[];

  constructor(@Copy('name') name: string,
              @Copy('age') age: Optional<number>,
              @Copy('genders') genders: Optional<GenderMarker>[]) {
    this.name = name;
    this.age = age;
    this.genders = genders;
  }

  static of(name: string,
            age?: OptionalOrNothing<number>,
            genders?: OptionalOrNothing<GenderMarker[]>) {
    genders = genders ? genders : [];

    return new Person(name, Optional.of(age), genders.map(Optional.of));
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

  static of<T>(value?: OptionalOrNothing<T>) {
    return new Optional<T>(value);
  }
}

export interface Optional<T> extends EntityInterface<Optional<T>> {}
export interface Person extends EntityInterface<Person> {}