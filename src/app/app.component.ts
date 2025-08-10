import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, RouterOutlet } from '@angular/router';

interface Customer {
  name: string;
  amount: number;
  note: string;
}

@Component({
  selector: 'app-root',
  imports: [
    RouterModule,
    RouterOutlet,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})

export class AppComponent {
  addPayment: FormGroup;
  name = '';
  amount: number | null = null;
  note = '';
  total = 0;
  customerList: Customer[] = [];
  responseMessage: string | null = null;
  
  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.addPayment = this.formBuilder.group({
      name: [''],
      amount: [''],
      note: [''],
    });
  }


  // onSubmit() {
  //   if (this.amount === null) {
  //     alert('Please fill in all fields correctly.');
  //     return;
  //   }

  //   const newCustomer: Customer = {
  //     name: this.name,
  //     amount: this.amount,
  //     note: this.note,
  //   };

  //   this.customerList.push(newCustomer);
  //   this.total += this.amount;
  // }

  onSubmit() { 
    const formData = this.addPayment.value;
    this.http.post('/form-data.json', formData)
    .subscribe(
      (response) => {
        console.log('Form Data submitted successfully:', response);
        this.responseMessage = 'Form Data submitted successfully!';
        this.addPayment.reset();
      },
      (error) => {
        console.error('Error submitting form data:', error);
        this.responseMessage = 'Error submitting form data. Please try again.';
      }
    );  

    // Clear form
    this.name = '';
    this.amount = null;
    this.note = '';
  }
}
