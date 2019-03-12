import 'reflect-metadata';

import { METADATA_PREFIX } from './metadata';
import { RequestConfiguration } from './requestConfiguration';

export class RequestConfigurator {

  private clazz;

  private method: string;

  private configuration: RequestConfiguration;

  public constructor(clazz, method: string) {
    this.clazz = clazz;
    this.method = method;
    this.configuration = new RequestConfiguration();
  }

  public configure(): RequestConfiguration {
    this.findRipDecoratorNames().forEach((decoratorName) => {
      this.applyValue(decoratorName);
    });
    return this.configuration;
  }

  private findRipDecoratorNames(): string[] {
    const decorators = [];
    const metadataKeys = Reflect.getMetadataKeys(this.clazz, this.method);
    metadataKeys.forEach((name) => {
      if (name.startsWith(METADATA_PREFIX)) {
        decorators.push(name);
      }
    });
    return decorators;
  }

  private applyValue(decoratorName: string) {
    const value = Reflect.getMetadata(decoratorName, this.clazz, this.method);
    const property = decoratorName.slice(METADATA_PREFIX.length);
    if (this.configuration.hasOwnProperty(property)) {
      this.configuration[property] = value;
    } else {
      throw Error('The property \'' + property + '\' doesn\'t exist on RequestConfiguration');
    }
  }
}
