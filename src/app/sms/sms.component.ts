import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/firestore';
import { areAllEquivalent } from '@angular/compiler/src/output/output_ast';
import firebase from 'firebase/app';
import 'firebase/functions';
import { GetDataService } from '../services/get-data/get-data.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditableComponent } from '../editable/editable.component';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-sms',
  templateUrl: './sms.component.html',
  styleUrls: ['./sms.component.scss']
})
export class SmsComponent implements OnInit {

  // numberForm!: FormGroup
  // detailsForm!: FormGroup
  // phone!: string
  // name: string = ""
  botCollec = "Bot"
  botResponsesDoc = "Responses"
  subs = new Subscription()
  botReplies!: any
  newReply!: string
  newReceived!: string
  controls!: FormArray;
  currControl!: any

  constructor(private afs: AngularFirestore,
    private fb: FormBuilder,
    private dataProvider: GetDataService,
    private dialog: MatDialog,
    readonly snackBar: MatSnackBar,) { }

  ngOnInit() {
    this.subs.add(this.dataProvider.getBotReplies().subscribe((res: any) => {
      // map object to array of objects and sort ascending by keys
      this.botReplies = Object.entries(res).map((arr, val) => {
        return { key: arr[0], value: arr[1] }
      }).sort((a, b) => (a.key > b.key ? 1 : -1))

      // create form control groups for each field
      const toGroups = this.botReplies.map((obj: any) => {
        return new FormGroup({
          recieved: new FormControl(obj.key, Validators.required),
          reply: new FormControl(obj.value, Validators.required)
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

  addResponse() {
    let updateDocRef = this.afs.collection(this.botCollec).doc(this.botResponsesDoc)
    updateDocRef.update({
      [this.newReceived]: this.newReply
    }).then(() => {
      // empty fields
      this.newReceived = ''
      this.newReply = ''
      this.snackBar.open("הנתונים עודכנו בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }).catch((error) => {
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

    // if (control.valid) {
    //   this.botReplies = this.botReplies.map((e:any, i:any) => {
    //     if (index === i) {
    //       return {
    //         ...e,
    //         [field]: control.value
    //       }
    //     }
    //     return e;
    //   })
    // }
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
