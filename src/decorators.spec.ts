import { BaseUrl, Body, Builder, Field, FormUrlEncoded, GET, Header, Headers, Multipart, Part, Path, POST, Query } from './decorators';
import { RequestConfiguration } from './requestConfiguration';
import { Metadata } from './metadata';
import { HTTPVerb } from './HTTPVerb';
import { StubHTTPService } from './HTTPServices/stubHTTPService';

class Thing {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}


describe('Decorators apply metadata', () => {

  beforeAll(() => {
    const builder = Builder.getInstance();
    builder.setHTTPService(new StubHTTPService());
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

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'all');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/things');
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

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'all');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/things');

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

    let configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'findById');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/thing/:id/:action');

    expect(configuration.paths['id']).toBe(1);
    expect(configuration.paths['action']).toBe('edit');

    client.findById(2);

    configuration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'findById');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/thing/:id/:action');

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

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'send');

    expect(configuration.verb).toBe(HTTPVerb.POST);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/thing');

    expect(configuration.body.index).toBe(0);
    expect(configuration.body.value).toEqual(new Thing('stuff'));
  });


  it('should configure request with a parameter header', () => {

    class ThingClient {
      @GET('/token')
      getToken(@Header('Authorization') code: string) {
      }
    }

    const client = new ThingClient();
    client.getToken('Bearer abcedf');

    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'getToken');

    expect(configuration.headers['Authorization']).toBe('Bearer abcedf');
  });


  it('should configure request with headers', () => {

    class ThingClient {
      @GET('/something')
      @Headers([
        ['header1', 'stuff 1'],
        ['header2', 'stuff 2']
      ])
      getSomething() {
      }
    }

    const client = new ThingClient();
    client.getSomething();
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'getSomething');

    expect(configuration.headers['header1']).toBe('stuff 1');
    expect(configuration.headers['header2']).toBe('stuff 2');

  });

  it('should configure request with some header parameters', () => {

    class ThingClient {
      @GET('/something')
      getSomething(@Header('header1') p1: string, @Header('header2') p2: string, @Header('header1') p3: string) {
      }
    }

    const client = new ThingClient();
    client.getSomething('stuff 1', 'stuff 2', 'stuff 3');
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'getSomething');

    expect(configuration.headers['header1']).toBe('stuff 3');
    expect(configuration.headers['header2']).toBe('stuff 2');
  });

  it('should configure request with multiple headers', () => {

    class ThingClient {
      @GET('/something')
      @Headers([
        ['Cache-Control', 'max-age=640000'],
        ['header2', 'stuff 1']
      ])
      getSomething(@Header('header1') p1: string, @Header('header2') p2: string, @Header('header1') p3: string) {
      }
    }

    const client = new ThingClient();
    client.getSomething('stuff 3', 'stuff 4', 'stuff 5');
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'getSomething');

    expect(configuration.headers['header1']).toBe('stuff 5');
    expect(configuration.headers['header2']).toBe('stuff 1');
    expect(configuration.headers['Cache-Control']).toBe('max-age=640000');
  });

  it('should configure request as form url encoded', () => {

    class ThingClient {
      @POST('/something')
      @FormUrlEncoded()
      postSomething() {
      }
    }

    const client = new ThingClient();
    client.postSomething();
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'postSomething');
    expect(configuration.formUrlEncoded).toBe(true);

  });

  it('should configure request as form url encoded with some fields', () => {

    class ThingClient {
      @POST('/something')
      @FormUrlEncoded()
      postSomething(@Field('field1') field1: string, @Field('field2') field2: string, @Field('field1') field3: string) {
      }
    }

    const client = new ThingClient();
    client.postSomething('stuff 1', 'stuff 2', 'stuff 3');
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'postSomething');

    expect(configuration.formUrlEncoded).toBe(true);
    expect(configuration.fields['field1']).toBe('stuff 3');
    expect(configuration.fields['field2']).toBe('stuff 2');

  });

  it('should configure request as multipart', () => {

    class ThingClient {
      @POST('/something')
      @Multipart()
      postSomething() {
      }
    }

    const client = new ThingClient();
    client.postSomething();
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'postSomething');
    expect(configuration.multipart).toBe(true);

  });

  it('should configure request as multipart with some parts', () => {

    class ThingClient {
      @POST('/something')
      @Multipart()
      postSomething(@Part('part1') part1: Thing, @Part('part2') part2: Thing) {
      }
    }

    const client = new ThingClient();
    client.postSomething(new Thing('stuff 1'), new Thing('stuff 2'));
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'postSomething');

    expect(configuration.parts['part1']).toEqual(new Thing('stuff 1'));
    expect(configuration.parts['part2']).toEqual(new Thing('stuff 2'));

  });

});
