import { BaseUrl, Body, Field, FormUrlEncoded, GET, Header, Headers, Multipart, Part, Path, POST, Query, Rip } from './rip';
import { RequestDefinition } from './requestDefinition';
import { Metakey } from './metadata/metakey';
import { HTTPMethod } from './HTTPMethod';
import { StubHTTPService } from './HTTPServices/stubHTTPService';

class Thing {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}


describe('Decorators apply metadata', () => {

  beforeAll(() => {
    const rip = Rip.getInstance();
    rip.setHTTPService(new StubHTTPService());
  });

  it('should configure GET request with a query', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @GET('/things')
      all(@Query('sort') sort?: string) {
      }
    }

    const client = new ThingClient();
    client.all('name asc');

    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'all');

    expect(configuration.method).toBe(HTTPMethod.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.relativeUrl).toBe('/things');
    expect(configuration.queries['sort']).toBe('name asc');
  });

  it('should configure GET request with an undefined query', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @GET('/things')
      all(@Query('sort') sort?: string) {
      }
    }

    const client = new ThingClient();
    client.all();

    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'all');

    expect(configuration.method).toBe(HTTPMethod.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.relativeUrl).toBe('/things');

    expect(configuration.queries['sort']).toBe(undefined);
  });

  it('should configure two consecutive GET requests with two paths', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @GET('/thing/:id/:action')
      findById(@Path('id') id: number, @Path('action') action?: string) {
      }
    }

    const client = new ThingClient();
    client.findById(1, 'edit');

    let configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'findById');

    expect(configuration.method).toBe(HTTPMethod.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.relativeUrl).toBe('/thing/:id/:action');

    expect(configuration.paths['id']).toBe(1);
    expect(configuration.paths['action']).toBe('edit');

    client.findById(2);

    configuration = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'findById');

    expect(configuration.method).toBe(HTTPMethod.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.relativeUrl).toBe('/thing/:id/:action');

    expect(configuration.paths['id']).toBe(2);

    expect(configuration.paths['action']).toBe(undefined);
  });

  it('should configure POST request with a body', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @POST('/thing')
      send(@Body() thing: Thing) {
      }
    }

    const client = new ThingClient();
    client.send(new Thing('stuff'));

    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'send');

    expect(configuration.method).toBe(HTTPMethod.POST);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.relativeUrl).toBe('/thing');

    expect(configuration.body).toEqual(JSON.stringify(new Thing('stuff')));
  });


  it('should configure request with a parameter header', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @GET('/token')
      getToken(@Header('Authorization') code: string) {
      }
    }

    const client = new ThingClient();
    client.getToken('Bearer abcedf');

    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'getToken');

    expect(configuration.headers['Authorization']).toBe('Bearer abcedf');
  });


  it('should configure request with headers', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @GET('/something')
      @Headers({
        header1: 'stuff 1',
        header2: 'stuff 2'
      })
      getSomething() {
      }
    }

    const client = new ThingClient();
    client.getSomething();
    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'getSomething');

    expect(configuration.headers['header1']).toBe('stuff 1');
    expect(configuration.headers['header2']).toBe('stuff 2');

  });

  it('should configure request with some header parameters', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @GET('/something')
      getSomething(@Header('header1') p1: string, @Header('header2') p2: string, @Header('header1') p3: string) {
      }
    }

    const client = new ThingClient();
    client.getSomething('stuff 1', 'stuff 2', 'stuff 3');
    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'getSomething');

    expect(configuration.headers['header1']).toBe('stuff 3');
    expect(configuration.headers['header2']).toBe('stuff 2');
  });

  it('should configure request with multiple headers', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @GET('/something')
      @Headers({
        'Cache-Control': 'max-age=640000',
        'header2': 'stuff 1'
      })
      getSomething(@Header('header1') p1: string, @Header('header2') p2: string, @Header('header1') p3: string) {
      }
    }

    const client = new ThingClient();
    client.getSomething('stuff 3', 'stuff 4', 'stuff 5');
    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'getSomething');

    expect(configuration.headers['header1']).toBe('stuff 5');
    expect(configuration.headers['header2']).toBe('stuff 1');
    expect(configuration.headers['Cache-Control']).toBe('max-age=640000');
  });

  it('should configure request as form url encoded', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @POST('/something')
      @FormUrlEncoded()
      postSomething() {
      }
    }

    const client = new ThingClient();
    client.postSomething();
    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'postSomething');
    expect(configuration.formUrlEncoded).toBe(true);

  });

  it('should configure request as form url encoded with some fields', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @POST('/something')
      @FormUrlEncoded()
      postSomething(@Field('field1') field1: string, @Field('field2') field2: string, @Field('field1') field3: string) {
      }
    }

    const client = new ThingClient();
    client.postSomething('stuff 1', 'stuff 2', 'stuff 3');
    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'postSomething');

    expect(configuration.formUrlEncoded).toBe(true);
    expect(configuration.fields['field1']).toBe('stuff 3');
    expect(configuration.fields['field2']).toBe('stuff 2');

  });

  it('should configure request as multipart', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @POST('/something')
      @Multipart()
      postSomething() {
      }
    }

    const client = new ThingClient();
    client.postSomething();
    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'postSomething');
    expect(configuration.multipart).toBe(true);

  });

  it('should configure request as multipart with some parts', () => {

    @BaseUrl('http://localhost:8080')
    class ThingClient {
      @POST('/something')
      @Multipart()
      postSomething(@Part('part1') part1: Thing, @Part('part2') part2: Thing) {
      }
    }

    const client = new ThingClient();
    client.postSomething(new Thing('stuff 1'), new Thing('stuff 2'));
    const configuration: RequestDefinition = Reflect.getMetadata(Metakey.CONFIGURATION, client, 'postSomething');

    expect(configuration.parts['part1']).toEqual(JSON.stringify(new Thing('stuff 1')));
    expect(configuration.parts['part2']).toEqual(JSON.stringify(new Thing('stuff 2')));

  });

});
