import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ContactService, Contact } from '../../core/services/contact.service';
import { AuthService } from '../../core/services/auth.service';
import { ContactFormComponent } from './contact-form/contact-form.component';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ContactFormComponent],
  templateUrl: './contacts.component.html',
  styleUrl: './contacts.component.scss',
})
export class ContactsComponent implements OnInit {
  private contactService = inject(ContactService);
  auth = inject(AuthService);

  contacts: Contact[] = [];
  total = 0;
  loading = signal(true);
  showForm = signal(false);
  editingContact: Contact | null = null;
  searchQuery = '';
  statusFilter = '';
  sourceFilter = '';

  sources = ['Website', 'Referral', 'Cold Call', 'Social Media', 'Email', 'Event', 'Other'];

  ngOnInit() { this.loadContacts(); }

  loadContacts() {
    this.loading.set(true);
    const filters: any = {};
    if (this.statusFilter) filters.status = this.statusFilter;
    if (this.sourceFilter) filters.source = this.sourceFilter;
    if (this.searchQuery) filters.search = this.searchQuery;
    this.contactService.getContacts(filters).subscribe({
      next: ({ contacts, total }) => { this.contacts = contacts; this.total = total; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate() { this.editingContact = null; this.showForm.set(true); }
  openEdit(c: Contact) { this.editingContact = c; this.showForm.set(true); }
  closeForm() { this.showForm.set(false); this.editingContact = null; }
  onFormSaved() { this.closeForm(); this.loadContacts(); }

  deleteContact(c: Contact) {
    if (!confirm(`Delete contact ${c.firstName} ${c.lastName}?`)) return;
    this.contactService.deleteContact(c._id).subscribe(() => this.loadContacts());
  }

  onSearch() { this.loadContacts(); }
  clearFilters() { this.searchQuery = ''; this.statusFilter = ''; this.sourceFilter = ''; this.loadContacts(); }

  fullName(c: Contact) { return `${c.firstName} ${c.lastName}`; }
  primaryPhone(c: Contact) { return c.phones?.[0]?.number || '—'; }
  isAdmin() { return this.auth.hasRole('admin'); }
}
