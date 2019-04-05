import { FetchHTTPService } from './fetchHTTPService';
import { Serializable } from '../serialization/serializable';
import { Request } from '../request';
import xhrMock from 'xhr-mock';
import { XhrHTTPService } from './xhrHTTPService';

describe('Request is send with XMLHttpRequest', () => {

  beforeEach(() => {
    xhrMock.setup();
  });

  afterEach(() => {
    xhrMock.teardown();
  });

  it('should configure GET request with a header', () => {
    xhrMock.use((req, res) => {
      expect(req.url().toString()).toBe('http://locahost/hello-world');
      expect(req.method()).toBe('GET');
      expect(req.headers()).toEqual({ 'my-header': 'stuff-1' });
      return res.status(200);
    });

    const service = new XhrHTTPService();
    const request = new Request();
    request.url = 'http://locahost/hello-world';
    request.method = 'GET';
    request.headers = {
      'my-header': 'stuff-1',
    };

    service.request(request);
  });

  it('should post a Serializable body', () => {
    class User implements Serializable {
      private name: string;

      constructor(name: string) {
        this.name = name;
      }

      serialize(): string {
        return JSON.stringify(this);
      }
    }

    xhrMock.use((req, res) => {
      expect(req.url().toString()).toBe('http://locahost/user');
      expect(req.method()).toBe('POST');
      expect(req.body()).toEqual(JSON.stringify({
        name: 'John Doe'
      }));
      return res.status(200);
    });

    const service = new XhrHTTPService();
    const request = new Request();
    request.url = 'http://locahost/user';
    request.method = 'POST';
    request.body = JSON.stringify(new User('John Doe'));

    service.request(request);
  });

  it('should post a string body', () => {
    xhrMock.use((req, res) => {
      expect(req.url().toString()).toBe('http://locahost/stuff');
      expect(req.method()).toBe('POST');
      expect(req.body()).toBe('Hello World !');
      return res.status(200);
    });

    const service = new XhrHTTPService();
    const request = new Request();
    request.url = 'http://locahost/stuff';
    request.method = 'POST';
    request.body = 'Hello World !';
    service.request(request);
  });
});
