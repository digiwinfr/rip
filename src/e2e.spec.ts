import { BaseUrl, DeserializeAs, GET, Path, Rip } from './rip';
import { Observable } from 'rxjs';
import { Deserializable } from './serialization/deserializable';
import { FetchHTTPService } from './HTTPServices/fetchHTTPService';


describe('End to end tests', () => {

  class Hero implements Deserializable {
    name: string;

    constructor(name: string) {
      this.name = name;
    }

    deserialize(serialized: string): void {
      this.name = JSON.parse(serialized).name;
    }
  }

  class Human {
    name: string;

    constructor(name: string) {
      this.name = name;
    }
  }

  beforeAll(() => {
    const rip = Rip.getInstance();
    rip.setHTTPService(new FetchHTTPService());
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  it('should find and return an Hero instance', async () => {

    @BaseUrl('http://localhost:8080')
    class HeroClient {
      @GET('/hero/:id')
      @DeserializeAs(Hero)
      findById(@Path('id') id: number): Observable<Hero> & void {
      }
    }

    fetchMock.once(JSON.stringify({
      name: 'Iron man'
    }), {
      status: 200
    });

    const client = new HeroClient();

    const hero = await client.findById(12).toPromise();

    expect(hero).toEqual(new Hero('Iron man'));
    expect(hero.deserialize).not.toBe(undefined);

  });

  it('should find and return a plain json hero', async () => {

    @BaseUrl('http://localhost:8080')
    class HeroClient {
      @GET('/hero/:id')
      findById(@Path('id') id: number): Observable<Hero> & void {
      }
    }

    fetchMock.once(JSON.stringify({
      name: 'Iron man'
    }), {
      status: 200
    });

    const client = new HeroClient();

    const hero = await client.findById(12).toPromise();

    expect(hero).toEqual(JSON.stringify(new Hero('Iron man')));
    expect(hero.deserialize).toBe(undefined);

  });

  it('should throw an error cause Human is not Deserializable', async () => {

    const fail = () => {
      @BaseUrl('http://localhost:8080')
      class HumanClient {
        @GET('/human/:id')
        @DeserializeAs(Human)
        findById(@Path('id') id: number): Observable<Human> & void {
        }
      }
    };

    expect(fail).toThrow('The class used into @DeserializeAs must implements Deserializable');

  });
});
