import { HTTPService } from './HTTPService';
import { RequestConfiguration } from '../requestConfiguration';

export abstract class HTTPServiceAdapater implements HTTPService {

  protected httpService: any;


  constructor(httpService: any) {
    this.httpService = httpService;
  }

  abstract request(configuration: RequestConfiguration);

}
