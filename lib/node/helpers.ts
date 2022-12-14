import { Platform } from "../transport/events";
import { TraceoIncomingMessage } from "../transport/http";
import * as os from "os";

export const getIp = (
  req: TraceoIncomingMessage
): string | string[] | undefined => {
  return req.headers["x-forwarded-for"] || req.socket.remoteAddress;
};

export const getProtocol = (req: TraceoIncomingMessage): string => {
  return req.protocol === "https" || req.secure ? "https" : "http";
};

export const getOsPlatform = (): Platform => {
  return {
    arch: os.arch(),
    platform: os.platform(),
    release: os.release(),
    version: os.version(),
  };
};

export const toDecimalNumber = (val: number, decimal: number = 2) =>
  Number(val.toFixed(decimal));

// export const sanitizeDsn = (dsn: string) => {
//   const [secretKey, rest] = dsn
//     .replace("http://", "")
//     .replace("https://", "")
//     .split(":");
//   const [host, appId] = rest.split("/");

//   return {
//     secretKey,
//     host,
//     appId,
//   };
// };

export const calculatePercentile = (percentile: number, values: number[]): number => {
  const sortedScores = values.sort((a, b) => a - b);
  const index = (percentile / 100) * sortedScores.length;

  if (Number.isInteger(index)) {
    return (sortedScores[index - 1] + sortedScores[index]) / 2;
  }

  return sortedScores[Math.floor(index) - 1];
}
