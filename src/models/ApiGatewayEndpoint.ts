import { Backend } from './Backend';

export interface ApiGatewayEndpoint {
  endpoint: string;
  method: string;
  backend: Backend[];
  input_query_strings?: string[];
  input_headers?: string[];
  output_encoding?: string;
  roles?: string[];
}

export interface ApiGatewayEndpointMaker extends ApiGatewayEndpoint {
  tag: string;
}

export interface ApiGatewayEndpoints {
  controller?: string;
  endpoints?: ApiGatewayEndpoint[];
}
