import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit, OnDestroy {

  tickets: Ticket[] = [];
  private sub!: Subscription;

  /** Maps priority level to Angular Material chip colour */
  readonly priorityColor: Record<string, string> = {
    High:   'warn',
    Medium: 'accent',
    Low:    'primary'
  };

  /** Maps priority to an icon for visual cue */
  readonly priorityIcon: Record<string, string> = {
    High:   'priority_high',
    Medium: 'remove',
    Low:    'arrow_downward'
  };

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.sub = this.ticketService.tickets$.subscribe(tickets => {
      this.tickets = tickets;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
