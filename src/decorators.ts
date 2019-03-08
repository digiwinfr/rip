import 'reflect-metadata';
import { Metadata } from './metadata';
import { HTTPVerb } from './HTTPVerb';
import { Parameter } from './parameter';
import { RequestConfigurator } from './requestConfigurator';


class Builder {

  static buildBodyDecorator() {
    return () => {
      return (target, propertyKey: string, index: number) => {
        Reflect.defineMetadata(Metadata.BODY, new Parameter(index), target, propertyKey);
      };
    };
  }

  static buildParameterDecorator(metadata: Metadata.PATHS | Metadata.QUERIES) {
    return (name: string) => {
      return (target, propertyKey: string, index: number) => {
        const parameters: Parameter[] = Reflect.getOwnMetadata(metadata, target, propertyKey) || [];
        parameters.push(new Parameter(index, name));
        Reflect.defineMetadata(metadata, parameters, target, propertyKey);
      };
    };
  }

  static buildVerbDecorator(verb: HTTPVerb) {
    return (url: string) => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

        Reflect.defineMetadata(Metadata.VERB, verb, target, propertyKey);

        Reflect.defineMetadata(Metadata.URL, url, target, propertyKey);

        const originalMethod = descriptor.value;

        descriptor.value = (...args: any[]) => {

          const paths = Reflect.getOwnMetadata(Metadata.PATHS, target, propertyKey) || [];
          for (const path of paths) {
            path.value = args[path.index];
          }

          const queries = Reflect.getOwnMetadata(Metadata.QUERIES, target, propertyKey) || [];
          for (const query of queries) {
            query.value = args[query.index];
          }

          const body = Reflect.getOwnMetadata(Metadata.BODY, target, propertyKey);
          if (body != null) {
            body.value = args[body.index];
          }

          const configurator = new RequestConfigurator(target, propertyKey);
          const configuration = configurator.configure();
          console.log(configuration);

          return originalMethod.apply(this, args);
        };
        return descriptor;
      };
    };
  }
}

export const Query = Builder.buildParameterDecorator(Metadata.QUERIES);
export const Path = Builder.buildParameterDecorator(Metadata.PATHS);
export const Body = Builder.buildBodyDecorator();
export const GET = Builder.buildVerbDecorator(HTTPVerb.GET);
export const POST = Builder.buildVerbDecorator(HTTPVerb.POST);
export const PATCH = Builder.buildVerbDecorator(HTTPVerb.PATCH);
export const PUT = Builder.buildVerbDecorator(HTTPVerb.PUT);
export const DELETE = Builder.buildVerbDecorator(HTTPVerb.DELETE);
