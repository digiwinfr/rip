import { HTTPMethod } from './HTTPMethod';

export class RequestDefinition {

  public baseUrl = '';

  public method: HTTPMethod = null;

  public relativeUrl = '';

  public paths = {};

  public queries = {};

  public body: string = null;

  public headers = {};

  public formUrlEncoded = false;

  public fields = {};

  public multipart = false;

  public parts = {};

  public deserializeAs = null;
}
