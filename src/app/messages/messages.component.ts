import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { GetDataService } from '../services/get-data/get-data.service';
import { message,review } from '../types/customTypes';
import { promise } from 'protractor';
import firebase from 'firebase/app';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {

  db = firebase.firestore()
  readMsgs!: message[]
  unreadMsgs!: message[]
  readReviews!: review[]
  unreadReviews!: review[]
  private subs = new Subscription()

  constructor(public dialog: MatDialog, private dataProvider: GetDataService, readonly snackBar: MatSnackBar, private afs: AngularFirestore) { }

  ngOnInit(): void {
    // get from firebase
    this.subs.add(
      this.dataProvider.getMessagesAndReviews()
        .subscribe((data) => {
          const [readMsgs, unreadMsgs,readReviews,unreadReviews] = data;
          this.readMsgs = readMsgs;
          this.unreadMsgs = unreadMsgs;
          this.readReviews = readReviews;
          this.unreadReviews = unreadReviews;
        }))
  }

  ngOnDestroy(){
    this.subs.unsubscribe()
  }

  applyFilter(event: Event, arr: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    let filter = filterValue.trim().toLowerCase();
  }

  deleteDialog(element: any, doc: message | review, collec:'Messages' |'Reviews') {
    // let collec = 'Messages'
    element.dialogTitle = 'בטוח למחוק את ההודעה?'
    element.action = 'Delete';
    element.dialogType = ''
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && doc.id && result?.event != 'Cancel') {
        this.afs.collection(collec).doc(doc.id).delete()
          .then(() => {
            this.snackBar.open("ההודעה נמחקה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          }).catch((error) => {
            this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          });
      }
    })
  }

  move(doc: message | review, read: boolean ,collec: 'Messages' | 'Reviews') {
    // let collec = 'Messages'
    this.afs.collection(collec).doc(doc.id).update({
      read: read
    }).then((res) => {
      this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }).catch((error) => {
      this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    });
  }

}