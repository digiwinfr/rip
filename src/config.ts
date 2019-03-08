import 'reflect-metadata';

import { METADATA_PREFIX } from './metadata';
import { RipVerb } from './verb';
import { RipArg } from './arg';

export class RipConfig {

  public verb: RipVerb = null;

  public url: string = null;

  public pathes: RipArg[] = [];

  public queries: RipArg[] = [];

  public body: RipArg = null;

  public constructor(target, propertyKey: string) {
    this.findDecoratorNames(target, propertyKey)
      .forEach((decoratorName) => {
        this.setValue(target, propertyKey, decoratorName);
      });
  }

  private findDecoratorNames(target, propertyKey: string): string[] {
    const decorators = [];
    Reflect.getMetadataKeys(target, propertyKey).forEach((name) => {
      if (name.startsWith(METADATA_PREFIX)) {
        decorators.push(name);
      }
    });
    return decorators;
  }

  private setValue(target, propertyKey: string, decoratorName: string) {
    const value = Reflect.getMetadata(decoratorName, target, propertyKey);
    const property = decoratorName.slice(METADATA_PREFIX.length);
    if (this.hasOwnProperty(property)) {
      this[property] = value;
    } else {
      throw Error('The property \'' + property + '\' doesn\'t exist on configuration');
    }
  }
}
