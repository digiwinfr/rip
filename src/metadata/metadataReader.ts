import 'reflect-metadata';

import { METAKEY_PREFIX } from './metakey';
import { RequestDefinition } from '../requestDefinition';
import { Metadata } from './metadata';

export class MetadataReader {

  private clazz;

  private method: string;

  private definition: RequestDefinition;

  public constructor(clazz, method: string) {
    this.clazz = clazz;
    this.method = method;
    this.definition = new RequestDefinition();
  }

  public read(): RequestDefinition {
    this.findRipMetakeys().forEach((metakey) => {
      this.applyValue(metakey);
    });
    return this.definition;
  }

  private findRipMetakeys(): string[] {
    const metakeys = [];
    const keys = Reflect.getMetadataKeys(this.clazz, this.method);
    keys.forEach((name) => {
      if (name.startsWith(METAKEY_PREFIX)) {
        metakeys.push(name);
      }
    });
    return metakeys;
  }

  private applyValue(metakey: string) {
    const metadata = Reflect.getMetadata(metakey, this.clazz, this.method) as Metadata;
    const property = metakey.slice(METAKEY_PREFIX.length);
    if (!this.definition.hasOwnProperty(property)) {
      throw Error('The property \'' + property + '\' doesn\'t exist on RequestDefinition');
    }
    this.definition[property] = metadata.toPrimitive();
  }

}
