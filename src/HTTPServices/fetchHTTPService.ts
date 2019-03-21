import { HTTPService } from './HTTPService';
import { Request } from '../request';
import { AsyncSubject, Observable } from 'rxjs';

export class FetchHTTPService implements HTTPService {

  request(request: Request): Observable<any> {
    const subject = new AsyncSubject();

    fetch(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
      .then(response => {
        subject.next(response);
        subject.complete();
      })
      .catch(error => subject.error(error));

    return subject;
  }

}
