import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

interface Customer {
  name: string;
  amount: number;
  note: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  name = '';
  amount: number | null = null;
  note = '';
  total = 0;
  customerList: Customer[] = [];

  addPayment() {
    if (!this.name || this.amount === null || isNaN(this.amount)) {
      alert('Please fill in all fields correctly.');
      return;
    }

    const newCustomer: Customer = {
      name: this.name,
      amount: this.amount,
      note: this.note,
    };

    this.customerList.push(newCustomer);
    this.total += this.amount;

    // Clear form
    this.name = '';
    this.amount = null;
    this.note = '';
  }
}
