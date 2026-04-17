import { Publisher, Subjects, TicketUpdatedEvent } from "@ccgtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
