import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSnackBar } from '@angular/material/snack-bar';
import firebase from 'firebase/app';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Subscription } from 'rxjs';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { GetDataService } from '../services/get-data/get-data.service';
import { manager, neighborhood, task } from '../types/customTypes';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss']
})

export class TasksComponent implements OnInit {
  @ViewChild(MatDrawer)
  sidenav!: MatDrawer;
  managers!: manager[]
  subs = new Subscription()
  newDate!: Date | Moment | undefined
  managersToDisplay!: manager[]
  neighborhoods!: neighborhood[]

  // tasks: task[] = [
  //   { description: 'להתחיל ללמוד על הפקן מערכת', completed: false },
  //   { description: 'להראות את האתר לפקן אלינה', completed: false },
  //   { description: 'להגיד שזה האתר הכי טוב שראית בחייך', completed: false },
  // ];

  constructor(private observer: BreakpointObserver,
    private dataProvider: GetDataService,
    private dialog: MatDialog,
    private afs: AngularFirestore,
    readonly snackBar: MatSnackBar,) {
    // this.updateManagers()
  }

  ngOnInit(): void {
    // get from firebase
    this.subs.add(
      this.dataProvider.getManagers()
        .subscribe((data) => {
          this.managers = data
          this.managersToDisplay = this.managersToDisplay ?
          this.managers.filter((obj)=> {
            // filter out items not in managersToDisplay
            return this.managersToDisplay?.some((obj2) => {
              return obj.id === obj2.id;
            });
          }) 
          : this.managers
          // if neighborhoods are not specified in manager doc then get neighborhoods for managers from neighborhood doc
          this.managers.forEach(mngr => {
            if (mngr.neighborhoods.length == 0) {
              this.getManagersNeighb(mngr)
            }
          })
        })
    )
    this.subs.add(this.dataProvider.getJerNeighborhoods().subscribe(data => {
      this.neighborhoods = data
    }))
  }

  ngOnDestroy(){
    this.subs.unsubscribe()
  }

  async completeTask(task: task, docId: string, mngr: manager) {
    //  update progress
    const index = mngr.tasks.indexOf(task);
    mngr.tasks[index].completed = !task.completed
    mngr.tasksProgress = this.updateProgress(undefined, mngr, 0)

    let collec = 'Managers'
    let updateDocRef: AngularFirestoreDocument
    updateDocRef = this.afs.collection(collec).doc(docId)
    updateDocRef.update({
      tasks: mngr.tasks,
      tasksProgress: mngr.tasksProgress
    }).then(() => {
      // this.snackBar.open("המשימה נמחקה בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }).catch((error) => {
      this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    });
  }

  removeTask(task: task, docId: string, mngr: manager): void {
    let element: any = {}
    let collec = 'Managers'
    let updateDocRef = this.afs.collection(collec).doc(docId)
    
    element.dialogTitle = 'בטוח למחוק את המשימה?'
    element.action = 'Delete';
    element.dialogType = ''
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event != 'Cancel' && updateDocRef) {

        mngr.tasksProgress = this.updateProgress(task, mngr, -1)

        updateDocRef.update({
          tasks: firebase.firestore.FieldValue.arrayRemove({ ...task }),
          tasksProgress: mngr.tasksProgress
        }).then(() => {
          this.snackBar.open("המשימה נמחקה בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        }).catch((error) => {
          this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        });
      }
    })
  }

  addTask(taskDescription: string, docId: string, mngr: manager) {
    //  update progress
    mngr.tasksProgress = this.updateProgress(undefined, mngr, 1)

    let task: task = {
      description: taskDescription,
      completed: false,
      date: moment(this.newDate)?.toDate() ?? moment().toDate(),
    }
    let collec = 'Managers'
    let updateDocRef = this.afs.collection(collec).doc(docId)
    updateDocRef.update({
      tasks: firebase.firestore.FieldValue.arrayUnion({ ...task }),
      tasksProgress: mngr.tasksProgress
    }).then(() => {
      this.newDate = undefined
      this.snackBar.open("המשימה נוספה בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }).catch((error) => {
      this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    });
  }

  updateProgress(task: task | undefined, mngr: manager, action: 1 | -1 | 0): number{
    // action = +1 when adding new task, -1 when deleting a task, 0 when completing/ uncompleting task
    let completedArr = mngr?.tasks.filter(task => task.completed === true)
    let completedNum
    if(action === -1 && task?.completed){
      completedNum = completedArr?.length + action ?? 0
    } else{
      completedNum = completedArr?.length ?? 0
    }
    return (completedNum / (mngr?.tasks.length + action ?? 1)) * 100 | 0
  }

  setTasks(mngr: manager | 'all' | 'over' | 'under' | undefined, num?: number, neighb?: neighborhood) {
    if (mngr === 'over') {
      if (num) {
        this.managersToDisplay = this.managers.filter(mngr => (mngr.tasksProgress ?? 101) >= num)
      }
    } else if (mngr === 'under') {
      if (num) {
        this.managersToDisplay = this.managers.filter(mngr => (mngr.tasksProgress ?? -1) < num)
      }
    } else if (mngr === 'all') {
      this.managersToDisplay = this.managers
    } else if (neighb) {
      let neighbs = this.neighborhoods.find(n => n.id === neighb.id)
      this.managersToDisplay = this.managers.filter(manager => manager.id === neighbs?.managerId)
    } else if (mngr) {
      this.managersToDisplay = [mngr]
    }

  }

  getManagersNeighb(mngr: manager) {
    if (mngr.neighborhoods.length == 0) {
      firebase.firestore().collection("ירושלים").where("managerId", "==", mngr.id)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            mngr.neighborhoods.push(doc.data().id)
            console.log(doc.id, " => ", doc.data());
          });
        })
        .catch((error) => {
          console.log("Error getting documents: ", error);
        });
    }
  }
  
}

// // add tasks array of maps to all managers
// updateManagers() {
//   firebase.firestore().collection("Managers").get().then((querySnapshot) => {
//     querySnapshot.forEach((doc) => {
//       console.log(doc.id, " => ", doc.data());
//       return doc.ref.update({
//         tasksProgress: 0,
//         tasks: [
//           {
//             description: 'משימה 1',
//             date: moment().toDate(),
//             completed: false
//           },
//           // {
//           //   description: 'משימה 2',
//           //   date: moment().toDate(),
//           //   completed: false
//           // },
//           // { 
//           //   description: 'משימה 3', 
//           //   date: new Date(2021,8,21),
//           //   completed: false 
//           // },
//         ]
//       })
//     });
//   });
// }