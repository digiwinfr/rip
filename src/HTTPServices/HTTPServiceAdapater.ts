import { HTTPService } from './HTTPService';
import { Request } from '../request';

export abstract class HTTPServiceAdapater implements HTTPService {

  protected httpService: any;


  constructor(httpService: any) {
    this.httpService = httpService;
  }

  abstract request(request: Request);

}
