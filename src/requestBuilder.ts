import { RequestDefinition } from './requestDefinition';
import { Request } from './request';

export class RequestBuilder {

  private definition: RequestDefinition;
  private request: Request;

  constructor(definition: RequestDefinition) {
    this.definition = definition;
    this.request = new Request();
  }

  public build(): Request {

    this.request.url = this.assembleUrl();
    this.request.method = this.definition.method;
    this.request.headers = this.definition.headers;
    this.request.body = this.definition.body;

    return this.request;
  }

  private assembleUrl(): string {
    return this.addQueries(this.definition.baseUrl + this.replacePaths());
  }

  private replacePaths() {
    return this.definition.relativeUrl.replace(/:([^/]*)/g, (path, property) => {
      return this.definition.paths[property];
    });
  }

  private addQueries(url) {
    const urlObject = new URL(url);
    const queries = this.definition.queries;
    for (const key in queries) {
      if (queries.hasOwnProperty(key)) {
        urlObject.searchParams.append(key, queries[key]);
      }
    }
    return urlObject.toString();
  }

}
