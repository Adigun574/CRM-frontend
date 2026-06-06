import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AccountService, Account } from '../../core/services/account.service';
import { AuthService } from '../../core/services/auth.service';
import { AccountFormComponent } from './account-form/account-form.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AccountFormComponent],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.scss',
})
export class AccountsComponent implements OnInit {
  private accountService = inject(AccountService);
  auth = inject(AuthService);

  accounts: Account[] = [];
  total = 0;
  loading = signal(true);
  showForm = signal(false);
  editingAccount: Account | null = null;
  searchQuery = '';
  typeFilter = '';
  industryFilter = '';

  types = ['Customer', 'Prospect', 'Partner', 'Vendor', 'Other'];
  industries = ['Technology', 'Finance', 'Healthcare', 'Retail', 'Manufacturing', 'Education', 'Other'];

  ngOnInit() { this.loadAccounts(); }

  loadAccounts() {
    this.loading.set(true);
    const filters: any = {};
    if (this.typeFilter) filters.type = this.typeFilter;
    if (this.industryFilter) filters.industry = this.industryFilter;
    if (this.searchQuery) filters.search = this.searchQuery;
    this.accountService.getAccounts(filters).subscribe({
      next: ({ accounts, total }) => { this.accounts = accounts; this.total = total; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() { this.editingAccount = null; this.showForm.set(true); }
  openEdit(a: Account) { this.editingAccount = a; this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.editingAccount = null; }
  onFormSaved() { this.closeForm(); this.loadAccounts(); }

  deleteAccount(a: Account) {
    if (!confirm(`Delete account "${a.name}"?`)) return;
    this.accountService.deleteAccount(a._id).subscribe(() => this.loadAccounts());
  }

  onSearch() { this.loadAccounts(); }
  clearFilters() { this.searchQuery = ''; this.typeFilter = ''; this.industryFilter = ''; this.loadAccounts(); }

  formatRevenue(n: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0, notation: 'compact' }).format(n);
  }

  isAdmin() { return this.auth.hasRole('admin'); }
}
