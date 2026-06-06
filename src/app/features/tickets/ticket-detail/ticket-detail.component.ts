import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TicketService, Ticket } from '../../../core/services/ticket.service';
import { UserService } from '../../../core/services/user.service';
import { AuthService } from '../../../core/services/auth.service';
import { ReplacePipe } from '../../../shared/replace.pipe';

@Component({
  selector: 'app-ticket-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ReplacePipe],
  templateUrl: './ticket-detail.component.html',
  styleUrl: './ticket-detail.component.scss',
})
export class TicketDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private ticketService = inject(TicketService);
  private userService = inject(UserService);
  auth = inject(AuthService);

  ticket: Ticket | null = null;
  loading = signal(true);
  agents: any[] = [];
  newComment = '';
  commentLoading = false;
  assigneeId = '';

  statuses = ['Open', 'In Progress', 'Pending', 'Resolved', 'Closed'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.ticketService.getTicketById(id).subscribe({
      next: (t) => { this.ticket = t; this.assigneeId = t.assignedTo?._id || t.assignedTo || ''; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
    this.userService.getAgents().subscribe(a => this.agents = a);
  }

  updateStatus(status: string) {
    if (!this.ticket) return;
    this.ticketService.updateTicket(this.ticket._id, { status }).subscribe(t => this.ticket = t);
  }

  updateAssignee() {
    if (!this.ticket) return;
    const agent = this.agents.find(a => a._id === this.assigneeId);
    this.ticketService.updateTicket(this.ticket._id, { assignedTo: this.assigneeId, assignedToName: agent?.name }).subscribe(t => this.ticket = t);
  }

  resolve() {
    if (!this.ticket || !confirm('Mark this ticket as Resolved?')) return;
    this.ticketService.resolveTicket(this.ticket._id).subscribe(t => this.ticket = t);
  }

  addComment() {
    if (!this.newComment.trim() || !this.ticket) return;
    this.commentLoading = true;
    this.ticketService.addComment(this.ticket._id, this.newComment).subscribe({
      next: (t) => { this.ticket = t; this.newComment = ''; this.commentLoading = false; },
      error: () => this.commentLoading = false,
    });
  }
}
