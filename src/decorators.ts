import 'reflect-metadata';
import { Metadata, METADATA_PREFIX } from './metadata';
import { HTTPVerb } from './HTTPVerb';
import { ParameterValue } from './values/parameterValue';
import { RequestConfigurator } from './requestConfigurator';
import { BodyValue } from './values/bodyValue';

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
        const body = Reflect.getOwnMetadata(Metadata.BODY, target, propertyKey) as BodyValue || null;
        if (body !== null) {
          throw Error('The method \'' + target.constructor.name + '.' + propertyKey + '\' has two @Body decorators');
        }
        Reflect.defineMetadata(Metadata.BODY, new BodyValue(index), target, propertyKey);
      };
    };
  }

  public static buildParameterDecorator(metadata: Metadata.PATHS | Metadata.QUERIES | Metadata.HEADERS) {
    return (name: string) => {
      return (target, propertyKey: string, index: number) => {
        const parameters = Reflect.getOwnMetadata(metadata, target, propertyKey) as ParameterValue[] || [];
        parameters[index] = new ParameterValue(index, name);
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
      this.setParametersValues(Metadata.HEADERS, args, target, propertyKey);
      this.setParametersValues(Metadata.QUERIES, args, target, propertyKey);
      this.setParametersValues(Metadata.PATHS, args, target, propertyKey);
      this.setBodyValue(args, target, propertyKey);

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
    metadata: Metadata.PATHS | Metadata.QUERIES | Metadata.HEADERS,
    args: any[], target, propertyKey: string) {
    const parameters = Reflect.getOwnMetadata(metadata, target, propertyKey) as ParameterValue[] || [];
    for (const parameter of parameters) {
      if (parameter.index !== null) {
        parameter.value = args[parameter.index];
      }
    }
  }

  private static setBodyValue(args: any[], target, propertyKey: string) {
    const body = Reflect.getOwnMetadata(Metadata.BODY, target, propertyKey) as BodyValue || null;
    if (body !== null) {
      body.value = args[body.index];
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

  public static buildHeadersDecorator() {
    return (object: {}) => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        const headers = Reflect.getOwnMetadata(Metadata.HEADERS, target, propertyKey) || [];
        for (const key in object) {
          if (object.hasOwnProperty(key)) {
            headers.push(new ParameterValue(null, key, object[key]));
          }
        }
        Reflect.defineMetadata(Metadata.HEADERS, headers, target, propertyKey);
      };
    };
  }
}

// Class decorators
export const BaseUrl = Builder.buildBaseUrlDecorator();

// Method decorators
export const GET = Builder.buildVerbDecorator(HTTPVerb.GET);
export const POST = Builder.buildVerbDecorator(HTTPVerb.POST);
export const PATCH = Builder.buildVerbDecorator(HTTPVerb.PATCH);
export const PUT = Builder.buildVerbDecorator(HTTPVerb.PUT);
export const DELETE = Builder.buildVerbDecorator(HTTPVerb.DELETE);
export const Headers = Builder.buildHeadersDecorator();

// Parameter decorators
export const Query = Builder.buildParameterDecorator(Metadata.QUERIES);
export const Path = Builder.buildParameterDecorator(Metadata.PATHS);
export const Header = Builder.buildParameterDecorator(Metadata.HEADERS);
export const Body = Builder.buildBodyDecorator();
