import { Request } from '../request';
import { Observable } from 'rxjs';

export interface HTTPService {

  request(request: Request): Observable<any>;

}
