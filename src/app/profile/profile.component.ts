import { AfterViewChecked, Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { AuthService } from '../services/auth/auth.service';
import { GetDataService } from '../services/get-data/get-data.service';
import { containsValidator, legalValidator } from '../signup/signup.component';
import { areaCoord, Volunteer } from '../types/customTypes';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewChecked, OnDestroy {

  meh!: any
  langsArr: string[] = ['עברית', 'אנגלית', 'ערבית', 'רוסית', 'אמהרית', 'צרפתית'];
  isAdmin!: boolean;
  uid!: string;
  userInfo!: Volunteer | undefined
  private subs = new Subscription()
  details!: FormGroup;
  neighborhoods!: string[]
  hobbiesArr: string[] = ['הרצאות', 'הדרכת מחשבים/ סמארטפונים', 'ביקורי בית', 'חבר טלפוני'];
  filteredOptions!: Observable<string[]>;

  constructor(
    private authService: AuthService,
    private dataProvider: GetDataService,
    private fb: FormBuilder,
    readonly snackBar: MatSnackBar,
    private afs: AngularFirestore,
    private dialog: MatDialog,
    private router: Router,
  ) {
    this.uid = authService.uid
  }

  ngOnInit(): void {
    this.subs.add(
      combineLatest([this.authService.authData$, this.dataProvider.getJerNeighborhoods(), this.dataProvider.getVolInfo(this.uid)])
        .subscribe(([auth, jerNeighbs, data]) => {
          this.uid = auth.uid
          this.isAdmin = auth.admin
          this.userInfo = data;
          this.neighborhoods = jerNeighbs.map(neighb => neighb.id)


          this.details = this.fb.group({
            email: [{ value: this.userInfo?.email, disabled: false }, Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")],
            fName: [this.userInfo?.fName],
            lName: [this.userInfo?.lName],
            phone: [{ value: this.userInfo?.phone, disabled: false }, [Validators.maxLength(10), Validators.minLength(7)]],
            neighborhood: [{ value: this.userInfo?.neighborhood, disabled: false }, containsValidator(this.neighborhoods)],
            street: [this.userInfo?.street],
            age: [this.userInfo?.age, [Validators.min(10), Validators.max(120), Validators.required]],
            gender: [this.userInfo?.gender, Validators.required],
            id: [this.userInfo?.personal_id, [Validators.required, legalValidator()]],
            hobbs: this.fb.group({
              hobb: this.fb.array(this.userInfo?.hobbies ?? [], [Validators.required])
            }),
            langs: this.fb.group({
              lang: this.fb.array(this.userInfo?.langs ?? [], [Validators.required])
            }),
            volType: [this.userInfo?.volType, [Validators.required]],
            education: [this.userInfo?.education, [Validators.required]],
            pastVoulnteer: [this.userInfo?.pastVoulnteer, Validators.required],
            enviroment: [this.userInfo?.enviroment],
            lastVolDate: [this.userInfo?.lastVolDate],
            expectations: [this.userInfo?.expectations],
            numOfDays: [{ value: this.userInfo?.numOfDays, disabled: false }, [Validators.required, Validators.minLength(1), Validators.maxLength(7)]],
            numOfHours: [{ value: this.userInfo?.numOfHours, disabled: false }, [Validators.required, Validators.minLength(1), Validators.maxLength(8)]],
          });
          if (this.details.get('neighborhood') != null)
            this.filteredOptions = this.details.get('neighborhood')!.valueChanges.pipe(
              startWith(''),
              map(value => this._filter(value))
            );
        })
    )
  }

  ngAfterViewChecked() {
    this.userInfo?.hobbies.forEach(hob => {
      let ref = document.getElementById(`${hob.trim()}`)
      if (ref) {
        ref.setAttribute("checked", "true");
      }
    })
    this.userInfo?.langs.forEach(lang => {
      let ref = document.getElementById(`${lang.trim()}`)
      if (ref) {
        ref.setAttribute("checked", "true");
      }
    })
  }

  //filter function for neighborhoods 
  private _filter(value: string): string[] {
    const filterValue = (value === null) ? '' : value.toLowerCase();
    return this.neighborhoods.filter(option => option.toLowerCase().indexOf(filterValue) === 0);
  }

  enable(formcontrol: any) {
    this.details.controls[formcontrol].enable()
  }

  onCheckboxChange(e: any, str: string, str2: string) {
    const checkArray: FormArray = this.details.get(str)?.get(str2) as FormArray;

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

  updateDoc() {
    if (this.details.invalid) {
      this.snackBar.open("נא לתקן כל מה שבאדום!", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      return;
    }
    else {
      this.afs.collection('Volunteers').doc(`${this.uid}`).update({
        fName: this.details.get('fName')?.value,
        lName: this.details.get('lName')?.value,
        email: this.userInfo?.email,
        phone: this.details.get('phone')?.value,
        city: 'ירושלים',
        neighborhood: this.details.get('neighborhood')?.value,
        street: this.details.get('street')?.value ?? null,
        age: this.details.get('age')?.value,
        gender: this.details.get('gender')?.value,
        personal_id: this.details.get('id')?.value,
        hobbies: this.details.get('hobbs')?.get('hobb')?.value,
        langs: this.details.get('langs')?.get('lang')?.value,
        volType: this.details.get('volType')?.value,
        education: this.details.get('education')?.value,
        pastVoulnteer: this.details.get('pastVoulnteer')?.value,
        enviroment: this.details.get('enviroment')?.value ?? null,
        lastVolDate: this.details.get('lastVolDate')?.value ?? null,
        expectations: this.details.get('expectations')?.value ?? null,
        numOfDays: this.details.get('numOfDays')?.value ?? null,
        numOfHours: this.details.get('numOfHours')?.value ?? null,
        bio: this.userInfo?.bio
      }).then((result: any) => {
        this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      }).catch((err: any) => {
        this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      })
    }
  }

  joinArray(arr: any[]) {
    return arr.join()
  }

  resetPass() {
    if (this.userInfo) {
      if (this.authService.reset(this.userInfo.email))
        this.snackBar.open("מייל לאיפוס הסיסמא נשלח בהצלחה! נא לבדוק", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      else
        this.snackBar.open("קרתה שגיאה, נא לנסות שוב בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }
  }

  deleteAccount() {
    const docRef = this.afs.collection('Volunteers').doc(`${this.uid}`)

    let element: any = {}
    element.dialogTitle = 'בטוח למחוק את החשבון?'
    element.action = 'Delete';
    element.dialogType = ''
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event != 'Cancel' && docRef) {
        this.authService.logout()
        docRef.delete().then(() => {
          this.snackBar.open("הנתונים עודכנו בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          this.router.navigate(['']);
        }).catch((error: any) => {
          this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        });
      }
    })
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


}
