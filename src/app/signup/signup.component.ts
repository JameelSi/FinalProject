import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {map, startWith} from 'rxjs/operators';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  myControl = new FormControl();
  filteredOptions!: Observable<string[]>;

  emailAndPassword!: FormGroup;
  details!: FormGroup;
  hobbies!: FormGroup;


  fourthFormGroup!: FormGroup;
  hidePassword:boolean=false;
  states: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky'];

  constructor(private fb: FormBuilder) {}  

  ngOnInit() {
    this.emailAndPassword = this.fb.group({
      email:['',Validators.email],
      password:['']
    });

    this.details = this.fb.group({
      fName: [''],
      lName: [''],
      phone: [''],
      neighborhood: [''],
      street: [''],
      age: [''],
      gender: [''],
    });

    this.hobbies = this.fb.group({
      thirdCtrl: ['', Validators.required],
      hobbs: this.fb.group({
        first:[''],
        second:[''],
        third:[''],
        fourth:[''],
        fifth:['']
      }),
      langs:this.fb.group({
        first:[''],
        second:[''],
        third:[''],
        fourth:[''],
        fifth:[''],
        sixth:['']
      }),
      type: this.fb.group({
        first:[''],
        second:[''],
        third:[''],
        fourth:[''],
        fifth:['']
      })
      ,social: this.fb.group({
        first:[''],
        second:[''],
        third:['']
      }),
      bio:['']

    });

    this.fourthFormGroup = this.fb.group({
      fourthCtrl: ['', Validators.required]
    });
   
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.states.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  
  getErrorMessage() {
    if (this.myControl.hasError('required')) {
      return 'You must enter a value';
    }

    return this.myControl.hasError('email') ? 'Not a valid email' : '';
  }

}
