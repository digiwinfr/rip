import { BaseUrl, Body, Field, FormUrlEncoded, GET, Header, Headers, Multipart, Part, Path, POST, Query } from './decorators';
import { RequestConfiguration } from './requestConfiguration';
import { Metadata } from './metadata';
import { HTTPVerb } from './HTTPVerb';

class Thing {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
}


describe('Decorators apply metadata', () => {

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

    expect(configuration.queries[0].index).toBe(0);
    expect(configuration.queries[0].key).toBe('sort');
    expect(configuration.queries[0].value).toBe('name asc');
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

    expect(configuration.queries[0].index).toBe(0);
    expect(configuration.queries[0].key).toBe('sort');
    expect(configuration.queries[0].value).toBe(undefined);
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

    expect(configuration.paths[0].index).toBe(0);
    expect(configuration.paths[0].key).toBe('id');
    expect(configuration.paths[0].value).toBe(1);

    expect(configuration.paths[1].index).toBe(1);
    expect(configuration.paths[1].key).toBe('action');
    expect(configuration.paths[1].value).toBe('edit');

    client.findById(2);

    configuration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'findById');

    expect(configuration.verb).toBe(HTTPVerb.GET);
    expect(configuration.baseUrl).toBe('http://localhost:8080');
    expect(configuration.url).toBe('/thing/:id/:action');

    expect(configuration.paths[0].index).toBe(0);
    expect(configuration.paths[0].key).toBe('id');
    expect(configuration.paths[0].value).toBe(2);

    expect(configuration.paths[1].index).toBe(1);
    expect(configuration.paths[1].key).toBe('action');
    expect(configuration.paths[1].value).toBe(undefined);
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

    expect(configuration.headers[0].key).toBe('Authorization');
    expect(configuration.headers[0].value).toBe('Bearer abcedf');
  });


  it('should configure request with headers', () => {

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
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'getSomething');
    expect(configuration.headers[0].key).toBe('header1');
    expect(configuration.headers[0].value).toBe('stuff 1');

    expect(configuration.headers[1].key).toBe('header2');
    expect(configuration.headers[1].value).toBe('stuff 2');

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
    expect(configuration.headers[0].key).toBe('header1');
    expect(configuration.headers[0].value).toBe('stuff 1');

    expect(configuration.headers[1].key).toBe('header2');
    expect(configuration.headers[1].value).toBe('stuff 2');

    expect(configuration.headers[2].key).toBe('header1');
    expect(configuration.headers[2].value).toBe('stuff 3');
  });

  it('should configure request with multiple headers', () => {

    class ThingClient {
      @GET('/something')
      @Headers({
        header4: 'stuff 1',
        header1: 'stuff 2'
      })
      getSomething(@Header('header1') p1: string, @Header('header2') p2: string, @Header('header1') p3: string) {
      }
    }

    const client = new ThingClient();
    client.getSomething('stuff 3', 'stuff 4', 'stuff 5');
    const configuration: RequestConfiguration = Reflect.getMetadata(Metadata.CONFIGURATION, client, 'getSomething');
    expect(configuration.headers[0].key).toBe('header1');
    expect(configuration.headers[0].value).toBe('stuff 3');

    expect(configuration.headers[1].key).toBe('header2');
    expect(configuration.headers[1].value).toBe('stuff 4');

    expect(configuration.headers[2].key).toBe('header1');
    expect(configuration.headers[2].value).toBe('stuff 5');

    expect(configuration.headers[3].key).toBe('header4');
    expect(configuration.headers[3].value).toBe('stuff 1');

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

    expect(configuration.fields[0].key).toBe('field1');
    expect(configuration.fields[0].value).toBe('stuff 1');
    expect(configuration.fields[1].key).toBe('field2');
    expect(configuration.fields[1].value).toBe('stuff 2');
    expect(configuration.fields[2].key).toBe('field1');
    expect(configuration.fields[2].value).toBe('stuff 3');

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

    expect(configuration.parts[0].key).toBe('part1');
    expect(configuration.parts[0].value).toEqual(new Thing('stuff 1'));
    expect(configuration.parts[1].key).toBe('part2');
    expect(configuration.parts[1].value).toEqual(new Thing('stuff 2'));

  });

});
