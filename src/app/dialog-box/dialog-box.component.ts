import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatChipSelectionChange } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from '../services/auth/auth.service';
import firebase from 'firebase/app';
import { MatSnackBar } from '@angular/material/snack-bar';
import { project, areaCoord, neighborhood, manager, clubCoord, event } from '../types/customTypes';
import { Moment } from 'moment';
import { ThrowStmt } from '@angular/compiler';


type user = clubCoord | manager | areaCoord


@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.scss']
})


export class DialogBoxComponent implements OnInit {

  dialogTitle: string;
  action: string;
  local_data: any;
  newProj?: project;
  newNeighb?: neighborhood;
  newUser!: user;
  newEvent!: event;
  // newManager?: manager;
  // newClubCoord?: clubCoord;
  dialogType: 'project' | 'needs' | 'resetPass' | 'neighb' | 'areaCoord' | 'manager' | 'clubCoord' | 'editEvent' | 'displayEvent';
  actionHebrew: { [key: string]: string } = { "Add": 'הוסף', "Update": 'עדכן', "Delete": 'מחק', "reset": 'שלח' };
  newEmail?: string;
  newPassword?: string;
  invalidCreation: boolean = false;
  secondaryApp!: any
  uploadedFile!: any

  constructor(public dialogRef: MatDialogRef<DialogBoxComponent>,
    private afs: AngularFirestore,
    public authService: AuthService,
    readonly snackBar: MatSnackBar,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.local_data = { ...data };
    if(this.local_data.clubs && this.local_data.clubs[0].id!=0) this.local_data.clubs?.unshift({name:'כללי', id:'0'}) // TODO test all cases
    this.dialogType = this.local_data.dialogType
    this.action = this.local_data.action;
    if (this.action === 'Update' && this.dialogType == "project") {
      this.newProj = {
        date: moment(this.local_data.date.toDate()),
        projectType: this.local_data.projectType,
        comments: this.local_data.comments,
        clubCoordinatorId: this.local_data.clubCoordinatorId
      }
    } else if (this.dialogType === "project") {
      this.newProj = { projectType: '', comments: '', date: moment(), clubCoordinatorId: [] }
    }
    if (this.dialogType === 'neighb') {
      this.newNeighb = {
        id: "",
        currentValue: false,
        managerId: "",
        projects: []
      }
    }
    else if (this.dialogType === 'areaCoord') {
      this.newUser = {
        name: "",
        email: "",
        phone: "",
        neighborhoods: [],
      }
    }
    else if (this.dialogType === 'manager') {
      this.newUser = {
        name: "",
        email: "",
        phone: "",
        neighborhoods: [],
        tasks: [],
        tasksProgress: 0
      }
    }
    else if (this.dialogType === 'clubCoord') {
      this.newUser = {
        address: "",
        club: "",
        name: "",
        phone: "",
        coordPhone: undefined,
      }
    }
    else if (this.dialogType === "editEvent") {
      this.newEvent = {
        date: moment(),
        title: '',
        description: '',
        img: ''
      }
    }
    this.dialogTitle = this.local_data.dialogTitle;
  }

  doAction() {
    if ((this.dialogType === 'areaCoord' || this.dialogType === 'manager') && this.action != "Delete"){
      this.updateNeighbs()
    }
    if (this.dialogType === 'areaCoord') {
      this.createUser().then(() => {
        if (!this.invalidCreation) {
          this.dialogRef.close({
            event: this.action,
            data: this.local_data,
            newUser: this.newUser
          });
        }
      })
    }
    else if (this.dialogType === 'editEvent' && this.action != "Delete") {
      this.updateImgURL().then(()=>{
        this.dialogRef.close({
          event: this.action,
          data: this.local_data,
          newEvent: this.newEvent ? { ...this.newEvent, date: (this.newEvent?.date as Moment).toDate() } : undefined
        });
      })
    }
    else if (!this.invalidCreation) {
      if(this.dialogType === 'project') this.updateClubs()
      this.dialogRef.close({
        event: this.action,
        data: this.local_data,
        newNeighb: this.newNeighb,
        newProj: this.newProj ? {
          ...this.newProj,
          comments: this.newProj?.comments.length == 0 ? "אין" : this.newProj?.comments,
          date: (this.newProj?.date as Moment).toDate()
        }
          : undefined,
        newUser: this.newUser,
        newEvent: this.newEvent ? { ...this.newEvent, date: (this.newEvent?.date as Moment).toDate() } : undefined
      });
    }
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  ngOnInit(): void {
  }

  updateNeighbs() {
    this.local_data.allNeighborhoods.forEach((neighb: neighborhood) => {
      if (neighb.currentValue) {
        (this.newUser as areaCoord).neighborhoods.push(neighb.id)
      }
    });
  }

  updateClubs() { // TODO test all cases
    this.local_data.clubs.forEach((club: clubCoord) => {
      if (club.currentValue) {
        if(club.id)
        this.newProj?.clubCoordinatorId.push(club.id)
      }
    });
  }

  async createUser() {
    if ((this.newUser as areaCoord).email && this.newPassword) {
      //create and init new app reference (to prevent user from logging in)
      const config = {
        apiKey: "AIzaSyDlr_TVnprFbrWL557dAC-1OdTMyNvxqTk",
        authDomain: "simhatv2test.firebaseapp.com",
        projectId: "simhatv2test",
        storageBucket: "simhatv2test.appspot.com",
        messagingSenderId: "186409866492",
        appId: "1:186409866492:web:3e40efbd9ba31d4cc63379",
        measurementId: "G-JQX7RBYSQC"
      };
      if (firebase.apps.length === 1)
        this.secondaryApp = firebase.initializeApp(config, "Secondary");
      else
        this.secondaryApp = firebase.apps[1]
      await this.secondaryApp.auth().createUserWithEmailAndPassword((this.newUser as areaCoord).email, this.newPassword).then((res: any) => {
        if (!res) {
          this.invalidCreation = true;
        }
        // user created
        else {
          this.invalidCreation = false;
          (this.newUser as areaCoord).uid = res.user?.uid
          //I don't know if the next statement is necessary 
          this.secondaryApp.auth().signOut();
        }
      })
        .catch((err: any) => {
          this.invalidCreation = true;
          this.snackBar.open(err, '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        })
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.uploadedFile = file
    }
  }

  async updateImgURL() {
    // create ref to storage
    let storage = firebase.storage();
    let storageRef = storage.ref()
    let imgRef = storageRef.child(`events/${this.uploadedFile.name}`);
    let snapshot_: any
    // upload image file to storage
    await imgRef.put(this.uploadedFile).then((snapshot) => {
      // get image's download url and keep in newEvent doc
      snapshot_ = snapshot
    })
    await snapshot_.ref.getDownloadURL().then((url: any) => {
      this.newEvent.img = url
    });
  }

}
