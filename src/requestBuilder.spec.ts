import { RequestDefinition } from './requestDefinition';
import { RequestBuilder } from './requestBuilder';
import { HTTPMethod } from './HTTPMethod';

describe('RequestBuilder', () => {

  it('should build a GET request', () => {

    const definition = new RequestDefinition();
    definition.baseUrl = 'https://localhost:80';
    definition.relativeUrl = '/user/:id/details';
    definition.paths = {
      id: 2
    };
    definition.queries = {
      sort: 'name asc'
    };
    definition.method = HTTPMethod.GET;

    const builder = new RequestBuilder(definition);
    const request = builder.build();

    expect(request.url).toBe('https://localhost:80/user/2/details?sort=name+asc');
    expect(request.method).toBe('GET');

  });

  it('should build url with already a query', () => {

    const definition = new RequestDefinition();
    definition.baseUrl = 'https://localhost:80';
    definition.relativeUrl = '/user/details?id=2';
    definition.queries = {
      sort: 'name asc'
    };

    const builder = new RequestBuilder(definition);
    const request = builder.build();

    expect(request.url).toBe('https://localhost:80/user/details?id=2&sort=name+asc');

  });

  it('should build a POST request', () => {

    const definition = new RequestDefinition();
    definition.baseUrl = 'https://localhost:80';
    definition.relativeUrl = '/user/:id';
    definition.paths = {
      id: 2
    };
    definition.method = HTTPMethod.POST;

    definition.body = JSON.stringify({
      hello: 'world'
    });

    definition.headers = JSON.stringify({
      'header-1': 'value 1'
    });

    const builder = new RequestBuilder(definition);
    const request = builder.build();

    expect(request.url).toBe('https://localhost:80/user/2');
    expect(request.method).toBe('POST');
    expect(request.body).toEqual(JSON.stringify({
      hello: 'world'
    }));
    expect(request.headers).toEqual(JSON.stringify({
      'header-1': 'value 1'
    }));

  });
});
