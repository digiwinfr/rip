import { FetchHTTPService } from './fetchHTTPService';
import { Serializable } from '../serialization/serializable';
import { Request } from '../request';

describe('Request is send with fetch api', () => {

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should configure GET request with a header', () => {
    fetchMock.mockResponse(null, {
      status: 200
    });

    const service = new FetchHTTPService();
    const request = new Request();
    request.url = 'http://locahost/hello-world';
    request.method = 'GET';
    request.headers = {
      'my-header': 'stuff-1',
    };

    service.request(request);

    const url = fetchMock.mock.calls[0][0];
    const config = fetchMock.mock.calls[0][1];
    expect(url).toBe('http://locahost/hello-world');
    expect(config.method).toBe('GET');
    expect(config.headers).toEqual({ 'my-header': 'stuff-1' });
  });


  it('should return a subject with error', () => {
    fetchMock.mockRejectOnce(Error('it fails'));

    const service = new FetchHTTPService();
    const request = new Request();
    request.url = 'http://locahost/fail';
    request.method = 'GET';
    service.request(request).subscribe(value => {
    }, error => {
      expect(error.message).toBe('it fails');
    });
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

    fetchMock.mockResponse(null, {
      status: 200
    });

    const service = new FetchHTTPService();
    const request = new Request();
    request.url = 'http://locahost/user';
    request.method = 'POST';
    request.body = JSON.stringify(new User('John Doe'));

    service.request(request);

    const url = fetchMock.mock.calls[0][0];
    const config = fetchMock.mock.calls[0][1];
    expect(url).toBe('http://locahost/user');
    expect(config.method).toBe('POST');
    expect(config.body).toEqual(JSON.stringify({
      name: 'John Doe'
    }));
  });

  it('should post a string body', () => {
    fetchMock.mockResponse(null, {
      status: 200
    });
    const service = new FetchHTTPService();
    const request = new Request();
    request.url = 'http://locahost/stuff';
    request.method = 'POST';
    request.body = 'Hello World !';
    service.request(request);

    const url = fetchMock.mock.calls[0][0];
    const config = fetchMock.mock.calls[0][1];

    expect(url).toBe('http://locahost/stuff');
    expect(config.method).toBe('POST');

    expect(config.body).toBe('Hello World !');
  });
});
