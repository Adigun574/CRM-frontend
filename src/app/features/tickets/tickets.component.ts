import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TicketService, Ticket } from '../../core/services/ticket.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { ReplacePipe } from '../../shared/replace.pipe';

@Component({
  selector: 'app-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReplacePipe],
  templateUrl: './tickets.component.html',
  styleUrl: './tickets.component.scss',
})
export class TicketsComponent implements OnInit {
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  auth = inject(AuthService);

  tickets: Ticket[] = [];
  total = 0;
  loading = signal(true);
  showCreateForm = signal(false);
  agents: any[] = [];
  searchQuery = '';
  statusFilter = '';
  priorityFilter = '';
  categoryFilter = '';

  newTicket: any = {
    subject: '', description: '', priority: 'Medium', category: 'General',
    customer: { name: '', email: '', phone: '' },
  };
  createLoading = false;
  createError = '';

  statuses = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];
  categories = ['Technical', 'Billing', 'General', 'Feature Request', 'Bug'];

  ngOnInit() { this.loadTickets(); this.userService.getAgents().subscribe(a => this.agents = a); }

  loadTickets() {
    this.loading.set(true);
    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.priorityFilter) filters.priority = this.priorityFilter;
    if (this.categoryFilter) filters.category = this.categoryFilter;
    if (this.searchQuery) filters.search = this.searchQuery;
    this.ticketService.getTickets(filters).subscribe({
      next: ({ tickets, total }) => { this.tickets = tickets; this.total = total; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  createTicket() {
    this.createLoading = true;
    this.createError = '';
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: () => {
        this.createLoading = false;
        this.showCreateForm.set(false);
        this.resetForm();
        this.loadTickets();
      },
      error: (err) => { this.createError = err.error?.message || 'Failed to create ticket.'; this.createLoading = false; },
    });
  }

  resolveTicket(ticket: Ticket) {
    if (!confirm(`Mark "${ticket.subject}" as Resolved?`)) return;
    this.ticketService.resolveTicket(ticket._id).subscribe(() => this.loadTickets());
  }

  deleteTicket(ticket: Ticket) {
    if (!confirm(`Delete ticket "${ticket.ticketNumber}"?`)) return;
    this.ticketService.deleteTicket(ticket._id).subscribe(() => this.loadTickets());
  }

  resetForm() {
    this.newTicket = { subject: '', description: '', priority: 'Medium', category: 'General', customer: { name: '', email: '', phone: '' } };
  }

  clearFilters() { this.searchQuery = ''; this.statusFilter = ''; this.priorityFilter = ''; this.categoryFilter = ''; this.loadTickets(); }
  isAdmin() { return this.auth.hasRole('admin'); }
}
