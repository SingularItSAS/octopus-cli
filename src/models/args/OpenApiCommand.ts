import { EndpointCommand } from './EndpointCommand';

export interface OpenApiCommand extends EndpointCommand {
  url: string;
  file: string;
  token?: string;
}
