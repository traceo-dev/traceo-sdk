import { RequestMethodType } from "./types";
import * as http from "http";

export interface TraceoServerResponse extends http.ServerResponse {
  send?: Function;
}

export interface TraceoIncomingMessage extends http.IncomingMessage {
  protocol?: string;
  secure?: boolean;
}

export interface RequestOptions extends http.RequestOptions {
  hostname: string;
  method: RequestMethodType;
  path?: string;
  headers?: { [key: string]: string };
}
