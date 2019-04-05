import { HTTPService } from './HTTPService';
import { Request } from '../request';
import { AsyncSubject, Observable } from 'rxjs';

export class XhrHTTPService implements HTTPService {

  request(request: Request): Observable<any> {
    const subject = new AsyncSubject();

    const xhr = new XMLHttpRequest();

    xhr.onreadystatechange = (e) => {
      if (xhr.readyState === XMLHttpRequest.DONE) {
        if (xhr.status === 200) {
          if (request.definition != null && request.definition.deserializeAs !== null) {
            const object = new request.definition.deserializeAs();
            object.deserialize(xhr.response);
            subject.next(object);
          } else {
            subject.next(xhr.response);
          }
          subject.complete();
        } else {
          subject.error(xhr.response);
        }
      }
    };

    xhr.onerror = (e) => {
      subject.error(e);
    };

    xhr.open(request.method, request.url, true);
    for (const name in request.headers) {
      if (request.headers.hasOwnProperty(name)) {
        xhr.setRequestHeader(name, request.headers[name]);
      }
    }
    xhr.send(request.body);

    return subject;
  }

}
