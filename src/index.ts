import { Person } from './entity';

const name = 'Alexandra';
const age = 52
const gender = 'F'

const alexandra = Person.of(name, age, gender);
const alexandraHenson = Person.of('Alexandra', 52, 'F');

console.log(alexandra.copy().isEqual(alexandraHenson));