import { RequestConfigurator } from './requestConfigurator';

class ThingClient {
  all() {
    return null;
  }
}

describe('RequestConfigurator', () => {
  it('should thrown "The property \'stuff\' doesn\'t exist on RequestConfiguration"', () => {
    Reflect.defineMetadata('rip:stuff', null, ThingClient, 'all');
    const configurator = new RequestConfigurator(ThingClient, 'all');
    const configure = () => {
      configurator.configure();
    };
    expect(configure).toThrow('The property \'stuff\' doesn\'t exist on RequestConfiguration');
  });
});
