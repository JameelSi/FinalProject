import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatChipSelectionChange } from '@angular/material/chips';
import { FormControl } from '@angular/forms';
import * as moment from 'moment';
import { AuthService } from '../services/auth/auth.service';
// import { firestore } from 'firebase/app';

interface project {
  projectType: any,
  comments: string,
  date: any,
  clubCoordinatorId: any
}

type areaCoord = {
  id?: string,
  name: string,
  email: string,
  phone: string,
  neighborhoods: string[],
  superAdmin?: boolean,
}

type neighborhood = {
  id: string,
  currentValue: boolean,
  managerId: string,
  projects: project[],
  managerInfo?: manager
}

type manager = {
  id?: string,
  name: string,
  email: string,
  phone: string,
  neighborhoods: string[]
}

type clubCoord = {
  id?: string,
  address: string,
  club: string,
  name: string,
  phone: string
}

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
  // newManager?: manager;
  // newClubCoord?: clubCoord;
  dialogType: 'project' | 'needs' | 'resetPass' | 'neighb' | 'areaCoord' | 'manager' | 'clubCoord';
  actionHebrew: { [key: string]: string } = { "Add": 'הוסף', "Update": 'עדכן', "Delete": 'מחק', "reset": 'שלח' };
  newEmail?: string;
  newPassword?: string;
  invalidCreation: boolean = false;

  constructor(public dialogRef: MatDialogRef<DialogBoxComponent>,
    private afs: AngularFirestore,
    public authService: AuthService,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    this.local_data = { ...data };
    this.dialogType = this.local_data.dialogType
    this.action = this.local_data.action;
    if (this.action === 'Update' && this.dialogType == "project") {
      this.newProj = {
        date: moment(this.local_data.date.toDate()),
        projectType: this.local_data.projectType,
        comments: this.local_data.comments,
        clubCoordinatorId: this.local_data.clubCoordinatorId
      }
    } else if (this.dialogType == "project") {
      this.newProj = { projectType: '', comments: '', date: moment(), clubCoordinatorId: '' }
    }
    if (this.dialogType == 'neighb') {
      this.newNeighb = {
        id: "",
        currentValue: false,
        managerId: "",
        projects: []
      }
    }
    else if (this.dialogType == 'areaCoord') {
      this.newUser = {
        name: "",
        email: "",
        phone: "",
        neighborhoods: [],
        superAdmin: this.local_data.superAdmin,
      }
    }
    else if (this.dialogType == 'manager') {
      this.newUser = {
        name: "",
        email: "",
        phone: "",
        neighborhoods: []
      }
    }
    else if (this.dialogType == 'clubCoord') {
      this.newUser = {
        address: "",
        club: "",
        name: "",
        phone: ""
      }
    }
    this.dialogTitle = this.local_data.dialogTitle;
  }

  doAction() {
    if ( (this.dialogType === 'areaCoord' || this.dialogType === 'manager' ) && this.action!="Delete")
      this.updateNeighbs()
    // if (this.dialogType === 'areaCoord')
    //   this.createUser()
    if (!this.invalidCreation) {
      this.dialogRef.close({
        event: this.action,
        data: this.local_data,
        newNeighb: this.newNeighb,
        newProj: {
          ...this.newProj,
          comments: this.newProj?.comments.length == 0 ? "אין" : this.newProj?.comments,
          date: this.newProj?.date.toDate()
        },
        newUser: this.newUser
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

  // async createUser() {
  //   if ((this.newUser as manager | areaCoord).email && this.newPassword) {
  //     //try creating a new user 
  //     await this.authService.signUp((this.newUser as manager | areaCoord).email, this.newPassword, 'AreaCoordinators').then(result => {
  //       // if the email already exists return and show an error 
  //       if (!result)
  //         this.invalidCreation = true;
  //       // user created
  //       else {
  //         this.invalidCreation = false;
  //       }
  //     })
  //   }
  // }

}
