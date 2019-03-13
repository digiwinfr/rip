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
        const body = Reflect.getOwnMetadata(Metadata.BODY, target, propertyKey) as BodyValue || null;
        if (body !== null) {
          throw Error('The method \'' + target.constructor.name + '.' + propertyKey + '\' has two @Body decorators');
        }
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

        this.checkDecoratorsCompatibilities(target, propertyKey, verb);

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
      this.setParametersValues(Metadata.FIELDS, args, target, propertyKey);
      this.setPartsValues(args, target, propertyKey);
      this.setBodyValue(args, target, propertyKey);

      const configurator = new RequestConfigurator(target, propertyKey);
      const configuration = configurator.configure();

      Reflect.defineMetadata(Metadata.CONFIGURATION, configuration, target, propertyKey);

      return originalMethod.apply(this, args);
    };
  }

  private static checkDecoratorsCompatibilities(target, propertyKey: string, verb: HTTPVerb) {
    if (Reflect.hasMetadata(Metadata.BODY, target, propertyKey) && (verb === HTTPVerb.GET || verb === HTTPVerb.HEAD)) {
      throw Error('@Body decorator is not compatible with @' + verb + ' decorator');
    }

    if (Reflect.hasMetadata(Metadata.FORM_URL_ENCODED, target, propertyKey) && (verb === HTTPVerb.GET || verb === HTTPVerb.HEAD)) {
      throw Error('@FormUrlEncoded decorator is not compatible with @' + verb + ' decorator');
    }

    if (Reflect.hasMetadata(Metadata.MULTIPART, target, propertyKey) && (verb === HTTPVerb.GET || verb === HTTPVerb.HEAD)) {
      throw Error('@Multipart decorator is not compatible with @' + verb + ' decorator');
    }

    if (Reflect.hasMetadata(Metadata.FIELDS, target, propertyKey) && !Reflect.hasMetadata(Metadata.FORM_URL_ENCODED, target, propertyKey)) {
      throw Error('@Field decorators must be used in combination with @FormUrlEncoded decorator');
    }

    if (Reflect.hasMetadata(Metadata.PARTS, target, propertyKey) && !Reflect.hasMetadata(Metadata.MULTIPART, target, propertyKey)) {
      throw Error('@Part decorators must be used in combination with @Multipart decorator');
    }

    if (Reflect.hasMetadata(Metadata.MULTIPART, target, propertyKey) &&
      Reflect.hasMetadata(Metadata.FORM_URL_ENCODED, target, propertyKey)) {
      throw Error('@Multipart and @FormUrlEncoded decorators cannot be used is combination');
    }
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

  public static buildBooleanDecorator(metadata: Metadata.FORM_URL_ENCODED | Metadata.MULTIPART) {
    return () => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(metadata, true, target, propertyKey);
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
export const FormUrlEncoded = Builder.buildBooleanDecorator(Metadata.FORM_URL_ENCODED);
export const Multipart = Builder.buildBooleanDecorator(Metadata.MULTIPART);

// Parameter decorators
export const Query = Builder.buildParameterDecorator(Metadata.QUERIES);
export const Path = Builder.buildParameterDecorator(Metadata.PATHS);
export const Header = Builder.buildParameterDecorator(Metadata.HEADERS);
export const Body = Builder.buildBodyDecorator();
export const Field = Builder.buildParameterDecorator(Metadata.FIELDS);
export const Part = Builder.buildPartDecorator();
