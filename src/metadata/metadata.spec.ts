import { Metadata } from './metadata';
import { Serializable } from '../serialization/serializable';
import { Parameter } from '../parameter';

describe('Metadata conversion to primitive', () => {

  class Stuff implements Serializable {
    public name: string;

    constructor(name: string) {
      this.name = name;
    }

    serialize(): string {
      return this.name;
    }
  }

  it('should return a string value', () => {
    const metadata = new Metadata('Leonard');
    expect(metadata.toPrimitive()).toBe('Leonard');
  });

  it('should return a number value', () => {
    const metadata = new Metadata(9);
    expect(metadata.toPrimitive()).toBe(9);
  });

  it('should return a null value', () => {
    const metadata = new Metadata(null);
    expect(metadata.toPrimitive()).toBe(null);
  });

  it('should return a boolean value', () => {
    const metadata = new Metadata(true);
    expect(metadata.toPrimitive()).toBe(true);
  });

  it('should return an undefined value', () => {
    const metadata = new Metadata(undefined);
    expect(metadata.toPrimitive()).toBe(undefined);
  });

  it('should return a serialized value', () => {
    const metadata = new Metadata(new Stuff('John'));
    expect(metadata.toPrimitive()).toBe('John');
  });

  it('should return a string value from parameter', () => {
    const metadata = new Metadata(new Parameter(1, 'my-key', 'my-value'));
    expect(metadata.toPrimitive()).toBe('my-value');
  });

  it('should return a number value from parameter', () => {
    const metadata = new Metadata(new Parameter(1, 'my-key', 8));
    expect(metadata.toPrimitive()).toBe(8);
  });

  it('should return a boolean value from parameter', () => {
    const metadata = new Metadata(new Parameter(1, 'my-key', true));
    expect(metadata.toPrimitive()).toBe(true);
  });

  it('should return a serialized value from parameter', () => {
    const metadata = new Metadata(new Parameter(1, 'my-key', new Stuff('Superman')));
    expect(metadata.toPrimitive()).toBe('Superman');
  });

  it('should return a json stringified value from parameter', () => {
    const metadata = new Metadata({ name: 'Superman' });
    expect(metadata.toPrimitive()).toEqual(JSON.stringify({
      name: 'Superman'
    }));
  });

  it('should return an object value from parameter', () => {
    const metadata = new Metadata([
        new Parameter(1, 'key-1', 'value 1'),
        new Parameter(2, 'key-2', 2),
        new Parameter(3, 'key-3', true),
        new Parameter(4, 'key-4', new Stuff('Iron man')),
        new Parameter(4, 'key-5', { name: 'Tony Stark' })
      ]
    );
    expect(metadata.toPrimitive()).toEqual({
      'key-1': 'value 1',
      'key-2': 2,
      'key-3': true,
      'key-4': 'Iron man',
      'key-5': JSON.stringify({
        name: 'Tony Stark'
      })
    });
  });

});
