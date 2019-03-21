import { Serializable } from './serialization/serializable';

export class Utils {
  public static isScalar(value: any): boolean {
    return value === null ||
      typeof value === 'undefined' ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean';
  }

  public static isSerializable(object: any): object is Serializable {
    const serializable = object as Serializable;
    return serializable.serialize !== undefined;
  }
}
