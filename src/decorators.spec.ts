import { Body, GET, Path, POST, Query } from './decorators';
import { Observable } from 'rxjs';

class Thing {
  name: string;
}

class ThingClient {

  @GET('http://localhost:8080/things')
  all(@Query('sort') sort?: string): Observable<Thing[]> {
    return null;
  }

  @GET('http://localhost:8080/thing/:id')
  findById(@Path('id') id: number): Observable<Thing> {
    return null;
  }

  @POST('http://localhost:8080/thing')
  send(@Body() thing: Thing): Observable<any> {
    return null;
  }

}


describe('Rip', () => {
  it('Decorators should configure requests', () => {
    const client = new ThingClient();
    client.all();
    client.all('name asc');
    client.findById(12);
    client.send(new Thing());
  });
});
