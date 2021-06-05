import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {signupUser} from '../types/user'


// for AutoComplete - validate that user picks from the list
function containsValidator(validOptions: Array<string>) {
  return (control: FormControl): { [key: string]: any } | null => {
    if (validOptions.indexOf(control.value) !== -1) {
      return null  
    }
    return { 'contains': true} }
  }
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: {showError: true} }]
})

export class SignupComponent implements OnInit {
  // screen width subscriber
  subs = new Subscription();
  // observor for neighborhood field  
  filteredOptions!: Observable<string[]>;
  isBigScreen:boolean=true;
  //form groups
  emailAndPassword!: FormGroup;
  details!: FormGroup;
  details2!: FormGroup;
  fourthFormGroup!: FormGroup;

  hidePassword:boolean=true;
  neighborhoods: string[] = ['מאה שערים', 'פסגת זאב', 'נווה יעקב', 'גבעת רם', 'הר הצופים'];
  hobbiesArr: string[]=['מועדון גברים','סיוע טכנולגי','עזרה בקניות','רכישת תרופות','ליווי לבתי חולים'];
  langsArr: string[]=['עברית','אנגלית','ערבית','רוסית','אמהרית','צרפתית'];
  typeArr:string[]=['כללי','סטודנט','חייל','תלמיד תיכון','תנועות נוער'];
  statusArr:string[]=['נשוי','אלמן','רווק'];
  

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
      neighborhood:['',containsValidator(this.neighborhoods)],
      street: [''],
      age: ['',Validators.min(0)],
      gender: ['']
    });

    this.details2 = this.fb.group({
      
      hobbs:this.fb.group({
        hobb:this.fb.array([],[Validators.required])
      }),
      
      langs:this.fb.group({
        lang:this.fb.array([],[Validators.required])
      }),
      types: this.fb.group({
        type:this.fb.array([],[Validators.required])
      }),
      socials: this.fb.group({
        social:this.fb.array([],[Validators.required])
      }),
      bio:['']
      
    });
    
    this.fourthFormGroup = this.fb.group({
      
    });
    
    
    if(this.details.get('neighborhood')!=null)
    this.filteredOptions = this.details.get('neighborhood')!.valueChanges.pipe(
      startWith(''),
      map(value => this._filter(value))
      );
    }
    
    //filter function for neighborhoods 
    private _filter(value: string): string[] {
      const filterValue = (value === null) ? '' : value.toLowerCase();
      return this.neighborhoods.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
    }
    
    getErrorMessage() {
      if (this.details.get('neighborhood')?.hasError('contains')) {
      return 'נא לבחור מהרשימה';
    }
    return this.details.get('neighborhood')?.hasError('required') ? 'שדה חובה' : '';
  }
  
  createUser(){
    const user: signupUser= {
      fName: this.details.get('fName')?.value,
      lName: this.details.get('lName')?.value,
      phone: this.details.get('phone')?.value,
      city: 'ירושלים',
      neighborhood: this.details.get('neighborhood')?.value,
      street: this.details.get('street')?.value,
      age: this.details.get('age')?.value,
      id: this.details.get('id')?.value,
      hobbies:this.details2.get('hobbs')?.get('hobb')?.value,
      langs:this.details2.get('langs')?.get('lang')?.value,
      type:this.details2.get('types')?.get('type')?.value,
      status:this.details2.get('socials')?.get('social')?.value,
      message: this.details2.get('message')?.value
    };
    
  }
  
  onCheckboxChange(e:any,str:string,str2:string) {
    const checkArray: FormArray = this.details2.get(str)?.get(str2) as FormArray;
    
    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      checkArray.controls.forEach( (item) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }
  
}

// hobbs: this.fb.group({
//   item1:[''],
//   item2:[''],
//   item3:[''],
//   item4:[''],  
//   item5:['']
// }),
// hobbs: this.fb.array([]),