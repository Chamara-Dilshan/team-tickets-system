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
