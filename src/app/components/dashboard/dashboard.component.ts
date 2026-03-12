import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  /**
   * Called when ticket-form emits ticketSubmitted.
   * The ticket-list auto-refreshes via the shared TicketService observable,
   * so no additional logic is needed here.
   */
  onTicketSubmitted(): void {}
}
