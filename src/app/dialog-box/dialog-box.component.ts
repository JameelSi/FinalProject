import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';
import { AuthService } from '../services/auth/auth.service';
import firebase from 'firebase/app';
import { MatSnackBar } from '@angular/material/snack-bar';
import { project, areaCoord, neighborhood, manager, clubCoord, event, emailTemplate } from '../types/customTypes';
import { Moment } from 'moment';
import { environment } from 'src/environments/environment';
import { GetDataService } from '../services/get-data/get-data.service';
import { MatRadioChange } from '@angular/material/radio';
import { AngularFirestore } from '@angular/fire/firestore';

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
  dialogType: 'project' | 'needs' | 'resetPass' | 'neighb' | 'areaCoord' | 'manager' | 'clubCoord' | 'editEvent' | 'displayEvent' | 'sendMail' | 'editTemplates';
  actionHebrew: { [key: string]: string } = { "Add": 'הוסף', "Update": 'עדכן', "Delete": 'מחק', "reset": 'שלח' };
  newEmail?: string;
  newPassword?: string;
  invalidCreation: boolean = false;
  secondaryApp!: any
  uploadedFile!: any
  choosenTemplate: string = "";
  templates: { [key: string]: string } = {}
  constructor(public dialogRef: MatDialogRef<DialogBoxComponent>,
    public authService: AuthService,
    readonly snackBar: MatSnackBar,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any, private dataProvider: GetDataService, private afs: AngularFirestore) {
    this.local_data = { ...data };
    if (this.local_data.clubs && this.local_data.clubs[0].id != 0) this.local_data.clubs?.unshift({ name: 'כללי', id: '0' })
    this.dialogType = this.local_data.dialogType
    this.action = this.local_data.action;
    if (this.action === 'Update' && this.dialogType == "project") {
      this.newProj = {
        date: moment(this.local_data.date.toDate()),
        projectType: this.local_data.projectType,
        comments: this.local_data.comments,
        clubCoordinatorId: this.local_data.clubCoordinatorId,
        continuous: this.local_data.continuous,
        status: this.local_data.status
      }
    } else if (this.dialogType === "project") {
      this.newProj = { projectType: '', comments: '', date: moment(), continuous: '', status: '', clubCoordinatorId: [] }
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
  ngOnInit(): void {
    this.dataProvider.getEmailTemplates().subscribe((res) => {
      res.forEach((item) => {
        this.templates[item.id] = item.content
      })
    })
  }

  doAction() {
    if ((this.dialogType === 'areaCoord' || this.dialogType === 'manager') && this.action != "Delete") {
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
      this.updateImgURL().then(() => {
        this.dialogRef.close({
          event: this.action,
          data: this.local_data,
          newEvent: this.newEvent ? { ...this.newEvent, date: (this.newEvent?.date as Moment).toDate() } : undefined
        });
      })
    }
    else if (!this.invalidCreation) {
      if (this.dialogType === 'project') this.updateClubs()
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
        newEvent: this.newEvent ? { ...this.newEvent, date: (this.newEvent?.date as Moment).toDate() } : undefined,
      });
    }
  }

  closeDialog() {
    this.dialogRef.close({ event: 'Cancel' });
  }

  updateNeighbs() {
    this.local_data.allNeighborhoods.forEach((neighb: neighborhood) => {
      if (neighb.currentValue) {
        (this.newUser as areaCoord).neighborhoods.push(neighb.id)
      }
      neighb.currentValue = false
    });
  }

  updateClubs() {
    this.local_data.clubs.forEach((club: clubCoord) => {
      if (club.currentValue) {
        if (club.id)
          this.newProj?.clubCoordinatorId.push(club.id)
      }
    });
  }

  async createUser() {
    if ((this.newUser as areaCoord).email && this.newPassword) {
      //create and init new app reference (to prevent user from logging in) 
      if (firebase.apps.length === 1)
        this.secondaryApp = firebase.initializeApp(environment.firebase, "Secondary");
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
  fillFeilds(event: MatRadioChange) {
    //Using NewLine as \n when inserting and reading from firebase because firebase doesnt support \n
    let temp = this.templates[event.value].replace(/NewLine/g, "\n")
    this.choosenTemplate = event.value
    this.local_data.mailSubject = event.value
    this.local_data.mailContent = temp
  }
  addTemplate() {
    let temp = this.local_data.mailContent.replace(/\n/g, "NewLine")
    if (this.local_data.mailSubject in this.templates) {
      this.snackBar.open("כבר נמצא נא לשנות את השם או למחוק הישן", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
      return
    }
    firebase.firestore().collection('EmailsTemplates').doc(this.local_data.mailSubject).set({
      content: temp
    }).then(err => {
      this.snackBar.open("התווסף בהצלחה", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
    }).catch(err => {
      this.snackBar.open("problem with firebase", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
    })
  }
  updateTemplate() {
    let temp = this.local_data.mailContent.replace(/\n/g, "NewLine")
    this.afs.collection('EmailsTemplates').doc(this.choosenTemplate).delete()
    firebase.firestore().collection('EmailsTemplates').doc(this.local_data.mailSubject).set({
      content: temp
    }).then(err => {
      this.snackBar.open("עודכן בהצלחה", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
      this.dialogRef.close();
    }).catch(err => {
      this.snackBar.open("problem with firebase", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
    })
  }
  deleteTemplate() {
    this.afs.collection('EmailsTemplates').doc(this.local_data.mailSubject).delete().then(err => {
      this.snackBar.open("נמחק בהצלחה", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
    }).catch(err => {
      this.snackBar.open("problem with firebase", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
    })
    this.dialogRef.close();
  }
}
