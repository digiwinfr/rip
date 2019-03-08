import 'reflect-metadata';

import { METADATA_PREFIX, RipMetadata } from './metadata';
import { RipVerb } from './verb';
import { RipPath } from './args/path';
import { RipQuery } from './args/query';

export class RipConfig {

  public verb: RipVerb;
  public url: string;
  public pathes: RipPath[];
  public queries: RipQuery[];

  public constructor(target, propertyKey: string) {
    this.findRipDecoratorNames(target, propertyKey)
      .forEach((decoratorName) => {
        this.configure(target, propertyKey, decoratorName);
      });
  }

  private findRipDecoratorNames(target, propertyKey: string): string[] {
    const ripDecorators = [];
    Reflect.getMetadataKeys(target, propertyKey).forEach((name) => {
      if (name.startsWith(METADATA_PREFIX)) {
        ripDecorators.push(name);
      }
    });
    return ripDecorators;
  }

  private configure(target, propertyKey: string, decoratorName: string) {
    const value = Reflect.getMetadata(decoratorName, target, propertyKey);
    switch (decoratorName) {
      case RipMetadata.VERB:
        this.verb = value;
        break;
      case RipMetadata.URL:
        this.url = value;
        break;
      case RipMetadata.PATHES:
        this.pathes = value;
        break;
      case RipMetadata.QUERIES:
        this.queries = value;
        break;
    }
  }

}
