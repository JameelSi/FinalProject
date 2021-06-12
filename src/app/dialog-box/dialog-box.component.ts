import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatChipSelectionChange } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
// import { firestore } from 'firebase/app';

interface project {
  projectType: any,
  comments: string,
  date: any,
  clubCoordinatorId: any
}

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.scss']
})


export class DialogBoxComponent implements OnInit {

  dialogTitle: string;
  action: string;
  local_data: any;
  newProj?: project
  dialogType: 'project' | 'needs' | 'resetPass'
  actionHebrew: { [key: string]: string } = { "Add": 'הוסף', "Update": 'עדכן', "Delete": 'מחק', "reset": 'שלח'}

  constructor(public dialogRef: MatDialogRef<DialogBoxComponent>, private afs: AngularFirestore,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.local_data = { ...data };
    this.dialogType = this.local_data.dialogType
    this.action = this.local_data.action;
    if (this.action === 'Update' && this.dialogType == "project") {
      this.newProj = {
        date:  moment(this.local_data.date.toDate()),
        projectType: this.local_data.projectType,
        comments: this.local_data.comments,
        clubCoordinatorId: this.local_data.clubCoordinatorId
      }
    } else if (this.dialogType == "project") {
      this.newProj = { projectType: '', comments: '', date: moment(), clubCoordinatorId: '' }
    }
    this.dialogTitle = this.local_data.dialogTitle;
  }

  doAction() {
    this.dialogRef.close({
      event: this.action, data: this.local_data,
      newProj: { ...this.newProj, 
        comments: this.newProj?.comments.length == 0 ? "אין" : this.newProj?.comments, 
        date: this.newProj?.date.toDate() }
    });
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  ngOnInit(): void {
  }

}
