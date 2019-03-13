import { KeyValue } from './keyValue';

export class ParameterValue extends KeyValue<string> {

  public index: number;

  constructor(index: number, key?: string, value?: any) {
    super(key, value);
    this.index = index;
  }
}
