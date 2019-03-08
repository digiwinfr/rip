import 'reflect-metadata';
import { RipConfig } from './config';
import { RipMetadata } from './metadata';
import { RipVerb } from './verb';
import { RipArg } from './arg';


class Builder {

  static buildBodyDecorator() {
    return () => {
      return (target, propertyKey: string, index: number) => {
        Reflect.defineMetadata(RipMetadata.BODY, new RipArg(index), target, propertyKey);
      };
    };
  }

  static buildParamDecorator(metadata: RipMetadata.PATHS | RipMetadata.QUERIES) {
    return (name: string) => {
      return (target, propertyKey: string, index: number) => {
        const args: RipArg[] = Reflect.getOwnMetadata(metadata, target, propertyKey) || [];
        args.push(new RipArg(index, name));
        Reflect.defineMetadata(metadata, args, target, propertyKey);
      };
    };
  }

  static buildVerbDecorator(verb: RipVerb) {
    return (url: string) => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

        Reflect.defineMetadata(RipMetadata.VERB, verb, target, propertyKey);

        Reflect.defineMetadata(RipMetadata.URL, url, target, propertyKey);

        const originalMethod = descriptor.value;

        descriptor.value = (...args: any[]) => {

          const paths = Reflect.getOwnMetadata(RipMetadata.PATHS, target, propertyKey) || [];
          for (const path of paths) {
            path.value = args[path.index];
          }

          const queries = Reflect.getOwnMetadata(RipMetadata.QUERIES, target, propertyKey) || [];
          for (const query of queries) {
            query.value = args[query.index];
          }

          const body = Reflect.getOwnMetadata(RipMetadata.BODY, target, propertyKey);
          if (body != null) {
            body.value = args[body.index];
          }

          const config = new RipConfig(target, propertyKey);
          console.log(config);

          return originalMethod.apply(this, args);
        };
        return descriptor;
      };
    };
  }
}

export const Query = Builder.buildParamDecorator(RipMetadata.QUERIES);
export const Path = Builder.buildParamDecorator(RipMetadata.PATHS);
export const Body = Builder.buildBodyDecorator();
export const GET = Builder.buildVerbDecorator(RipVerb.GET);
export const POST = Builder.buildVerbDecorator(RipVerb.POST);
export const PATCH = Builder.buildVerbDecorator(RipVerb.PATCH);
export const PUT = Builder.buildVerbDecorator(RipVerb.PUT);
export const DELETE = Builder.buildVerbDecorator(RipVerb.DELETE);
