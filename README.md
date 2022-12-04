# ts-entities 0.0.1

## What is this?
ts-entities is intended to make dealing with your application data easier, 
faster, and safer. This library adds decorators that make it quick and easy to 
extend your data classes with additional functionality like deep equality 
checking and copying.

## Usage

```typescript
// Assume these lines precede all examples below
import { 
  Entity, 
  Compare, 
  Copyable, 
  Copy, 
  EntityField,
  EntityInterface
} from 'ts-entities';

type ValueOrNothing<T> = T | null | undefined;
```
One of the simplest uses of ts-entities decorators is to add deep equality 
checks to your data structures<sup>[1](#notes)</sup>:

```typescript
@Entity
class Optional<T> {
  @Comparable()
  public readonly value: T | null;

  constructor(input?: ValueOrNothing<T>) {
    this.value = input ? input : null;
  }
}

/** 
 * This is how we indicate to the compiler that Optional
 * is going to be extended with the methods implemented
 * by @Entity. If we omit this, the compiler will not
 * recognize that an Optional should have, for instance,
 * an isEqual method.
 */
interface Optional<T> extends EntityInterface<Optional<T>> {}

const oldId = new Optional(25);
const newId = new Optional(25);

console.log(oldId === newId); // => false
console.log(oldId.isEqual(newId)); // => true
```
Any field *not* decorated with `@Comparable` will be ignored when comparing 
with `isEqual`:
```typescript
@Entity
class Optional<T> {
  @Comparable()
  public readonly value: T|null;
  
  public readonly foo: number;
  
  constructor(input?: ValueOrNothing<T>, foo?: number) {
    this.value = input ? input : null;
    this.foo = foo ? foo : 0;
  }
}

interface Optional<T> extends EntityInterface<Optional<T>> {}

const oldId = new Optional(25, 1);
const newId = new Optional(25, 1000000);

// oldId.foo and newId.foo are ignored
console.log(oldId.isEqual(newId)); // => true
```
ts-entities also adds powerful copy-constructor-like functionality to your data
structures<sup>[2](#notes)</sup>:
```typescript
@Entity
class Optional<T> {
  @Copyable()
  public readonly value: T|null;
  
  // Argument to @Copy is the field name, not the 
  // parameter name (ie. 'value', not 'input')
  constructor(@Copy('value') input?: ValueOrNothing<T>) {
    this.value = input ? input : null;
  }
}

/**
 * In this case, not only does this inform the compiler
 * that it should expect Optional to be extended with
 * @Entity methods, but it also hints at the return type
 * of copy - In this case, Optional<number>.
 */
interface Optional<T> extends EntityInterface<Optional<T>> {}

const id = new Optional(25);

console.log(id.copy().value); // => 25
```
The `@EntityField` decorator is provided for convenience, as it is often
desirable to annotate a field as both `@Comparable` and `@Copyable`. Using 
`@EntityField` is exactly equivalent to annotating a field as both `@Comparable`
and `@Copyable`:
```typescript
@Entity
class Optional<T> {
  @EntityField()
  public readonly value: T|null;
  
  constructor(@Copy('value') input?: ValueOrNothing<T>) {
    this.value = input ? input : null;
  }
}

interface Optional<T> extends EntityInterface<Optional<T>> {}

const id = new Optional(25);

console.log(id.copy().isEqual(id)); // => true
```

Putting it all together:

```typescript
import { EntityField } from './decorators';
import { EntityInterface } from './types';

@Entity
class Optional<T> {
  @EntityField()
  public readonly value: T | null;

  constructor(@Copy('value') value?: ValueOrNothing<T>) {
    this.value = value ? value : null;
  }
}

@Entity
class Person {
  @EntityField()
  public readonly name: string; // Will be shallow copied
  @EntityField()
  public readonly age: Optional<number>; // Will be copied with age.copy()

  constructor(@Copy('name') name: string,
              @Copy('age') age: Optional<number>) {
    this.name = name;
    this.age = age;
  }
}

interface Optional<T> extends EntityInterface<Optional<T>> {}
interface Person extends EntityInterface<Person> {}

const name = 'Adam Gibson';
const age = new Optional(53);

const adam = new Person(name, age);

console.log(adam.copy().isEqual(adam)); // => true
```

### Notes
<sup>1</sup> Equality of most non-`@Entity` fields is determined with `===`, 
while equality of all `@Entity` fields is determined using their own `isEqual` 
methods. The exception is arrays, which will be compared per-element by the same 
rules (ie. `===` for non-`@Entity` elements, `isEqual` for `@Entity` elements).

<sup>2</sup> A very similar rule to [1](#notes) applies to `copy`, which will
shallow-copy non-`@Entity` fields and `copy` any `@Entity` fields, except for
arrays, where the same rules are applied per-element.

## API docs
API documentation can be found here: [API docs](https://anihopkins.github.io/ts-entities).

## Contributing
Pull requests are welcome!

## License
This project is licensed under an MIT license - see 
[LICENSE](https://github.com/anihopkins/ts-entities/blob/main/LICENSE).