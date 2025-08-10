import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Firestore, addDoc, collection, collectionData } from '@angular/fire/firestore';
import { Auth, user } from '@angular/fire/auth';

@Component({
  selector: 'app-folderview',
  imports: [
    CommonModule, 
    FormsModule,
    RouterModule,
  ],
  templateUrl: './folderview.component.html'
})
export class FolderviewComponent implements OnInit {
  private afs = inject(Firestore);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);

  userId = '';
  folderId = '';
  entries: any[] = [];
  name = '';
  amount: number | null = null;
  note = '';
  isToday = false;
  
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
        collectionData(entriesRef, { idField: 'id' })
        .subscribe((entries) => {
          this.entries = entries;
        });
      }
    });
  }

  addEntry() {
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
      this.amount = null ;
      this.note = '';
    });
  }
}
