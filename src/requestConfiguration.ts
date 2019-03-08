import { HTTPVerb } from './HTTPVerb';
import { Parameter } from './parameter';

export class RequestConfiguration {

  public verb: HTTPVerb = null;

  public url: string = null;

  public paths: Parameter[] = [];

  public queries: Parameter[] = [];

  public body: Parameter = null;
}