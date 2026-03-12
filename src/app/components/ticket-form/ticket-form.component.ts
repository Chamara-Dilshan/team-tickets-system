import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TicketService } from '../../services/ticket.service';
import { Ticket } from '../../models/ticket.model';

@Component({
  selector: 'app-ticket-form',
  templateUrl: './ticket-form.component.html',
  styleUrls: ['./ticket-form.component.css']
})
export class TicketFormComponent {

  /** Emitted after a ticket is successfully submitted */
  @Output() ticketSubmitted = new EventEmitter<void>();

  ticketForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  readonly priorities = ['Low', 'Medium', 'High'];

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private snackBar: MatSnackBar
  ) {
    this.ticketForm = this.fb.group({
      title:       ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      priority:    ['Medium', Validators.required],
      createdBy:   ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.ticketForm.invalid) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const ticket: Ticket = this.ticketForm.value;

    this.ticketService.submitTicket(ticket).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => {
        // Power Automate HTTP trigger returns HTTP 202 Accepted with no body.
        // Angular's HttpClient may treat this as an error due to empty response parsing.
        // We handle any 2xx status code as a successful submission.
        if (err.status >= 200 && err.status < 300) {
          this.handleSuccess();
        } else {
          this.handleError(err);
        }
      }
    });
  }

  private handleSuccess(): void {
    this.isSubmitting = false;
    this.submitSuccess = true;
    this.ticketForm.reset({ priority: 'Medium' });
    this.ticketSubmitted.emit();
    this.snackBar.open(
      'Ticket submitted! Message posted to Teams.',
      'Close',
      { duration: 5000, panelClass: ['success-snackbar'] }
    );
    setTimeout(() => (this.submitSuccess = false), 6000);
  }

  private handleError(err: any): void {
    this.isSubmitting = false;
    console.error('Ticket submission failed:', err);
    this.snackBar.open(
      'Failed to submit ticket. See browser console for details.',
      'Dismiss',
      { duration: 6000, panelClass: ['error-snackbar'] }
    );
  }

  getError(field: string): string {
    const ctrl = this.ticketForm.get(field);
    if (!ctrl?.touched) return '';
    if (ctrl.hasError('required')) return 'This field is required.';
    if (ctrl.hasError('minlength')) {
      const min = ctrl.errors?.['minlength']?.requiredLength;
      return `Must be at least ${min} characters.`;
    }
    return '';
  }
}
