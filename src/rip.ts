import 'reflect-metadata';
import { Metakey, METAKEY_PREFIX } from './metadata/metakey';
import { HTTPMethod } from './HTTPMethod';
import { Parameter } from './parameter';
import { MetadataReader } from './metadata/metadataReader';
import { HTTPService } from './HTTPServices/HTTPService';
import { Metadata } from './metadata/metadata';
import { RequestBuilder } from './requestBuilder';

export class Rip {

  private static instance: Rip = null;

  private httpService: HTTPService;

  private constructor() {
  }

  public static getInstance(): Rip {
    if (this.instance === null) {
      this.instance = new Rip();
    }
    return this.instance;
  }

  public setHTTPService(httpService: HTTPService) {
    this.httpService = httpService;
  }

  public buildBaseUrlDecorator() {
    return (baseUrl: string) => {
      return (target) => {
        Reflect.defineMetadata(Metakey.BASE_URL, new Metadata(baseUrl), target);
      };
    };
  }

  public buildBodyDecorator() {
    return () => {
      return (target, propertyKey: string, index: number) => {
        Reflect.defineMetadata(Metakey.BODY, new Metadata(new Parameter(index)), target, propertyKey);
      };
    };
  }

  public buildParameterDecorator(metakey: Metakey.PATHS | Metakey.QUERIES | Metakey.HEADERS | Metakey.FIELDS | Metakey.PARTS) {
    return (name: string) => {
      return (target, propertyKey: string, index: number) => {
        const metadata = Reflect.getOwnMetadata(metakey, target, propertyKey) as Metadata || new Metadata([]);
        metadata.value[index] = new Parameter(index, name);
        Reflect.defineMetadata(metakey, metadata, target, propertyKey);
      };
    };
  }

  public buildMethodDecorator(verb: HTTPMethod) {
    return (relativeUrl: string) => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

        Reflect.defineMetadata(Metakey.METHOD, new Metadata(verb), target, propertyKey);

        Reflect.defineMetadata(Metakey.RELATIVE_URL, new Metadata(relativeUrl), target, propertyKey);

        descriptor.value = this.verbDecoratorRuntime(descriptor.value, target, propertyKey);

        return descriptor;
      };
    };
  }

  private verbDecoratorRuntime(originalMethod, target, propertyKey) {
    return (...args: any[]) => {
      Reflect.deleteMetadata(Metakey.CONFIGURATION, target, propertyKey);

      this.copyMetadataFromClassToMethod(target, propertyKey);
      this.setParametersValues(Metakey.HEADERS, args, target, propertyKey);
      this.setParametersValues(Metakey.QUERIES, args, target, propertyKey);
      this.setParametersValues(Metakey.PATHS, args, target, propertyKey);
      this.setParametersValues(Metakey.FIELDS, args, target, propertyKey);
      this.setParametersValues(Metakey.PARTS, args, target, propertyKey);
      this.setBodyValue(args, target, propertyKey);
      const reader = new MetadataReader(target, propertyKey);
      const definition = reader.read();

      Reflect.defineMetadata(Metakey.CONFIGURATION, definition, target, propertyKey);

      originalMethod.apply(this, args);

      const builder = new RequestBuilder(definition);

      return this.httpService.request(builder.build());
    };
  }

  private setParametersValues(
    metakey: Metakey.PATHS | Metakey.QUERIES | Metakey.HEADERS | Metakey.FIELDS | Metakey.PARTS,
    args: any[], target, propertyKey: string) {
    const metadata = Reflect.getOwnMetadata(metakey, target, propertyKey) as Metadata || new Metadata([]);
    for (const parameter of metadata.value) {
      if (parameter.index !== null) {
        parameter.value = args[parameter.index];
      }
    }
  }

  private setBodyValue(args: any[], target, propertyKey: string) {
    const metadata = Reflect.getOwnMetadata(Metakey.BODY, target, propertyKey) as Metadata || null;
    if (metadata !== null) {
      metadata.value.value = args[metadata.value.index];
    }
  }

  private copyMetadataFromClassToMethod(target, propertyKey: string) {
    const classMetadataKeys = Reflect.getMetadataKeys(target.constructor);
    classMetadataKeys.forEach((key: string) => {
      if (key.startsWith(METAKEY_PREFIX)) {
        const value = Reflect.getMetadata(key, target.constructor);
        Reflect.defineMetadata(key, value, target, propertyKey);
      }
    });
  }

  public buildHeadersDecorator() {
    return (headersObject: {}) => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        const metadata = Reflect.getOwnMetadata(Metakey.HEADERS, target, propertyKey) as Metadata || new Metadata([]);
        for (const property in headersObject) {
          if (headersObject.hasOwnProperty(property)) {
            metadata.value.push(new Parameter(null, property, headersObject[property]));
          }
        }
        Reflect.defineMetadata(Metakey.HEADERS, metadata, target, propertyKey);
      };
    };
  }

  public buildBooleanDecorator(metakey: Metakey.MULTIPART | Metakey.FORM_URL_ENCODED) {
    return () => {
      return (target, propertyKey: string, descriptor: PropertyDescriptor) => {
        Reflect.defineMetadata(metakey, new Metadata(true), target, propertyKey);
      };
    };
  }

}

const rip = Rip.getInstance();

// Class decorators
export const BaseUrl = rip.buildBaseUrlDecorator();

// Method decorators
export const GET = rip.buildMethodDecorator(HTTPMethod.GET);
export const POST = rip.buildMethodDecorator(HTTPMethod.POST);
export const PATCH = rip.buildMethodDecorator(HTTPMethod.PATCH);
export const PUT = rip.buildMethodDecorator(HTTPMethod.PUT);
export const DELETE = rip.buildMethodDecorator(HTTPMethod.DELETE);
export const Headers = rip.buildHeadersDecorator();
export const FormUrlEncoded = rip.buildBooleanDecorator(Metakey.FORM_URL_ENCODED);
export const Multipart = rip.buildBooleanDecorator(Metakey.MULTIPART);

// Parameter decorators
export const Query = rip.buildParameterDecorator(Metakey.QUERIES);
export const Path = rip.buildParameterDecorator(Metakey.PATHS);
export const Header = rip.buildParameterDecorator(Metakey.HEADERS);
export const Field = rip.buildParameterDecorator(Metakey.FIELDS);
export const Part = rip.buildParameterDecorator(Metakey.PARTS);
export const Body = rip.buildBodyDecorator();
