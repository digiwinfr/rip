import { HTTPVerb } from './HTTPVerb';
import { BodyValue } from './values/bodyValue';

export class RequestConfiguration {

  public baseUrl: string = null;

  public verb: HTTPVerb = null;

  public url: string = null;

  public paths = {};

  public queries = {};

  public body: BodyValue = null;

  public headers = {};

  public formUrlEncoded = false;

  public fields = {};

  public multipart = false;

  public parts = {};
}
