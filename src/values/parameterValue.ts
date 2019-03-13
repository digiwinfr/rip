import { KeyValue } from './keyValue';

export class ParameterValue extends KeyValue<string> {

  public index: number;

  constructor(index: number, key?: string, value?: string) {
    super(key, value);
    this.index = index;
  }
}
