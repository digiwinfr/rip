import { HTTPService } from './HTTPService';
import { RequestConfiguration } from '../requestConfiguration';
import { Observable } from 'rxjs';

export class StubHTTPService implements HTTPService {

  request(configuration: RequestConfiguration): Observable<any> {
    // Do nothing, it's just a stub for tests
    return null;
  }

}
