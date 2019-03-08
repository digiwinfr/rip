import { GET, Path, Query } from './decorators';
import { Observable } from 'rxjs';

class Thing {
  name: string;
}

class ThingClient {

  @GET('http://localhost:8080/quiz/list')
  all(@Query('sort') sort?: string): Observable<Thing[]> {
    return null;
  }

  @GET('http://localhost:8080/quiz/:id')
  findById(@Path('id') id: number): Observable<Thing> {
    return null;
  }

}


describe('Rip', () => {
  it('should works', () => {
    const client = new ThingClient();
    client.all();
    client.all('name asc');
    client.findById(12);
  });
});
