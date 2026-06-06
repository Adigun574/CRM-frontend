import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService, Contact } from '../../../core/services/contact.service';
import { AccountService, Account } from '../../../core/services/account.service';
import { UserService } from '../../../core/services/user.service';

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
})
export class ContactFormComponent implements OnInit {
  @Input() contact: Contact | null = null;
  @Output() saved = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  private contactService = inject(ContactService);
  private accountService = inject(AccountService);
  private userService = inject(UserService);

  accounts: Account[] = [];
  agents: any[] = [];
  contacts: Contact[] = [];
  loading = false;
  error = '';

  sources = ['Website', 'Referral', 'Cold Call', 'Social Media', 'Email', 'Event', 'Other'];

  form: Partial<Contact> = {
    firstName: '', lastName: '', email: '',
    phones: [{ label: 'Mobile', number: '' }],
    jobTitle: '', department: '',
    accountName: '', status: 'Active', source: 'Website',
    social: { linkedin: '', twitter: '', facebook: '', instagram: '' },
    address: { city: '', state: '', country: 'Nigeria' },
    notes: '',
  };

  ngOnInit() {
    if (this.contact) {
      this.form = {
        ...this.contact,
        account: this.contact.account?._id || this.contact.account,
        reportsTo: this.contact.reportsTo?._id || this.contact.reportsTo,
        assignedTo: this.contact.assignedTo?._id || this.contact.assignedTo,
        phones: this.contact.phones?.length ? this.contact.phones : [{ label: 'Mobile', number: '' }],
        social: { ...{ linkedin: '', twitter: '', facebook: '', instagram: '' }, ...this.contact.social },
        address: { ...{ city: '', state: '', country: 'Nigeria' }, ...this.contact.address },
      };
    }
    this.accountService.getAccounts().subscribe(r => this.accounts = r.accounts);
    this.userService.getAgents().subscribe(a => this.agents = a);
    this.contactService.getContacts().subscribe(r => this.contacts = r.contacts);
  }

  onAccountChange(accountId: string) {
    const acc = this.accounts.find(a => a._id === accountId);
    if (acc) this.form.accountName = acc.name;
  }

  addPhone() { this.form.phones = [...(this.form.phones || []), { label: 'Work', number: '' }]; }
  removePhone(i: number) { this.form.phones = this.form.phones!.filter((_, idx) => idx !== i); }

  save() {
    this.loading = true;
    this.error = '';
    const agent = this.agents.find(a => a._id === this.form.assignedTo);
    if (agent) this.form.assignedToName = agent.name;

    const obs = this.contact
      ? this.contactService.updateContact(this.contact._id, this.form)
      : this.contactService.createContact(this.form);

    obs.subscribe({
      next: () => { this.loading = false; this.saved.emit(); },
      error: (err) => { this.error = err.error?.message || 'Failed to save contact.'; this.loading = false; },
    });
  }
}
