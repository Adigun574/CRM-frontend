import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountService, Account } from '../../../core/services/account.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-account-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-form.component.html',
  styleUrl: './account-form.component.scss',
})
export class AccountFormComponent implements OnInit {
  @Input() account: Account | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private accountService = inject(AccountService);
  private userService = inject(UserService);

  agents: any[] = [];
  loading = false;
  error = '';

  types = ['Customer', 'Prospect', 'Partner', 'Vendor', 'Other'];
  industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'];

  form: Partial<Account> = {
    name: '', type: 'Prospect', industry: 'Technology',
    website: '', phone: '', email: '',
    address: { city: '', state: '', country: 'Nigeria' },
    employees: 0, annualRevenue: 0,
    description: '', notes: '', tags: [],
  };

  ngOnInit() {
    if (this.account) {
      this.form = {
        ...this.account,
        assignedTo: this.account.assignedTo?._id || this.account.assignedTo,
        address: { ...{ city: '', state: '', country: 'Nigeria' }, ...this.account.address },
      };
    }
    this.userService.getAgents().subscribe(a => this.agents = a);
  }

  save() {
    this.loading = true;
    this.error = '';
    const agent = this.agents.find(a => a._id === this.form.assignedTo);
    if (agent) this.form.assignedToName = agent.name;

    const obs = this.account
      ? this.accountService.updateAccount(this.account._id, this.form)
      : this.accountService.createAccount(this.form);

    obs.subscribe({
      next: () => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.error = err.error?.message || 'Failed to save account.'; this.loading = false; },
    });
  }
}
