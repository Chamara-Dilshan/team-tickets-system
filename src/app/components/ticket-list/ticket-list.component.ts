import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TicketService } from '../../services/ticket.service';
import { Ticket, TicketStatus } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-list',
  templateUrl: './ticket-list.component.html',
  styleUrls: ['./ticket-list.component.css']
})
export class TicketListComponent implements OnInit, OnDestroy {

  allTickets: Ticket[] = [];
  private sub!: Subscription;

  searchText = '';
  filterPriority = '';
  filterStatus = '';

  readonly priorities = ['Low', 'Medium', 'High'];
  readonly statuses: TicketStatus[] = ['Open', 'In Progress', 'Closed'];

  readonly priorityColor: Record<string, string> = {
    High:   'warn',
    Medium: 'accent',
    Low:    'primary'
  };

  readonly priorityIcon: Record<string, string> = {
    High:   'priority_high',
    Medium: 'remove',
    Low:    'arrow_downward'
  };

  constructor(private ticketService: TicketService) {}

  ngOnInit(): void {
    this.sub = this.ticketService.tickets$.subscribe(tickets => {
      this.allTickets = tickets;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get tickets(): Ticket[] {
    return this.allTickets.filter(t => {
      const matchPriority = !this.filterPriority || t.priority === this.filterPriority;
      const matchStatus   = !this.filterStatus   || t.status   === this.filterStatus;
      const search        = this.searchText.toLowerCase();
      const matchSearch   = !search ||
        t.title.toLowerCase().includes(search) ||
        t.description.toLowerCase().includes(search) ||
        (t.createdBy ?? '').toLowerCase().includes(search);
      return matchPriority && matchStatus && matchSearch;
    });
  }

  updateStatus(ticket: Ticket, status: TicketStatus): void {
    this.ticketService.updateTicketStatus(ticket.id!, status);
  }

  clearFilters(): void {
    this.searchText = '';
    this.filterPriority = '';
    this.filterStatus = '';
  }

  statusClass(status: string | undefined): string {
    return 'status-' + (status ?? 'open').toLowerCase().replace(' ', '-');
  }
}
