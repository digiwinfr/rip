import { RequestDefinition } from './requestDefinition';

export class Request {

  public definition: RequestDefinition;

  public url = '';

  public method = '';

  public body: string = null;

  public headers = {};
}
