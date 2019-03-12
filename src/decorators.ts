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
        const body: Parameter = Reflect.getOwnMetadata(Metadata.BODY, target, propertyKey);
        if (body !== undefined) {
          throw Error('The method \'' + target.constructor.name + '.' + propertyKey + '\' has two @Body decorators');
        }
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

        this.checkBodyCompatibility(target, propertyKey, verb);

        Reflect.defineMetadata(Metadata.VERB, verb, target, propertyKey);

        Reflect.defineMetadata(Metadata.URL, url, target, propertyKey);

        descriptor.value = this.verbDecoratorRuntime(descriptor.value, target, propertyKey);

        return descriptor;
      };
    };
  }

  private static verbDecoratorRuntime(originalMethod, target, propertyKey) {
    return (...args: any[]) => {
      Reflect.deleteMetadata(Metadata.CONFIGURATION, target, propertyKey);

      this.copyMetadataFromClassToMethod(target, propertyKey);
      this.setParametersValues(Metadata.QUERIES, args, target, propertyKey);
      this.setParametersValues(Metadata.PATHS, args, target, propertyKey);
      this.setParametersValues(Metadata.BODY, args, target, propertyKey);

      const configurator = new RequestConfigurator(target, propertyKey);
      const configuration = configurator.configure();

      Reflect.defineMetadata(Metadata.CONFIGURATION, configuration, target, propertyKey);

      return originalMethod.apply(this, args);
    };
  }

  private static checkBodyCompatibility(target, propertyKey: string, verb: HTTPVerb) {
    if (Reflect.hasMetadata(Metadata.BODY, target, propertyKey) && (verb === HTTPVerb.GET || verb === HTTPVerb.HEAD)) {
      throw Error('@Body decorator is not compatible with @' + verb + ' decorator');
    }
  }

  private static setParametersValues(
    metadata: Metadata.PATHS | Metadata.QUERIES | Metadata.BODY,
    args: any[], target, propertyKey: string) {
    const metadataValue = Reflect.getOwnMetadata(metadata, target, propertyKey);
    if (metadataValue instanceof Array) {
      for (const parameter of (metadataValue as Parameter[])) {
        parameter.value = args[parameter.index];
      }
    } else if (metadataValue !== undefined) {
      (metadataValue as Parameter).value = args[metadataValue.index];
    }
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
