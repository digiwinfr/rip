import { Serializable } from './serialization/serializable';
import { Utils } from './utils';

export class Parameter {

  public index: number;

  public key: string;

  public value: any;

  constructor(index: number, key?: string, value?: any) {
    this.index = index;
    this.key = key;
    this.value = value;
  }

  public toPrimitive(): any {
    let primitive = null;
    if (Utils.isScalar(this.value)) {
      primitive = this.value;
    } else if (Utils.isSerializable(this.value)) {
      primitive = (this.value as Serializable).serialize();
    } else {
      primitive = JSON.stringify(this.value);
    }
    return primitive;
  }

}
