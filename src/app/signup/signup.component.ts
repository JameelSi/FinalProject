import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth/auth.service';
import { AngularFirestore } from '@angular/fire/firestore'
import { ActivatedRoute, Router } from '@angular/router';
import { GetDataService } from '../services/get-data/get-data.service';
import { Elderly, Volunteer } from '../types/customTypes';

// for AutoComplete - validate that user picks from the list
export function containsValidator(validOptions: Array<string>) {
  return (control: FormControl): { [key: string]: any } | null => {
    if (validOptions.indexOf(control.value) !== -1) {
      return null
    }
    return { 'contains': true }
  }
}
export function legalValidator() {
  return (control: FormControl): { [key: string]: any } | null => {

    let temp = 0;
    let ID = new String(control.value)
    while (ID.length < 9)
      ID = "0" + ID;
    for (var i = 0; i < 8; i++) {
      let y;
      let x = (((i % 2) + 1) * Number(ID.charAt(i)));

      if (x > 9) {
        y = String(x)
        x = Number(y.charAt(0)) + Number(y.charAt(1))
      }
      temp += x;
    }

    if ((temp + Number(ID.charAt(8))) % 10 == 0) {
      // id is ok
      return null
    }
    return { 'legal': true }
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  providers: [{ provide: STEPPER_GLOBAL_OPTIONS, useValue: { showError: true } }]
})

export class SignupComponent implements OnInit {
  ready = false;
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

  invalidCreation = false;

  // for volunteers
  hidePassword: boolean = true;
  neighborhoods: string[] = [];
  hobbiesArr: string[] = ['הרצאות', 'הדרכת מחשבים/ סמארטפונים', 'ביקורי בית', 'חבר טלפוני'];
  volTypeArr: string[] = ['כללי', 'סטודנט', 'חייל', 'תלמיד תיכון', 'תנועות נוער'];
  education: string[] = ["אקדמאית", "על-תיכונית", "תיכונית", "מקצועית"]
  _volType!: string

  langsArr: string[] = ['עברית', 'אנגלית', 'ערבית', 'רוסית', 'אמהרית', 'צרפתית'];

  // for elderlies
  needsArr: string[] = ['מועדון/ מרכז חברתי', 'מועדון גברים', 'סיוע טכנולגי', 'עזרה בקניות', 'רכישת תרופות', 'ליווי לבתי חולים'];
  statusArr: string[] = ['נשוי', 'אלמן', 'רווק'];
  _maritalStatus!: string

  collec!: string

