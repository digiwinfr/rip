import { RequestConfiguration } from '../requestConfiguration';

export interface HTTPService {
  request(configuration: RequestConfiguration);
}
