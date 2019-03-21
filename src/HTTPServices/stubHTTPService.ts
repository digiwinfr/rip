import { HTTPService } from './HTTPService';
import { Request } from '../request';
import { Observable } from 'rxjs';

export class StubHTTPService implements HTTPService {

  request(request: Request): Observable<any> {
    // Do nothing, it's just a stub for tests
    return null;
  }

}
