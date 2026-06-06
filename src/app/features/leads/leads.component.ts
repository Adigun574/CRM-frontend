import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService, Lead } from '../../core/services/lead.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { LeadFormComponent } from './lead-form/lead-form.component';
import { ReplacePipe } from '../../shared/replace.pipe';

export const STAGES = ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

@Component({
  selector: 'app-leads',
  standalone: true,
  imports: [CommonModule, FormsModule, LeadFormComponent, ReplacePipe],
  templateUrl: './leads.component.html',
  styleUrl: './leads.component.scss',
})
export class LeadsComponent implements OnInit {
  private leadService = inject(LeadService);
  auth = inject(AuthService);

  leads: Lead[] = [];
  total = 0;
  loading = signal(true);
  viewMode: 'table' | 'kanban' = 'table';
  showForm = signal(false);
  editingLead: Lead | null = null;
  searchQuery = '';
  stageFilter = '';
  priorityFilter = '';

  stages = STAGES;

  stageColors: Record<string, string> = {
    New: 'stage-new', Contacted: 'stage-contacted', Qualified: 'stage-qualified',
    Proposal: 'stage-proposal', Negotiation: 'stage-negotiation',
    'Closed Won': 'stage-closed-won', 'Closed Lost': 'stage-closed-lost',
  };

  ngOnInit() { this.loadLeads(); }

  loadLeads() {
    this.loading.set(true);
    const filters: any = {};
    if (this.stageFilter) filters.stage = this.stageFilter;
    if (this.priorityFilter) filters.priority = this.priorityFilter;
    if (this.searchQuery) filters.search = this.searchQuery;
    this.leadService.getLeads(filters).subscribe({
      next: ({ leads, total }) => { this.leads = leads; this.total = total; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  getLeadsByStage(stage: string) {
    return this.leads.filter(l => l.stage === stage);
  }

  openCreate() { this.editingLead = null; this.showForm.set(true); }
  openEdit(lead: Lead) { this.editingLead = lead; this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.editingLead = null; }

  onFormSaved() { this.closeForm(); this.loadLeads(); }

  deleteLead(lead: Lead) {
    if (!confirm(`Delete lead for ${lead.companyName}?`)) return;
    this.leadService.deleteLead(lead._id).subscribe(() => this.loadLeads());
  }

  updateStage(lead: Lead, stage: string) {
    this.leadService.updateLead(lead._id, { stage }).subscribe(() => this.loadLeads());
  }

  onSearch() { this.loadLeads(); }
  clearFilters() { this.searchQuery = ''; this.stageFilter = ''; this.priorityFilter = ''; this.loadLeads(); }

  formatCurrency(val: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);
  }

  isAdmin() { return this.auth.hasRole('admin'); }
}
