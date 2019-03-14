import 'reflect-metadata';
import { Metadata, METADATA_PREFIX } from './metadata';
import { HTTPVerb } from './HTTPVerb';
import { ParameterValue } from './values/parameterValue';
import { RequestConfigurator } from './requestConfigurator';
import { BodyValue } from './values/bodyValue';
import { PartValue } from './values/partValue';
import { Serializable } from './serializable';

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
        Reflect.defineMetadata(Metadata.BODY, new BodyValue(index), target, propertyKey);
      };
    };
  }

  public static buildParameterDecorator(metadata: Metadata.PATHS | Metadata.QUERIES | Metadata.HEADERS | Metadata.FIELDS) {
    return (name: string) => {
      return (target, propertyKey: string, index: number) => {
        const parameters = Reflect.getOwnMetadata(metadata, target, propertyKey) as ParameterValue[] || [];
        parameters[index] = new ParameterValue(index, name);
        Reflect.defineMetadata(metadata, parameters, target, propertyKey);
      };
    };
  }

  public static buildPartDecorator() {
    return (name: string) => {
      return (target, propertyKey: string, index: number) => {
        const parts = Reflect.getOwnMetadata(Metadata.PARTS, target, propertyKey) as PartValue[] || [];
        parts[index] = new PartValue(index, name);
        Reflect.defineMetadata(Metadata.PARTS, parts, target, propertyKey);
      };
    };
  }

  public static buildVerbDecorator(verb: HTTPVerb) {
    return (url: string) => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

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

  private static setParametersValues(
    metadata: Metadata.PATHS | Metadata.QUERIES | Metadata.HEADERS | Metadata.FIELDS,
    args: any[], target, propertyKey: string) {
    const parameters = Reflect.getOwnMetadata(metadata, target, propertyKey) as ParameterValue[] || [];
    for (const parameter of parameters) {
      if (parameter.index !== null) {
        parameter.value = args[parameter.index] as string;
      }
    }
  }

  private static setPartsValues(args: any[], target, propertyKey: string) {
    const parts = Reflect.getOwnMetadata(Metadata.PARTS, target, propertyKey) as PartValue[] || [];
    for (const part of parts) {
      if (part.index !== null) {
        part.value = args[part.index] as Serializable;
      }
    }
  }

  private static setBodyValue(args: any[], target, propertyKey: string) {
    const body = Reflect.getOwnMetadata(Metadata.BODY, target, propertyKey) as BodyValue || null;
    if (body !== null) {
      body.value = args[body.index] as Serializable;
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
    return (headersArray: [string, string][]) => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        const headers = Reflect.getOwnMetadata(Metadata.HEADERS, target, propertyKey) || [];
        for (const header of headersArray) {
          headers.push(new ParameterValue(null, header[0], header[1]));
        }
        Reflect.defineMetadata(Metadata.HEADERS, headers, target, propertyKey);
      };
    };
  }

  public static buildMultipartDecorator() {
    return () => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(Metadata.MULTIPART, true, target, propertyKey);
        const originalMethod = descriptor.value;
        descriptor.value = (...args: any[]) => {
          this.setPartsValues(args, target, propertyKey);
          return originalMethod.apply(this, args);
        };

        return descriptor;
      };
    };
  }

  public static buildFormUrlEncodedDecorator() {
    return () => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(Metadata.FORM_URL_ENCODED, true, target, propertyKey);
        const originalMethod = descriptor.value;
        descriptor.value = (...args: any[]) => {
          this.setParametersValues(Metadata.FIELDS, args, target, propertyKey);
          return originalMethod.apply(this, args);
        };
        return descriptor;
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
export const FormUrlEncoded = Builder.buildFormUrlEncodedDecorator();
export const Multipart = Builder.buildMultipartDecorator();

// Parameter decorators
export const Query = Builder.buildParameterDecorator(Metadata.QUERIES);
export const Path = Builder.buildParameterDecorator(Metadata.PATHS);
export const Header = Builder.buildParameterDecorator(Metadata.HEADERS);
export const Body = Builder.buildBodyDecorator();
export const Field = Builder.buildParameterDecorator(Metadata.FIELDS);
export const Part = Builder.buildPartDecorator();
