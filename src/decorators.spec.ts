import { Body, GET, Path, POST, Query } from './decorators';
import { Observable } from 'rxjs';
import { RequestConfiguration } from './requestConfiguration';
import { Metadata } from './metadata';
import { HTTPVerb } from './HTTPVerb';

class Thing {
  name: string;
}

class ThingClient {

  @GET('http://localhost:8080/things')
  all(@Query('sort') sort?: string): Observable<Thing[]> {
    return null;
  }

  @GET('http://localhost:8080/thing/:id/:action')
  findById(@Path('id') id: number, @Path('action') action?: string): Observable<Thing> {
    return null;
  }

  @POST('http://localhost:8080/thing')
  send(@Body() thing: Thing): Observable<any> {
    return null;
  }

}


describe('Decorators apply metadata', () => {

  it('Decorators should configure GET request with a single query', () => {
    const client = new ThingClient();
    client.all('name asc');

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'all');

    expect(configuration.queries[0].index).toBe(0);
    expect(configuration.queries[0].name).toBe('sort');
    expect(configuration.queries[0].value).toBe('name asc');
  });

  it('Decorators should configure GET request with an undefined single query', () => {
    const client = new ThingClient();
    client.all();

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'all');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.url).toBe('http://localhost:8080/things');

    expect(configuration.queries[0].index).toBe(0);
    expect(configuration.queries[0].name).toBe('sort');
    expect(configuration.queries[0].value).toBe(undefined);
  });

  it('Decorators should configure two consecutive GET requests with two paths', () => {
    const client = new ThingClient();
    client.findById(1, 'edit');

    let configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'findById');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.url).toBe('http://localhost:8080/thing/:id/:action');

    expect(configuration.paths[0].index).toBe(0);
    expect(configuration.paths[0].name).toBe('id');
    expect(configuration.paths[0].value).toBe(1);

    expect(configuration.paths[1].index).toBe(1);
    expect(configuration.paths[1].name).toBe('action');
    expect(configuration.paths[1].value).toBe('edit');

    client.findById(2);

    configuration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'findById');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.url).toBe('http://localhost:8080/thing/:id/:action');

    expect(configuration.paths[0].index).toBe(0);
    expect(configuration.paths[0].name).toBe('id');
    expect(configuration.paths[0].value).toBe(2);

    expect(configuration.paths[1].index).toBe(1);
    expect(configuration.paths[1].name).toBe('action');
    expect(configuration.paths[1].value).toBe(undefined);
  });

});
