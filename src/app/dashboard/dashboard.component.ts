import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, signOut, user } from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
} from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private afs = inject(Firestore);
  private auth = inject(Auth);
  private router = inject(Router);

  user: any;
  folders: any[] = [];
  folderTotals: { [key: string]: number } = {};

  ngOnInit() {
    // 🔹 Listen to logged-in user
    user(this.auth).subscribe((u) => {
      this.user = u;
      if (u) {
        this.loadFolders();
      }
    });
  }

  loadFolders() {
    const foldersRef = collection(this.afs, `users/${this.user.uid}/folders`);
    collectionData(foldersRef, { idField: 'id' })
      .pipe(map((folders) => folders.map((f: any) => ({ id: f.id }))))
      .subscribe((folders) => {
        this.folders = folders;
        this.getFolderTotals();
      });
  }

  createFolder() {
    const dateStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const folderRef = doc(this.afs, `users/${this.user.uid}/folders/${dateStr}`);
    setDoc(folderRef, { created: new Date() }).then(() => {
      this.router.navigate(['/dashboard/folder', dateStr]);
    });
  }

  getFolderTotals() {
    for (let folder of this.folders) {
      const entriesRef = collection(
        this.afs,
        `users/${this.user.uid}/folders/${folder.id}/entries`
      );
      collectionData(entriesRef).subscribe((entries: any[]) => {
        this.folderTotals[folder.id] = entries.reduce(
          (sum, entry) => sum + (+entry.amount || 0),
          0
        );
      });
    }
  }

  logout() {
    signOut(this.auth).then(() => {
      this.router.navigate(['/login'])
    });
  }
}
