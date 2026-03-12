import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Ticket, TicketStatus, TeamsTicket } from '../models/ticket.model';
import { environment } from '../../environments/environment';

const STORAGE_KEY = 'team_tickets';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private tickets: Ticket[] = this.loadFromStorage();
  private ticketsSubject = new BehaviorSubject<Ticket[]>([...this.tickets]);

  tickets$ = this.ticketsSubject.asObservable();

  constructor(private http: HttpClient) {}

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
        this.tickets.unshift(ticketWithMeta);
        this.saveAndNotify();
      })
    );
  }

  updateTicketStatus(id: string, status: TicketStatus): void {
    const ticket = this.tickets.find(t => t.id === id);
    if (ticket) {
      ticket.status = status;
      this.saveAndNotify();
    }
  }

  getTickets(): Ticket[] {
    return [...this.tickets];
  }

  private saveAndNotify(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tickets));
    this.ticketsSubject.next([...this.tickets]);
  }

  private loadFromStorage(): Ticket[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const tickets = JSON.parse(raw) as Ticket[];
      return tickets.map(t => ({ ...t, createdAt: t.createdAt ? new Date(t.createdAt) : undefined }));
    } catch {
      return [];
    }
  }

  private generateId(): string {
    return 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // ── Inbound: Teams → Power Automate → Backend API → Angular ──────────────

  /**
   * Fetch all tickets that arrived from Microsoft Teams via Power Automate.
   * Calls GET /api/tickets on the Node.js backend.
   */
  getTeamsTickets(): Observable<TeamsTicket[]> {
    return this.http.get<TeamsTicket[]>(`${environment.backendApiUrl}/api/tickets`);
  }
}
