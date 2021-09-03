import { Component, OnDestroy, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray, FormControl, FormGroupDirective, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import 'firebase/functions';
import { GetDataService } from '../services/get-data/get-data.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { MatDialog } from '@angular/material/dialog';

function forbiddenInputValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? {forbiddenInput: {value: control.value}} : null;
  };
}

@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SmsComponent implements OnInit, OnDestroy {

  forbiddenCharacters = ['~', '[', ']', '/', '*',];
  botCollec = "Bot"
  botResponsesDoc = "Responses"
  subs = new Subscription()
  botReplies!: any
  // newReply!: FormControl
  // newReceived!: FormControl
  newResponse: FormGroup
  controls!: FormArray;
  currControl!: any

  constructor(private afs: AngularFirestore,
    private fb: FormBuilder,
    private dataProvider: GetDataService,
    private dialog: MatDialog,
    readonly snackBar: MatSnackBar,) { 
      this.newResponse = this.fb.group({
        newReceived: ['', [Validators.required, forbiddenInputValidator(/[*~\[\]\\/]/i)]],
        newReply: new FormControl('', [Validators.required, forbiddenInputValidator(/[*~\[\]\\/]/i)])
      })
    }

  ngOnInit() {
    this.subs.add(this.dataProvider.getBotReplies().subscribe((res: any) => {
      // map object to array of objects and sort ascending by keys
      this.botReplies = Object.entries(res).map((arr, val) => {
        return { key: arr[0], value: arr[1] }
      }).sort((a, b) => (a.key > b.key ? 1 : -1))

      // create form control groups for each field
      const toGroups = this.botReplies.map((obj: any) => {
        let disable =false;
        if(obj.key==='(אחרת)' || obj.key==='תפריט' || obj.key==="(בקשת משוב)" || obj.key==="(תודה על משוב)") {
          disable = true
        }
        return new FormGroup({
          recieved: new FormControl({value: obj.key, disabled:disable}, Validators.required),
          reply: new FormControl({value: obj.value, disabled:disable}, Validators.required)
        });
      });
      this.controls = new FormArray(toGroups);
    }))

  }

  getControl(index: number, field: string): FormControl {
    this.currControl = this.controls.at(index).get(field);
    return this.currControl
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }

  addResponse(formDirective: FormGroupDirective) {
    let updateDocRef = this.afs.collection(this.botCollec).doc(this.botResponsesDoc)
    updateDocRef.update({
      [this.newResponse.get('newReceived')?.value]: this.newResponse.get('newReply')?.value
    }).then(() => {
      // empty fields
      // this.newResponse.get('newReceived')?.setValue('')
      // this.newResponse.get('newReply')?.setValue('')
      // resets values + validators of the whole form
      formDirective.resetForm()
      // ensure reset values of form group
      this.newResponse.reset()
      this.snackBar.open("הנתונים עודכנו בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }).catch((error) => {
      console.log('err', error)
      this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    });
  }

  updateField(index: number, field: string, item: { [key: string]: string }) {
    const control = this.getControl(index, field);
    const updateDocRef = this.afs.collection(this.botCollec).doc(this.botResponsesDoc)

    // if changing key delete existing key then add
    if (field == 'reply') {
      updateDocRef.update({
        [item.key]: control.value
      }).then(() => {
        this.snackBar.open("הנתונים עודכנו בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      }).catch((error: any) => {
        this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      });
    }
    // if changing val update 
    else {
      let oldObj = item
      Promise.all([
        updateDocRef.update({
          [item.key]: firebase.firestore.FieldValue.delete()
        }),
        updateDocRef.update({
          [control.value]: oldObj.value
        })
      ]).then(() => {
        this.snackBar.open("הנתונים עודכנו בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      }).catch(() => {
        this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      })

    }
  }

  deleteResponse(item: { [key: string]: string }) {
    const updateDocRef = this.afs.collection(this.botCollec).doc(this.botResponsesDoc)

    let element: any = {}
    element.dialogTitle = 'בטוח למחוק את השורה?'
    element.action = 'Delete';
    element.dialogType = ''
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result && result.event != 'Cancel' && updateDocRef) {
        updateDocRef.update({
          [item.key]: firebase.firestore.FieldValue.delete()
        }).then(() => {
          this.snackBar.open("הנתונים עודכנו בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        }).catch((error: any) => {
          this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        });
      }
    })
  }

}
