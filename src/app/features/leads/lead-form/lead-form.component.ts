import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LeadService, Lead } from '../../../core/services/lead.service';
import { UserService } from '../../../core/services/user.service';
import { STAGES } from '../leads.component';

@Component({
  selector: 'app-lead-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './lead-form.component.html',
  styleUrl: './lead-form.component.scss',
})
export class LeadFormComponent implements OnInit {
  @Input() lead: Lead | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private leadService = inject(LeadService);
  private userService = inject(UserService);

  stages = STAGES;
  agents: any[] = [];
  loading = false;
  error = '';

  form: Partial<Lead> = {
    companyName: '', contactPerson: '', email: '', phone: '',
    industry: 'Technology', dealValue: 0, stage: 'New', priority: 'Medium',
    source: 'Website', notes: '',
  };

  industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'];
  sources = ['Website', 'Referral', 'Cold Call', 'Social Media', 'Email', 'Other'];

  ngOnInit() {
    if (this.lead) {
      this.form = { ...this.lead, assignedTo: this.lead.assignedTo?._id || this.lead.assignedTo };
    }
    this.userService.getAgents().subscribe(agents => this.agents = agents);
  }

  save() {
    this.loading = true;
    this.error = '';
    const selectedAgent = this.agents.find(a => a._id === this.form.assignedTo);
    if (selectedAgent) this.form.assignedToName = selectedAgent.name;

    const obs = this.lead
      ? this.leadService.updateLead(this.lead._id, this.form)
      : this.leadService.createLead(this.form);

    obs.subscribe({
      next: () => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.error = err.error?.message || 'Failed to save lead.'; this.loading = false; },
    });
  }
}
