import {
  ModifiedFetchRequest,
  ServiceWorkerIncomingEventsMap,
} from "../../types";

export interface ServiceWorkerMessage<
  EventType extends keyof ServiceWorkerIncomingEventsMap,
  EventPayload
> {
  type: EventType;
  payload: EventPayload;
}

interface WorkerChannelEventsMap {
  PROXY_REQUEST: [data: ModifiedFetchRequest];
  PROXY_BYPASS: [];
  ERROR: [error: { name: string; message: string }];
}

export class WorkerChannel {
  constructor(private readonly port: MessagePort) {}

  public postMessage<Event extends keyof WorkerChannelEventsMap>(
    event: Event,
    ...rest: WorkerChannelEventsMap[Event]
  ): void {
    const [data] = rest;
    this.port.postMessage({ type: event, data });
  }
}
