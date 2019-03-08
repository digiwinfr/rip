import 'reflect-metadata';
import { RipPath } from './args/path';
import { RipConfig } from './config';
import { RipMetadata } from './metadata';
import { RipVerb } from './verb';
import { RipQuery } from './args/query';

export const Path = (name: string): any => {
  return (target, propertyKey: string, index: number) => {
    const pathes: RipPath[] = Reflect.getOwnMetadata(RipMetadata.PATHES, target, propertyKey) || [];
    pathes.push(new RipPath(index, name));
    Reflect.defineMetadata(RipMetadata.PATHES, pathes, target, propertyKey);
  };
};

export const Query = (name: string): any => {
  return (target, propertyKey: string, index: number) => {
    const queries: RipQuery[] = Reflect.getOwnMetadata(RipMetadata.QUERIES, target, propertyKey) || [];
    queries.push(new RipQuery(index, name));
    Reflect.defineMetadata(RipMetadata.QUERIES, queries, target, propertyKey);
  };
};

export const GET = (url: string): any => {
  return (target, propertyKey: string, descriptor: PropertyDescriptor) => {

    Reflect.defineMetadata(RipMetadata.VERB, RipVerb.GET, target, propertyKey);

    Reflect.defineMetadata(RipMetadata.URL, url, target, propertyKey);

    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {

      const pathes = Reflect.getOwnMetadata(RipMetadata.PATHES, target, propertyKey) || [];
      for (const path of pathes) {
        path.value = args[path.index];
      }

      const queries = Reflect.getOwnMetadata(RipMetadata.QUERIES, target, propertyKey) || [];
      for (const query of queries) {
        query.value = args[query.index];
      }

      const config = new RipConfig(target, propertyKey);
      console.log(config);

      return originalMethod.apply(this, arguments);
    };
    return descriptor;
  };
};
