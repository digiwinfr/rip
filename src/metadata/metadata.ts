import { Parameter } from '../parameter';
import { Serializable } from '../serialization/serializable';
import { Utils } from '../utils';

export class Metadata {

  public value: any;

  constructor(value: any) {
    this.value = value;
  }

  public toPrimitive(): any {
    let primitive = null;
    if (Utils.isScalar(this.value) || typeof this.value === 'function') {
      primitive = this.value;
    } else if (Utils.isSerializable(this.value)) {
      primitive = (this.value as Serializable).serialize();
    } else if (this.value instanceof Parameter) {
      primitive = (this.value as Parameter).toPrimitive();
    } else if (this.isArrayOfParameters(this.value)) {
      primitive = this.parametersArrayToObject(this.value);
    } else {
      primitive = JSON.stringify(this.value);
    }
    return primitive;
  }

  private isArrayOfParameters(value: any): boolean {
    return value instanceof Array && value.length > 0 && value[0] instanceof Parameter;
  }

  private parametersArrayToObject(parameters: Parameter[]): {} {
    const object = {};
    for (const parameter of parameters) {
      object[parameter.key] = parameter.toPrimitive();
    }
    return object;
  }
}
