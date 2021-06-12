import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { signupUser } from '../types/user'
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth/auth.service';
import { AngularFirestore } from '@angular/fire/firestore'
import { Router } from '@angular/router';

// for AutoComplete - validate that user picks from the list
function containsValidator(validOptions: Array<string>) {
  return (control: FormControl): { [key: string]: any } | null => {
    if (validOptions.indexOf(control.value) !== -1) {
      return null
    }
    return { 'contains': true }
  }
}
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }]
})

export class SignupComponent implements OnInit {
  // screen width subscriber
  subs = new Subscription();
  // observor for neighborhood field  
  filteredOptions!: Observable<string[]>;
  isBigScreen: boolean = true;
  //form groups
  emailAndPassword!: FormGroup;
  details!: FormGroup;
  details2!: FormGroup;
  fourthFormGroup!: FormGroup;

  validCreation = false;
  showSteps = false;
  hidePassword: boolean = true;
  neighborhoods: string[] = ['מאה שערים', 'פסגת זאב', 'נווה יעקב', 'גבעת רם', 'הר הצופים'];
  hobbiesArr: string[] = ['מועדון גברים', 'סיוע טכנולגי', 'עזרה בקניות', 'רכישת תרופות', 'ליווי לבתי חולים'];
  langsArr: string[] = ['עברית', 'אנגלית', 'ערבית', 'רוסית', 'אמהרית', 'צרפתית'];
  typeArr: string[] = ['כללי', 'סטודנט', 'חייל', 'תלמיד תיכון', 'תנועות נוער'];
  statusArr: string[] = ['נשוי', 'אלמן', 'רווק'];


  constructor(
    private fb: FormBuilder,
    private observer: BreakpointObserver,
    readonly snackBar: MatSnackBar,
    private authService: AuthService,
    private afs: AngularFirestore,
    private router: Router,

  ) { }

  ngAfterViewInit() {

    setTimeout(() => {
      this.subs.add(
        this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
          if (res.matches)
            this.isBigScreen = false;
          else
            this.isBigScreen = true;

        }))
    });

  }

  ngOnInit() {
    this.emailAndPassword = this.fb.group({
      email: ['', Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")],
      password: ['', Validators.minLength(6)]
    });

    this.details = this.fb.group({
      fName: [''],
      lName: [''],
      phone: ['', [Validators.maxLength(10), Validators.minLength(7)]],
      neighborhood: ['', containsValidator(this.neighborhoods)],
      street: [''],
      age: ['', Validators.min(0)],
      gender: ['']
    });

    this.details2 = this.fb.group({

      hobbs: this.fb.group({
        hobb: this.fb.array([], [Validators.required])
      }),

      langs: this.fb.group({
        lang: this.fb.array([], [Validators.required])
      }),
      types: this.fb.group({
        type: this.fb.array([], [Validators.required])
      }),
      socials: this.fb.group({
        social: this.fb.array([], [Validators.required])
      }),
      bio: ['']

    });
    this.fourthFormGroup = this.fb.group({

    });


    if (this.details.get('neighborhood') != null)
      this.filteredOptions = this.details.get('neighborhood')!.valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
  }

  onCheckboxChange(e: any, str: string, str2: string) {
    const checkArray: FormArray = this.details2.get(str)?.get(str2) as FormArray;

    if (e.target.checked) {
      checkArray.push(new FormControl(e.target.value));
    } else {
      let i: number = 0;
      checkArray.controls.forEach((item) => {
        if (item.value == e.target.value) {
          checkArray.removeAt(i);
          return;
        }
        i++;
      });
    }
  }
  //filter function for neighborhoods 
  private _filter(value: string): string[] {
    const filterValue = (value === null) ? '' : value.toLowerCase();
    return this.neighborhoods.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  getErrorMessage(type?: number) {
    if (type == 1) {
      if (this.emailAndPassword.get('email')?.hasError('required'))
        return 'שדה חובה';
      return this.emailAndPassword.get('email')?.hasError('pattern') ? 'האמייל שהוכנס לא תקין' : '';
    }
    else if (type == 2) {
      if (this.emailAndPassword.get('password')?.hasError('required'))
        return 'שדה חובה';
      return this.emailAndPassword.get('password')?.hasError('minlength') ? ' אורך מינימלי של סיסמה הוא 6 תווים' : '';
    }
    else if (type == 3) {
      if (this.details.get('phone')?.hasError('required'))
        return 'שדה חובה';
      else if (this.details.get('phone')?.hasError('maxlength'))
        return 'מספר טלפון לא תקין';
      return this.details.get('phone')?.hasError('minlength') ? 'מספר טלפון לא תקין' : '';
    }
    else {
      if (this.details.get('neighborhood')?.hasError('required'))
        return 'שדה חובה';
      return this.details.get('neighborhood')?.hasError('contains') ? 'נא לבחור מהרשימה' : '';
    }
  }


  createUser() {
    if (this.emailAndPassword.invalid || this.details.invalid || this.details2.invalid) {
      this.snackBar.open("נא להשלים כל מהשבאדום!", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      return;
    }
    //try creating a new user 
    this.authService.signUp(this.emailAndPassword.get('email')?.value, this.emailAndPassword.get('password')?.value).then(result => {
      // if the email already exists return and show an error 
      if (!result)
        this.validCreation = true;
      // user created
      else {
        this.validCreation = true;
        let msg, street;
        if (!this.details2.get('message')?.value)
          msg = null;
        else
          msg = this.details2.get('message')?.value
        if (!this.details2.get('street')?.value)
          street = null;
        else
          street = this.details2.get('street')?.value

        this.afs.doc(`users/${result.uid}`).update({

          fName: this.details.get('fName')?.value,
          lName: this.details.get('lName')?.value,
          phone: this.details.get('phone')?.value,
          city: 'ירושלים',
          neighborhood: this.details.get('neighborhood')?.value,
          street: street,
          age: this.details.get('age')?.value,
          hobbies: this.details2.get('hobbs')?.get('hobb')?.value,
          langs: this.details2.get('langs')?.get('lang')?.value,
          type: this.details2.get('types')?.get('type')?.value,
          status: this.details2.get('socials')?.get('social')?.value,
          message: msg,
          admin: false
          
        }).then(result => {
          this.snackBar.open("התהליך סיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          this.router.navigate(['']);
        }).catch(err => {
          this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        })

      }
    }).catch(err => {
      console.log('err from signup')
    })
  }
}