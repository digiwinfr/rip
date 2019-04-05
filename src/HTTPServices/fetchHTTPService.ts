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
        if (response.status === 200) {
          if (request.definition != null && request.definition.deserializeAs !== null) {
            const object = new request.definition.deserializeAs();
            object.deserialize(response.body);
            subject.next(object);
          } else {
            subject.next(response.body);
          }
          subject.complete();
        } else {
          subject.error(response.body);
        }
      })
      .catch(error => subject.error(error));

    return subject;
  }

}
