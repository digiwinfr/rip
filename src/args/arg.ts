export abstract class RipArg {

  index: number;

  name: string;

  value: any;


  constructor(index: number, name: string, value?: any) {
    this.index = index;
    this.name = name;
    this.value = value;
  }
}
