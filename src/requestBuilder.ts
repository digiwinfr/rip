import { RequestDefinition } from './requestDefinition';
import { Request } from './request';
import { HTTPMethod } from './HTTPMethod';

export class RequestBuilder {

  private definition: RequestDefinition;
  private request: Request;
  private boundary: string;

  constructor(definition: RequestDefinition) {
    this.definition = definition;
    this.request = new Request();
    this.request.definition = definition;
    this.boundary = this.generateRandomBoundary();
  }

  public build(): Request {
    this.request.url = this.buildUrl();
    this.request.method = this.definition.method;
    this.request.headers = this.buildHeaders();
    this.request.body = this.buildBody();
    return this.request;
  }

  private buildBody(): string {
    let body = null;
    if (this.definition.method !== HTTPMethod.GET && this.definition.method !== HTTPMethod.HEAD) {
      if (this.definition.formUrlEncoded) {
        body = this.assembleFormUrlEncodedBody(body);
      } else if (this.definition.multipart) {
        body = this.assembleMultipartBody(body);
      } else if (this.definition.body != null) {
        body = this.definition.body;
      }
    }
    return body;
  }

  private assembleFormUrlEncodedBody(body: any) {
    const url = new URLSearchParams();
    const fields = this.definition.fields;
    for (const key in fields) {
      if (fields.hasOwnProperty(key)) {
        url.append(key, fields[key]);
      }
    }
    return url.toString();
  }

  private assembleMultipartBody(body: any) {
    body += this.boundary + '\n';
    const parts = this.definition.parts;
    for (const key in parts) {
      if (parts.hasOwnProperty(key)) {
        body += 'Content-Disposition: form-data; name="' + key + '"\n';
        body += '\n'; // TODO or a content type if not text
        body += parts[key];
        body += this.boundary + '\n';
      }
    }
    return body;
  }

  private buildUrl(): string {
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

  private buildHeaders(): {} {
    const headers = this.definition.headers || {};
    if (this.definition.formUrlEncoded) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded;';
    } else if (this.definition.multipart) {
      headers['Content-Type'] = 'multipart/form-data; boundary=' + this.boundary;
    }
    return headers;
  }

  private generateRandomBoundary(): string {
    // TODO randomize
    return '------0123456789';
  }
}
