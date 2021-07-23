import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { GetDataService } from '../services/get-data/get-data.service';
import { message } from '../types/customTypes';
import firebase from 'firebase/app';
import { promise } from 'protractor';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AngularFirestore } from '@angular/fire/firestore';

// interface msg {
//   from: string,
//   date: string,
//   content: string,
//   contact?: string
// }
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  db = firebase.firestore()
  readMsgs!: message[]
  // = [{ from: "user1", date: "01-12-1995", content: "hey here", contact: '050555' }, { from: "user3", date: "01-12-2019", content: "hey there" }];
  unreadMsgs!: message[]
  // = [{ from: "user2", date: "07-09-2020", content: "hio there", contact: '0547865' }, { from: "user4", date: "01-12-2021", content: "bye there" }];
  // temparr:msg[]=[{ from: "user1", date: "01-12-1995", content: "hey there", contact: '050555' }, { from: "user2", date: "01-12-1996", content: "hello there" }];
  private subs = new Subscription()

  constructor(public dialog: MatDialog, private dataProvider: GetDataService, readonly snackBar: MatSnackBar, private afs: AngularFirestore) { }

  ngOnInit(): void {
    // get from firebase
    this.subs.add(
      this.dataProvider.getMessages()
        .subscribe((data) => {
          const [readMsgs, unreadMsgs] = data;
          this.readMsgs = readMsgs;
          this.unreadMsgs = unreadMsgs;
        }))
  }

  applyFilter(event: Event, arr: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    let filter = filterValue.trim().toLowerCase();
    // this.temparr=this.readMsgs.filter(t=>t.content ===filter || t.date ===filter || t.from ===filter);
  }

  deleteDialog(element: any, doc: message) {
    let collec = 'Messages'
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

  move(doc: message, read: boolean) {
    let collec = 'Messages'
    this.afs.collection(collec).doc(doc.id).update({
      read: read
    }).then((res) => {
      this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }).catch((error) => {
      this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    });
  }

}