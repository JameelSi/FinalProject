import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, Subscription } from 'rxjs';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { GetDataService } from '../services/get-data/get-data.service';
import firebase from 'firebase/app';
import { MatSnackBar } from '@angular/material/snack-bar';

interface areaCoord {
  id: string,
  name: string,
  email: string,
  phone: string,
  neighborhoods: string[]
}

interface neighborhood {
  id: string,
  currentValue: boolean,
  managerId: string,
  projects: project[],
  managerInfo?: manager
}

interface project {
  projectType: string,
  comments: string,
  date: Date,
  clubCoordinatorId: string,
  clubInfo?: clubCoord,
}

interface manager {
  id: string,
  name: string,
  email: string,
  phone: string,
  neighborhoods: string[]
}

interface clubCoord {
  id: string,
  address: string,
  club: string,
  name: string,
  phone: string,
  coordPhone: string | undefined
}

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  db = firebase.firestore()
  areaCoords!: areaCoord[];
  allNeighborhoods!: neighborhood[];
  managers!: manager[];
  clubCoords!: clubCoord[];
  items!: any[];
  private subs = new Subscription();

  constructor(private dialog: MatDialog, private dataProvider: GetDataService, private afs: AngularFirestore, readonly snackBar: MatSnackBar,) { }

  ngOnInit(): void {
    this.subs.add(this.dataProvider.getProjectTrackingData().subscribe(([areaCoords, allNeighborhoods, managers, clubCoords]) => {
      this.areaCoords = areaCoords;
      this.allNeighborhoods = allNeighborhoods;
      this.managers = managers;
      this.clubCoords = clubCoords;
      this.items = [
        {
          type: "areaCoord",
          nameH: "מרכזי אזור",
          content: this.areaCoords,
          collec: "AreaCoordinators"
        },
        {
          type: "neighb",
          nameH: "שכונות",
          content: this.allNeighborhoods,
          collec: "ירושלים"
        },
        {
          type: "manager",
          nameH: "מנהלי תחום",
          content: this.managers,
          collec: "Managers"
        },
        {
          type: "clubCoord",
          nameH: "רכזי מועדונים",
          content: this.clubCoords,
          collec: "ClubCoordinators"
        },
      ]
    }))
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }

  getExistingData() {

  }

  openDialog(action: 'Update' | 'Delete' | 'Add', element: any, collec: string = 'ירושלים', doc: string | undefined,
    type: 'neighb' | 'areaCoord' | 'manager' | 'clubCoord', superAdmin: boolean = false) {

    if (action === 'Add') {
      element.dialogTitle = 'נא להכניס את הנתונים החדשים'
    } else if (action === 'Update') {
      element.dialogTitle = 'מה הערכים החדשים?'
    } else if (action === 'Delete') {
      element.dialogTitle = 'בטוח למחוק?'
    }

    // if neighb -> need managers
    if (type == 'neighb' && action === "Add") {
      element.managers = this.managers
    } else if (type === 'areaCoord' && action === "Add") {
      element.allNeighborhoods = this.allNeighborhoods
    } else if (type === 'manager' && action === "Add") {
      element.allNeighborhoods = this.allNeighborhoods
    }

    element.dialogType = type
    element.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event != 'Cancel') {
        if (result.data.action === "Add" && result.data.dialogType === "neighb") {
          // Create a reference to the cities collection
          let neighbsRef = firebase.firestore().collection(collec).doc(result.newNeighb.id);
          let exists: boolean
          // check if neighborhood already exists, if so don't add it, else add to database
          neighbsRef.get().then((docSnapshot) => {
            exists = docSnapshot.exists
          }).then(() => {
            if (exists) {
              this.snackBar.open("השכונה כבר נמצאת !", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
            }
            else {
              // currentValue: result.newNeighb.currentValue,
              neighbsRef.set({
                projects: result.newNeighb.projects,
                managerId: result.newNeighb.managerId,
                currentValue: false,
              })
                .then(() => {
                  this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
                })
                .catch((error) => {
                  this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
                });
            }
          })
        }
        else if (result.data.action === "Add" && (result.data.dialogType === "clubCoord" || result.data.dialogType === "manager")) {
          this.db.collection(collec).add({
            ...result.newUser
          })
            .then((docRef) => {
              this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
            })
            .catch((error) => {
              this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
            });
        }
        else if (result.data.action === "Add" && result.data.dialogType === "areaCoord") {

          Promise.all(
            [this.db.collection(collec).doc(result.newUser.uid).set({
              ...result.newUser
            }),
            this.db.collection('Admin').doc(result.newUser.uid).set({
              type: collec,
              superAdmin: true,
            })]
          )
            .then((docRef: any) => {
              this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
            })
            .catch((error: any) => {
              this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
            })
        }
        else if (result.data.action === "Delete") {
          if (result.data.dialogType === "areaCoord") {
            Promise.all(
              [this.afs.collection('Admin').doc(doc).delete(),
              this.afs.collection(collec).doc(doc).delete()]
            )
              .then(() => {
                this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
              }).catch((error) => {
                this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
              })
          }
          else {
            this.afs.collection(collec).doc(doc).delete().then(() => {
              this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
            }).catch((error) => {
              this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
            });
          };
        }

      }
    });
  }


}
