import { BaseUrl, Body, GET, Path, POST, Query } from './decorators';
import { Observable } from 'rxjs';
import { RequestConfiguration } from './requestConfiguration';
import { Metadata } from './metadata';
import { HTTPVerb } from './HTTPVerb';

class Thing {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}

@BaseUrl('http://localhost:8080')
class ThingClient {

  @GET('/things')
  all(@Query('sort') sort?: string): Observable<Thing[]> {
    return null;
  }

  @GET('/thing/:id/:action')
  findById(@Path('id') id: number, @Path('action') action?: string): Observable<Thing> {
    return null;
  }

  @POST('/thing')
  send(@Body() thing: Thing): Observable<any> {
    return null;
  }

}


describe('Decorators apply metadata', () => {

  it('should configure GET request with a query', () => {
    const client = new ThingClient();
    client.all('name asc');

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'all');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseurl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/things');

    expect(configuration.queries[0].index).toBe(0);
    expect(configuration.queries[0].name).toBe('sort');
    expect(configuration.queries[0].value).toBe('name asc');
  });

  it('should configure GET request with an undefined query', () => {
    const client = new ThingClient();
    client.all();

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'all');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseurl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/things');

    expect(configuration.queries[0].index).toBe(0);
    expect(configuration.queries[0].name).toBe('sort');
    expect(configuration.queries[0].value).toBe(undefined);
  });

  it('should configure two consecutive GET requests with two paths', () => {
    const client = new ThingClient();
    client.findById(1, 'edit');

    let configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'findById');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseurl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/thing/:id/:action');

    expect(configuration.paths[0].index).toBe(0);
    expect(configuration.paths[0].name).toBe('id');
    expect(configuration.paths[0].value).toBe(1);

    expect(configuration.paths[1].index).toBe(1);
    expect(configuration.paths[1].name).toBe('action');
    expect(configuration.paths[1].value).toBe('edit');

    client.findById(2);

    configuration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'findById');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseurl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/thing/:id/:action');

    expect(configuration.paths[0].index).toBe(0);
    expect(configuration.paths[0].name).toBe('id');
    expect(configuration.paths[0].value).toBe(2);

    expect(configuration.paths[1].index).toBe(1);
    expect(configuration.paths[1].name).toBe('action');
    expect(configuration.paths[1].value).toBe(undefined);
  });

  it('should configure POST request with a body', () => {
    const client = new ThingClient();
    client.send(new Thing('stuff'));

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'send');

    expect(configuration.verb).toBe(HTTPVerb.POST);
    expect(configuration.baseurl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/thing');

    expect(configuration.body.index).toBe(0);
    expect(configuration.body.name).toBe(undefined);
    expect(configuration.body.value).toEqual(new Thing('stuff'));
  });

});
