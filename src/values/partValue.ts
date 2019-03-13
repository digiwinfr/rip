import { KeyValue } from './keyValue';
import { Serializable } from '../serializable';

export class PartValue extends KeyValue<Serializable> {

  public index: number;

  constructor(index: number, key?: string, value?: Serializable) {
    super(key, value);
    this.index = index;
  }
}
