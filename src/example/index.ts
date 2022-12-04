import { GenderMarker, Person } from './entity';

const name = 'Noemi';
const age = 20;
const genders: GenderMarker[] = ['F', 'X'];

const noemi = Person.of(name, age, genders);
const noemi2 = Person.of(name, age, genders);
const katie = Person.of('Katie', 30, <GenderMarker[]>['F']);

console.log(noemi.isEqual(noemi2.copy())); // true
console.log(noemi.isEqual(katie)); // false