import 'reflect-metadata';

import { METADATA_PREFIX } from './metadata';
import { RequestConfiguration } from './requestConfiguration';

export class RequestConfigurator {

  private target;

  private propertyKey: string;

  private configuration: RequestConfiguration;

  public constructor(target, propertyKey: string) {
    this.target = target;
    this.propertyKey = propertyKey;
    this.configuration = new RequestConfiguration();
  }

  public configure(): RequestConfiguration {
    this.findDecoratorNames().forEach((decoratorName) => {
      this.applyValue(decoratorName);
    });
    return this.configuration;
  }

  private findDecoratorNames(): string[] {
    const decorators = [];
    Reflect.getMetadataKeys(this.target, this.propertyKey).forEach((name) => {
      if (name.startsWith(METADATA_PREFIX)) {
        decorators.push(name);
      }
    });
    return decorators;
  }

  private applyValue(decoratorName: string) {
    const value = Reflect.getMetadata(decoratorName, this.target, this.propertyKey);
    const property = decoratorName.slice(METADATA_PREFIX.length);
    if (this.configuration.hasOwnProperty(property)) {
      this.configuration[property] = value;
    } else {
      throw Error('The property \'' + property + '\' doesn\'t exist on RequestConfiguration');
    }
  }
}
