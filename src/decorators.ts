import 'reflect-metadata';
import { Metadata, METADATA_PREFIX } from './metadata';
import { HTTPVerb } from './HTTPVerb';
import { Parameter } from './parameter';
import { RequestConfigurator } from './requestConfigurator';

class Builder {

  public static buildBaseUrlDecorator() {
    return (baseUrl: string) => {
      return (target) => {
        Reflect.defineMetadata(Metadata.BASE_URL, baseUrl, target);
      };
    };
  }

  public static buildBodyDecorator() {
    return () => {
      return (target, propertyKey: string, index: number) => {
        Reflect.defineMetadata(Metadata.BODY, new Parameter(index), target, propertyKey);
      };
    };
  }

  public static buildParameterDecorator(metadata: Metadata.PATHS | Metadata.QUERIES) {
    return (name: string) => {
      return (target, propertyKey: string, index: number) => {
        const parameters: Parameter[] = Reflect.getOwnMetadata(metadata, target, propertyKey) || [];
        parameters[index] = new Parameter(index, name);
        Reflect.defineMetadata(metadata, parameters, target, propertyKey);
      };
    };
  }

  public static buildVerbDecorator(verb: HTTPVerb) {
    return (url: string) => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

        Reflect.defineMetadata(Metadata.VERB, verb, target, propertyKey);

        Reflect.defineMetadata(Metadata.URL, url, target, propertyKey);

        const originalMethod = descriptor.value;

        descriptor.value = (...args: any[]) => {


          Reflect.deleteMetadata(Metadata.CONFIGURATION, target, propertyKey);

          this.copyMetadataFromClassToMethod(target, propertyKey);

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

          Reflect.defineMetadata(Metadata.CONFIGURATION, configuration, target, propertyKey);

          return originalMethod.apply(this, args);
        };
        return descriptor;
      };
    };
  }

  private static copyMetadataFromClassToMethod(target, propertyKey: string) {
    const classMetadataKeys = Reflect.getMetadataKeys(target.constructor);
    classMetadataKeys.forEach((key: string) => {
      if (key.startsWith(METADATA_PREFIX)) {
        const value = Reflect.getMetadata(key, target.constructor);
        Reflect.defineMetadata(key, value, target, propertyKey);
      }
    });
  }
}

export const BaseUrl = Builder.buildBaseUrlDecorator();
export const Query = Builder.buildParameterDecorator(Metadata.QUERIES);
export const Path = Builder.buildParameterDecorator(Metadata.PATHS);
export const Body = Builder.buildBodyDecorator();
export const GET = Builder.buildVerbDecorator(HTTPVerb.GET);
export const POST = Builder.buildVerbDecorator(HTTPVerb.POST);
export const PATCH = Builder.buildVerbDecorator(HTTPVerb.PATCH);
export const PUT = Builder.buildVerbDecorator(HTTPVerb.PUT);
export const DELETE = Builder.buildVerbDecorator(HTTPVerb.DELETE);
