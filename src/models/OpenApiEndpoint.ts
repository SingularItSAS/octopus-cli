export interface OpenApiEndpoint {
  endpoint: string;
  method: string;
  tag: string;
  headers: string[];
  roles?: string[];
}
