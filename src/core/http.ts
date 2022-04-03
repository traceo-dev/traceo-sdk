import * as http from "http";
import { RequestStatus } from "../transport/enums";
import { EventResponse, KlepperEvent } from "../transport/events";
import { KlepperIncomingMessage, RequestOptions } from "../transport/http";
import { getGlobalClientData } from "./global";
import { isClientConnected } from "./is";

const KLEPPER_HOST = process.env.KLEPPER_HOST || "localhost";
const KLEPPER_API = process.env.KLEPPER_API || "/sdk/incident";
const KLEPPER_PORT = process.env.KLEPPER_PORT || 8080;

const createHttpOptions = (event: KlepperEvent): http.RequestOptions => {
  const client = getGlobalClientData();

  const { privateKey, appId } = client;
  const baseOptions: RequestOptions = {
    hostname: KLEPPER_HOST,
    port: +KLEPPER_PORT,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": `${Buffer.byteLength(JSON.stringify(event))}`,
      "klepper-project-key": String(privateKey),
      "klepper-app-id": String(appId),
    },
  };

  return {
    path: KLEPPER_API,
    ...baseOptions,
  };
};

const statusFromCode = (code: number) =>
  code >= 200 && code <= 299 ? RequestStatus.SUCCESS : RequestStatus.ERROR;

export const sendEvent = async (
  event: KlepperEvent
): Promise<EventResponse> => {
  return new Promise<EventResponse>((resolve, reject) => {
    const httpOptions = createHttpOptions(event);
    if (!httpOptions) {
      reject({
        statusCode: 400,
        statusMessage:
          "[Klepper] Error during sending event to Klepper. No HTTP options.",
      });
    }

    if (!isClientConnected()) {
      reject({
        statusCode: 400,
        statusMessage:
          "[Klepper] Error during sending event to Klepper. No client global data in NodeJS scope.",
      });
    }

    const request = http.request(httpOptions, (res: KlepperIncomingMessage) => {
      res.setEncoding("utf8");

      const status = statusFromCode(res?.statusCode as number);
      const isSuccess = status === RequestStatus.SUCCESS;

      if (!isSuccess) {
        reject({
          statusCode: res?.statusCode as number,
          statusMessage: "[KLEPPER] Error during sending event to Klepper.",
        });
      } else {
        resolve({
          statusCode: res?.statusCode as number,
          statusMessage: "[KLEPPER] Event successfully sended to Klepper.",
        });
      }

      res.on("error", reject);
    });

    request.on("error", reject);

    request.on("timeout", () => {
      request.destroy();
      reject({
        statusCode: 400,
        statusMessage:
          "[Klepper] Error during sending event to Klepper. Connection timeout.",
      });
    });

    request.write(JSON.stringify(event));
    request.end();
  });
};
