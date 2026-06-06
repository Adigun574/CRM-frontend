import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContactService, Contact } from '../../../core/services/contact.service';
import { AuthService } from '../../../core/services/auth.service';
import { ContactFormComponent } from '../contact-form/contact-form.component';

@Component({
  selector: 'app-contact-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ContactFormComponent],
  templateUrl: './contact-detail.component.html',
  styleUrl: './contact-detail.component.scss',
})
export class ContactDetailComponent implements OnInit {
  private contactService = inject(ContactService);
  private route = inject(ActivatedRoute);
  auth = inject(AuthService);

  contact: Contact | null = null;
  loading = signal(true);
  showEditForm = signal(false);
  showInteractionForm = false;
  savingInteraction = false;

  interactionForm = { type: 'Call', summary: '' };
  interactionTypes = ['Call', 'Email', 'Meeting', 'Note', 'Other'];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.loadContact(id);
  }

  loadContact(id: string) {
    this.loading.set(true);
    this.contactService.getContactById(id).subscribe({
      next: (c) => { this.contact = c; this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onFormSaved() {
    this.showEditForm.set(false);
    this.loadContact(this.contact!._id);
  }

  addInteraction() {
    if (!this.interactionForm.summary.trim()) return;
    this.savingInteraction = true;
    this.contactService.addInteraction(this.contact!._id, this.interactionForm).subscribe({
      next: (c) => {
        this.contact = c;
        this.interactionForm = { type: 'Call', summary: '' };
        this.showInteractionForm = false;
        this.savingInteraction = false;
      },
      error: () => { this.savingInteraction = false; },
    });
  }

  interactionIcon(type: string) {
    const map: Record<string, string> = { Call: 'phone', Email: 'email', Meeting: 'groups', Note: 'sticky_note_2', Other: 'chat' };
    return map[type] || 'chat';
  }

  socialLinks(c: Contact) {
    return Object.entries(c.social || {}).filter(([, v]) => !!v);
  }

  fullName(c: Contact) { return `${c.firstName} ${c.lastName}`; }
  isAdmin() { return this.auth.hasRole('admin'); }
}
