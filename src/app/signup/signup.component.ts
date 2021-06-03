import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true} }]
})

export class SignupComponent implements OnInit {
  private subs = new Subscription();
  
  neighborhood = new FormControl();
  filteredOptions!: Observable<string[]>;

  emailAndPassword!: FormGroup;
  details!: FormGroup;
  hobbies!: FormGroup;

  fourthFormGroup!: FormGroup;
  hidePassword:boolean=false;
  states: string[] = [
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
    'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky'];
  hobbiesArr: string[]=['מועדון גברים','סיוע טכנולגי','עזרה בקניות','רכישת תרופות','ליווי לבתי חולים'];

  isBigScreen:boolean=true;
  

  constructor(private fb: FormBuilder, private observer: BreakpointObserver) {}  

  ngAfterViewInit() {

    setTimeout(() => {
      this.subs.add(
        this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
          if (res.matches)
            this.isBigScreen=false;
          else
            this.isBigScreen=true;     
          
        }))
    });

  }

  ngOnInit() {
    this.emailAndPassword = this.fb.group({
      email:['',Validators.email],
      password:['']
    });

    this.details = this.fb.group({
      fName: [''],
      lName: [''],
      phone: [''],
      street: [''],
      age: ['',Validators.min(0)],
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
   
    this.filteredOptions = this.neighborhood.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
    );
  }


  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.states.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  
  getErrorMessage() {
    if (this.neighborhood.hasError('required')) {
      return 'נא לבחור מהרשימה';
    }

    return this.neighborhood.hasError('email') ? 'Not a valid email' : '';

  }
  print(){
    console.log(this.emailAndPassword.value)
    console.log(this.details.value)
    console.log(this.hobbies.value)
  }

}