  constructor(
    private fb: FormBuilder,
    private observer: BreakpointObserver,
    readonly snackBar: MatSnackBar,
    private authService: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private dataProvider: GetDataService,
    private route: ActivatedRoute,
  ) {
    this.ready = false;
  }

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
    this.subs.add(combineLatest([this.route.params, this.dataProvider.getJerNeighborhoods()]).subscribe(([routeParams, jerNeighbs]) => {
      this.collec = routeParams.userType ?? 'Volunteers'
      this.neighborhoods = jerNeighbs.map(neighb => neighb.id)
      // this.subs.add(this.dataProvider.getJerNeighborhoods().subscribe(jerNeighbs => {
      if (this.collec === "Volunteers") {
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
          age: ['', [Validators.min(10), Validators.max(120), Validators.required]],
          gender: ['', Validators.required],
          id: ['', [Validators.required, legalValidator()]]
        });

        this.details2 = this.fb.group({
          hobbs: this.fb.group({
            hobb: this.fb.array([], [Validators.required])
          }),
          langs: this.fb.group({
            lang: this.fb.array([], [Validators.required])
          }),
          volType: ['', [Validators.required]],
          education: ['', [Validators.required]],
          pastVoulnteer: ['', Validators.required],
          enviroment: [''],
          lastVolDate: [''],
          expectations: [''],
          numOfDays: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
          numOfHours: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(8)]],
        });
      }
      else if (this.collec === "Elderlies") {
        this.details = this.fb.group({
          fName: [''],
          lName: [''],
          phone: ['', [Validators.maxLength(10), Validators.minLength(7)]],
          email: ['', Validators.email],
          neighborhood: ['', containsValidator(this.neighborhoods)],
          street: [''],
          age: ['', [Validators.min(55), Validators.max(120), Validators.required]],
          gender: ['']
        });

        this.details2 = this.fb.group({
          needs: this.fb.group({
            need: this.fb.array([], [Validators.required])
          }),
          langs: this.fb.group({
            lang: this.fb.array([], [Validators.required])
          }),
          socials: ['', Validators.required]
        });
      }

      this.fourthFormGroup = this.fb.group({
        bio: ['']
      });
      this.ready = true
      if (this.details.get('neighborhood') != null)
        this.filteredOptions = this.details.get('neighborhood')!.valueChanges.pipe(
          startWith(''),
          map(value => this._filter(value))
        );
    }));

    // }))

  }

  ngOnDestroy() {
    this.subs.unsubscribe()
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
      if (this.emailAndPassword?.get('email')?.hasError('required') || this.details.get('email')?.hasError('required'))
        return 'שדה חובה';
      if (this.emailAndPassword?.get('email')?.hasError('pattern') || this.details.get('email')?.hasError('pattern'))
        return 'האמייל שהוכנס לא תקין';
      else
        return ''
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
    else if (type == 4) {
      if (this.details2.get('numOfDays')?.hasError('required'))
        return 'שדה חובה';
      return this.details2.get('numOfDays')?.hasError('minlength') || this.details2.get('numOfDays')?.hasError('maxlength') ? 'נא להכניס מספר בין 1-7' : '';
    }
    else if (type == 5) {
      if (this.details2.get('numOfHours')?.hasError('required'))
        return 'שדה חובה';
      return this.details2.get('numOfHours')?.hasError('minlength') || this.details2.get('numOfDays')?.hasError('maxlength') ? 'נא להכניס מספר בין 1-8' : '';
    }
    else if (type == 6) {
      if (this.details.get('age')?.hasError('required'))
        return 'שדה חובה';
      return this.details.get('age')?.hasError('minlength') || this.details2.get('numOfDays')?.hasError('maxlength') ? 'נא להכניס גיל תקין' : '';
    }
    else if (type == 7) {
      if (this.details.get('id')?.hasError('required'))
        return 'שדה חובה';
      return this.details.get('id')?.hasError('legal') ? 'נא להכניס ת.ז תקינה' : '';
    }
    else {
      if (this.details.get('neighborhood')?.hasError('required'))
        return 'שדה חובה';
      return this.details.get('neighborhood')?.hasError('contains') ? 'נא לבחור מהרשימה' : '';
    }
  }


  createVolunteer() {
    if (this.emailAndPassword.invalid || this.details.invalid || this.details2.invalid) {
      this.snackBar.open("נא להשלים כל מה שבאדום!", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      return;
    }
    //try creating a new user 
    this.authService.signUp(this.emailAndPassword.get('email')?.value, this.emailAndPassword.get('password')?.value, this.collec)
      .then(result => {
        // if the email already exists return and show an error 
        if (!result)
          this.invalidCreation = true;
        // user created
        else {
          this.invalidCreation = false;
          if (this.details2.get('pastVoulnteer')?.value == "לא") {
            this.details2.get('enviroment')?.setValue(null)
            this.details2.get('expectations')?.setValue(null)
          }
          this.afs.collection(this.collec).doc(`${result.uid}`).set({
            fName: this.details.get('fName')?.value,
            lName: this.details.get('lName')?.value,
            email: result.email,
            phone: this.details.get('phone')?.value,
            city: 'ירושלים',
            neighborhood: this.details.get('neighborhood')?.value,
            street: this.details.get('street')?.value ?? null,
            age: this.details.get('age')?.value,
            gender: this.details.get('gender')?.value,
            personal_id: this.details.get('id')?.value,
            hobbies: this.details2.get('hobbs')?.get('hobb')?.value,
            langs: this.details2.get('langs')?.get('lang')?.value,
            volType: this.details2.get('volType')?.value,
            education: this.details2.get('education')?.value,
            pastVoulnteer: this.details2.get('pastVoulnteer')?.value,
            enviroment: this.details2.get('enviroment')?.value ?? null,
            lastVolDate: this.details2.get('lastVolDate')?.value ?? null,
            expectations: this.details2.get('expectations')?.value ?? null,
            numOfDays: this.details2.get('numOfDays')?.value ?? null,
            numOfHours: this.details2.get('numOfHours')?.value ?? null,
            bio: this.fourthFormGroup.get('bio')?.value ?? null,
          }).then(result => {
            this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
            this.router.navigate(['']);
          }).catch(err => {
            console.log(err)
            this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          })
        }
      }).catch(err => {
        // console.log('err from signup, auth func')
      })
  }

  createElderly() {

    if (this.details.invalid || this.details2.invalid) {
      this.snackBar.open("נא להשלים כל מה שבאדום!", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      return;
    }
    this.afs.collection(this.collec).add({
      fName: this.details.get('fName')?.value,
      lName: this.details.get('lName')?.value,
      phone: this.details.get('phone')?.value,
      email: this.details.get('email')?.value ?? null,
      city: 'ירושלים',
      neighborhood: this.details.get('neighborhood')?.value,
      street: this.details.get('street')?.value ?? null,
      age: this.details.get('age')?.value,
      gender: this.details.get('gender')?.value ?? null,
      needs: this.details2.get('needs')?.get('need')?.value,
      langs: this.details2.get('langs')?.get('lang')?.value,
      maritalStatus: this.details2.get('socials')?.value ?? null,
      bio: this.fourthFormGroup.get('bio')?.value ?? null
    }).then(result => {
      this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      this.router.navigate(['']);
    }).catch(err => {
      this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    })
  }

}