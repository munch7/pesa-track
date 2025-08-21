import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  Firestore, 
  doc,
  deleteDoc,
  addDoc, 
  collection, 
  collectionData, 
  updateDoc
} from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-folderview',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './folderview.component.html',
  styleUrl: './folderview.component.css'
})
export class FolderviewComponent implements OnInit, OnDestroy {
  private afs = inject(Firestore);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  userId = '';
  folderId = '';
  entries: any[] = [];
  name = '';
  amount: number | null = null;
  note = '';
  isToday = false;
  
  editingEntryId: string | null = null;
  editName = '';
  editAmount: number | null = null;
  editNote = '';

  private entriesSub?: Subscription;

  ngOnInit() {
    this.folderId = this.route.snapshot.paramMap.get('folderId')!;

    const todayStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    this.isToday = (this.folderId === todayStr);

    user(this.auth).subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        const entriesRef = collection(
          this.afs,
          `users/${user.uid}/folders/${this.folderId}/entries`
        );
        this.entriesSub = collectionData(entriesRef, { idField: 'id' })
          .subscribe((entries) => {
            this.entries = entries;
          });
      }
    });
  }

  ngOnDestroy() {
    this.entriesSub?.unsubscribe();
  }

  getTotalAmount(): number {
    if (!this.entries) return 0;
    return this.entries.reduce((sum, e) => sum + (+e.amount || 0), 0);
  }

  addEntry() {
    if (!this.userId || !this.folderId) return;

    const entry = {
      name: this.name,
      amount: this.amount,
      note: this.note,
      date: new Date()
    };
    const entriesRef = collection(
      this.afs,
      `users/${this.userId}/folders/${this.folderId}/entries`
    );
    addDoc(entriesRef, entry).then(() => {
      this.name = '';
      this.amount = null;
      this.note = '';
    });
  }

  deleteEntry(entryId: string) {
    if (!this.userId || !this.folderId) return;

    const entryDoc = doc(this.afs, `users/${this.userId}/folders/${this.folderId}/entries/${entryId}`);
    deleteDoc(entryDoc).catch(err => console.error('Delete Failed:', err));
  }

  startEditing(entry: any) {
    this.editingEntryId = entry.id;
    this.editName = entry.name;
    this.editAmount = entry.amount;
    this.editNote = entry.note;
  }

  cancelEditing() {
    this.editingEntryId = null;
  }

  saveEntry() {
    if (!this.editingEntryId) return;
    const entryDoc = doc(this.afs, `users/${this.userId}/folders/${this.folderId}/entries/${this.editingEntryId}`);
    updateDoc(entryDoc, {
      name: this.editName,
      amount: this.editAmount,
      note: this.editNote
    }).then(() => {
      this.editingEntryId = null;
    }).catch(err => console.error('Update failed:', err));
  }

  closeFolder() {
    this.router.navigate(['/dashboard']);
  }
}
