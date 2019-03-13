import { HTTPVerb } from './HTTPVerb';
import { ParameterValue } from './values/parameterValue';
import { BodyValue } from './values/bodyValue';

export class RequestConfiguration {

  public baseUrl: string = null;

  public verb: HTTPVerb = null;

  public url: string = null;

  public paths: ParameterValue[] = [];

  public queries: ParameterValue[] = [];

  public body: BodyValue = null;

  public headers: ParameterValue[] = [];

  public formUrlEncoded = false;

  public fields: ParameterValue[] = [];
}
