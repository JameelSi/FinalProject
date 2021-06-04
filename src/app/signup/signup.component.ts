import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {Observable, Subscription} from 'rxjs';
import {map, startWith} from 'rxjs/operators';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {signupUser} from '../types/user'
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
      neighborhood:['',this.containsValidator],
      street: [''],
      age: ['',Validators.min(0)],
      gender: ['']
    });

    this.details2 = this.fb.group({
      hobbs: this.fb.group({
        item1:[''],
        item2:[''],
        item3:[''],
        item4:[''],  
        item5:['']
      }),
      langs:this.fb.group({
        item1:[''],
        item2:[''],
        item3:[''],
        item4:[''],
        item5:[''],
        item6:['']
      }),
      type: this.fb.group({
        item1:[''],
        item2:[''],
        item3:[''],
        item4:[''],
        item5:['']
      })
      ,social: this.fb.group({
        item1:[''],
        item2:[''],
        item3:['']
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

  private containsValidator(neighs: FormControl) {
    
    if (neighs.value && this.neighborhoods.indexOf('yo')==-1) 
      return {'contains': true};
    return null;
  }
  // private containsValidator(control: AbstractControl): { [key: string]: boolean } | null {
  //   if (control.value !== undefined && this.neighborhoods.indexOf(control.value)==-1) {
  //       return { 'contains': true };
  //   }
  //   return null;
  // } 

  // private containsValidator(neighs: FormControl) {
  //   if (neighs.value && this.neighborhoods.indexOf(neighs.value)==-1) {
  //     return {
  //       'contains': true
  //     };
  //   }
  //   return null
  // }
  
  getErrorMessage() {
    if (this.details.get('neighborhood')?.hasError('contains')) {
      return 'נא לבחור מהרשימה';
    }
    return this.details.get('neighborhood')?.hasError('required') ? 'שדה חובה' : '';
  }

  fillUserArraies(arr:Array<String>, str:string | (string | number)[]){
    let i,index=0;

    for(i in this.details2.get(str)?.value){
      if(this.details2.get(str)?.value[i])
      arr.push(this.hobbiesArr[index])
      index++
    }

  }
  
  createUser(){
    if(this.emailAndPassword.invalid||this.details.invalid||this.details2.invalid)
      return;
    var selectedHobbs:Array<string>=[],selectedLangs:Array<string>=[],selectedType:Array<string>=[],selectedStatus:Array<string>=[];
    this.fillUserArraies(selectedHobbs,'hobbs');
    this.fillUserArraies(selectedLangs,'langs');
    this.fillUserArraies(selectedType,'type');
    this.fillUserArraies(selectedStatus,'social');
    const user: signupUser= {
        fName: this.details.get('fName')?.value,
        lName: this.details.get('lName')?.value,
        phone: this.details.get('phone')?.value,
        city: 'ירושלים',
        neighborhood: this.details.get('neighborhood')?.value,
        street: this.details.get('street')?.value,
        age: this.details.get('age')?.value,
        id: this.details.get('id')?.value,
        hobbies:selectedHobbs,
        langs:selectedLangs,
        type:selectedType,
        status:selectedStatus,
        message: this.details2.get('message')?.value
    };
    
  }

}
