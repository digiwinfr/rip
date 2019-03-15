import { RequestConfiguration } from '../requestConfiguration';
import { HTTPServiceAdapater } from './HTTPServiceAdapater';

export class FetchMockAdapter extends HTTPServiceAdapater {

  request(configuration: RequestConfiguration) {
    console.log(configuration);
  }

}
