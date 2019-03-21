import { MetadataReader } from './metadataReader';

class ThingClient {
  all() {
    return null;
  }
}

describe('MetadataReader', () => {
  it('should thrown "The property \'stuff\' doesn\'t exist on RequestDefinition"', () => {
    Reflect.defineMetadata('rip:stuff', null, ThingClient, 'all');
    const reader = new MetadataReader(ThingClient, 'all');
    const read = () => {
      reader.read();
    };
    expect(read).toThrow('The property \'stuff\' doesn\'t exist on RequestDefinition');
  });
});
