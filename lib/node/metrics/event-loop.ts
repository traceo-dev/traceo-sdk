import * as perf_hooks from "perf_hooks";
import { IMetrics } from "../../core/interfaces/IMetrics";
import { toDecimalNumber } from "../helpers";

type EventLoopMetricType = {
  min: number;
  max: number;
  mean: number;
  stddev: number;
};

export class EventLoopMetrics implements IMetrics<EventLoopMetricType> {
  //TODO: should be type here, but in different versions there are a different type,
  //eq. perf_hooks.IntervalHistogram
  histogram: any;

  constructor() {
    this.histogram = perf_hooks.monitorEventLoopDelay({
      resolution: 10,
    });
    this.histogram.enable();
  }

  collect(): EventLoopMetricType {
    const data: EventLoopMetricType = {
      min: toDecimalNumber(this.histogram.min / 1e6),
      max: toDecimalNumber(this.histogram.max / 1e6),
      mean: toDecimalNumber(this.histogram.mean / 1e6),
      stddev: toDecimalNumber(this.histogram.stddev / 1e6),
    };
    this.histogram.reset();

    return data;
  }
}
