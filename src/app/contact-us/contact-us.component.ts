import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AbstractControlOptions, FormBuilder, FormControl, FormGroup, FormGroupDirective, ValidatorFn, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  messageForm!: FormGroup

  constructor(private fb: FormBuilder, private afs: AngularFirestore, readonly snackBar: MatSnackBar,) {
    this.messageForm = this.fb.group({
      name: ['', Validators.required],
      phone: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      content: ['', Validators.required],
    });
  }

  ngOnInit(): void {
  }

  onSubmit(formDirective: FormGroupDirective) {
    // content: JSON.stringify(this.messageForm.controls.content.value),
    if (this.messageForm.valid) {
      this.afs.collection('Messages').add({
        name: this.messageForm.controls.name.value,
        phone: this.messageForm.controls.phone.value,
        email: this.messageForm.controls.email.value,
        content: this.messageForm.controls.content.value,
        date: new Date(),
        read: false
      }).then(res => {
        // resets values + validators of the whole form
        formDirective.resetForm()
        // ensure reset values of form group
        this.messageForm.reset()
        this.snackBar.open("ההודעה נשלחה בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      }).catch(err => {
        this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      })
    } else {
      this.snackBar.open("נא להשלים את הפרטים/ להזין פרטים תקינים", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }
  }

  get name() { return this.messageForm.get('name'); }

  get phone() { return this.messageForm.get('phone'); }

  get email() { return this.messageForm.get('email'); }

  get content() { return this.messageForm.get('content'); }


}
