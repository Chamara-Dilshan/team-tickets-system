import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Ticket } from '../models/ticket.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private tickets: Ticket[] = [];
  private ticketsSubject = new BehaviorSubject<Ticket[]>([]);

  /** Observable stream of submitted tickets — subscribe in components */
  tickets$ = this.ticketsSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Submits a ticket to the Power Automate HTTP trigger endpoint.
   * The flow then posts the ticket details to a Microsoft Teams channel.
   */
  submitTicket(ticket: Ticket): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const ticketWithMeta: Ticket = {
      ...ticket,
      id: this.generateId(),
      createdAt: new Date(),
      status: 'Open'
    };

    return this.http.post(environment.powerAutomateUrl, ticketWithMeta, { headers }).pipe(
      tap(() => {
        // Prepend new ticket so latest appears first in the list
        this.tickets.unshift(ticketWithMeta);
        this.ticketsSubject.next([...this.tickets]);
      })
    );
  }

  /** Returns all tickets submitted in the current session */
  getTickets(): Ticket[] {
    return [...this.tickets];
  }

  private generateId(): string {
    return 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}
