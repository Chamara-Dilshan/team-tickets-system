import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval, of } from 'rxjs';
import { switchMap, startWith, catchError } from 'rxjs/operators';
import { TicketService } from '../../services/ticket.service';
import { TeamsTicket } from '../../models/ticket.model';

@Component({
  selector: 'app-teams-tickets',
  templateUrl: './teams-tickets.component.html',
  styleUrls: ['./teams-tickets.component.css']
})
export class TeamsTicketsComponent implements OnInit, OnDestroy {

  tickets: TeamsTicket[] = [];
  isLoading = false;
  errorMessage = '';

  // Colour map for priority badges
  readonly priorityColor: Record<string, string> = {
    High:   '#d32f2f',
    Medium: '#f57c00',
    Low:    '#388e3c'
  };

  readonly priorityIcon: Record<string, string> = {
    High:   'priority_high',
    Medium: 'remove',
    Low:    'arrow_downward'
  };

  private pollSub?: Subscription;

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    // Poll the backend every 30 seconds and load immediately on start
    this.pollSub = interval(30_000)
      .pipe(
        startWith(0),        // fire immediately, then every 30s
        switchMap(() => {
          this.isLoading = true;
          this.errorMessage = '';
          return this.ticketService.getTeamsTickets().pipe(
            catchError((err) => {
              // Handle error inside switchMap so the polling interval survives
              this.isLoading = false;
              this.errorMessage =
                'Could not reach the backend API. Make sure the Node.js server is running on port 3000.';
              console.error('[TeamsTickets] API error:', err);
              return of(null); // return null so the outer subscription stays alive
            })
          );
        })
      )
      .subscribe((data) => {
        if (data !== null) {
          this.tickets = data;
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.pollSub?.unsubscribe();
  }

  refresh(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.ticketService.getTeamsTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          'Could not reach the backend API. Make sure the Node.js server is running on port 3000.';
        console.error('[TeamsTickets] Refresh error:', err);
      }
    });
  }
}
