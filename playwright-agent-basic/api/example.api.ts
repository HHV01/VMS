import { BaseApi } from './base.api';

export class ExampleApi extends BaseApi {
  health() { return this.get('/health'); }
}
