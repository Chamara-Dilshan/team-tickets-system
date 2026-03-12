export type Priority = 'Low' | 'Medium' | 'High';
export type TicketStatus = 'Open' | 'In Progress' | 'Closed';

export interface Ticket {
  title: string;
  description: string;
  priority: Priority;
  createdBy: string;
  id?: string;
  createdAt?: Date;
  status?: TicketStatus;
}

/**
 * Ticket originating from a Microsoft Teams channel message.
 * Created by Power Automate and stored in the Node.js backend.
 */
export interface TeamsTicket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  source: string;
  createdAt: string; // ISO string from backend
}
