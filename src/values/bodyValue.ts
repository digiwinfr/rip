import { Serializable } from '../serializable';

export class BodyValue {

  index: number;

  value: Serializable;

  constructor(index: number) {
    this.index = index;
  }
}
