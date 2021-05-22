import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { GetDataService } from '../services/get-data/get-data.service';
import { ProgressSpinnerOverlayService } from '../services/progressSpinerOverlay/progress-spinner-overlay.service';

import firebase from 'firebase/app';
import { element } from 'protractor';
import { Console } from 'node:console';

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
  phone: string
}

@Component({
  selector: 'app-projects-tracking',
  templateUrl: './projects-tracking.component.html',
  styleUrls: ['./projects-tracking.component.scss']
})

export class ProjectsTrackingComponent implements OnInit, OnDestroy {

  @ViewChild(MatDrawer) sidenav!: MatDrawer;
  // @ViewChild(MatPaginator) paginator!: MatPaginator;
  // @ViewChild(MatSort) sort!: MatSort;
  @ViewChildren(MatSort) sorts!: QueryList<MatSort>;
  @ViewChildren(MatPaginator) paginators!: QueryList<MatPaginator>;

  areaCoords: areaCoord[] = []
  clubCoords: clubCoord[] = []
  allNeighborhoods: neighborhood[] = []
  testEmitter$ = new BehaviorSubject<neighborhood[]>(this.allNeighborhoods);
  currNeighborhoods!: neighborhood[]
  managers: manager[] = []
  displayedColumns: string[] = ['date', 'clubCoordinatorId', 'projectType', 'comments', 'action']
  projectsToDisplay!: MatTableDataSource<project>
  defaultSelectedTab: number = -1
  currAreaCoord?: areaCoord
  currNeighborhood?: neighborhood //without tabs
  spin: boolean = false;

  private paginator!: MatPaginator;
  private sort!: MatSort;

  private subs = new Subscription();

  constructor(private crf: ChangeDetectorRef, private observer: BreakpointObserver, public dialog: MatDialog,
    private dataProvider: GetDataService, private afs: AngularFirestore, private progressSpinner: ProgressSpinnerOverlayService) { }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.subs.add(
        this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
          if (res.matches) {
            this.sidenav.mode = 'over';
            this.sidenav.close();
          } else {
            this.sidenav.mode = 'side';
            this.sidenav.open();
          }
        })
      );
    });
    this.subs.add(
      combineLatest([
        this.paginators.changes,
        this.sorts.changes,
      ]).pipe(
        filter(([p, s]) => p.length === 1 && s.length === 1)
      ).subscribe(([p, s]) => {
        // console.log('updating')
        this.paginator = p.first;
        this.sort = s.first;
        this.updateDatasourceProperties();
      })
    );
    this.updateDatasourceProperties();
  }

  private updateDatasourceProperties() {
    if (this.projectsToDisplay) {
      this.paginator && (this.projectsToDisplay.paginator = this.paginator);
      this.sort && (this.projectsToDisplay.sort = this.sort);
    }
  }

  ngOnInit(): void {
    this.subs.add(combineLatest(this.dataProvider.getData()).subscribe(([areaCoords, allNeighborhoods, managers, clubCoords]) => {
      this.areaCoords = areaCoords;
      this.allNeighborhoods = allNeighborhoods;
      this.managers = managers;
      this.clubCoords = clubCoords;
      this.allNeighborhoods.forEach(neighb => {
        neighb.managerInfo = this.managers.find(i => i.id.trim() == neighb.managerId.trim())
        neighb.projects.forEach(proj => {
          proj.clubInfo = this.clubCoords.find(i => i.id.trim() == proj.clubCoordinatorId.trim())
        })
      })
      if (!this.currNeighborhoods) {
        this.currNeighborhoods = this.allNeighborhoods
        this.currNeighborhoods.sort()
      }
      if(this.projectsToDisplay && this.currNeighborhood){
        this.currNeighborhood = this.allNeighborhoods.find(element=> element.id == this.currNeighborhood?.id)
        this.projectsToDisplay.data = this.currNeighborhood?.projects ?? []
      } else {
        this.currNeighborhood = this.currNeighborhoods[0]
        this.projectsToDisplay = new MatTableDataSource(this.currNeighborhoods?.[0]?.projects);
      }
      // if (this.defaultSelectedTab == -1) {
      //   this.defaultSelectedTab = this.currNeighborhoods.length - 1;
      // }
      this.updateDatasourceProperties();
    }));
  }

  sortObjectByKeys(obj: any) {
    let ordered = Object.keys(obj).sort().reverse().reduce(
      (tmp: any, key) => {
        tmp[key] = obj[key];
        return tmp;
      }
      , {}
    );
    return ordered
  }

  // filter data when getting from firestore according to user time, 
  // for admins get all, for area coords get their 8, so on... 

  getData(areaCoord: areaCoord | 'all') {
    if (areaCoord === "all") {
      this.currAreaCoord = undefined
      this.currNeighborhoods = this.allNeighborhoods
    } else {
      this.currAreaCoord = areaCoord
      let neighbs = areaCoord.neighborhoods
      // filter neighborhoods to show according to area coordinator
      this.currNeighborhoods = this.allNeighborhoods.filter(i => neighbs.includes(i.id))
    }
    this.currNeighborhoods.sort()
    this.defaultSelectedTab = this.currNeighborhoods.length - 1
    this.setProjects(this.currNeighborhoods[0].id)
  }

  setProjects(id: string) {
    // console.log('event', $event)
    // this.defaultSelectedTab = $event.index;
    // let tmp = this.currNeighborhoods.find(i => i.id === id)
    // this.projectsToDisplay = new MatTableDataSource(tmp?.projects ?? []);
    this.currNeighborhood = this.currNeighborhoods.find(i => i.id === id)
    this.projectsToDisplay = new MatTableDataSource(this.currNeighborhood?.projects ?? []);
    this.updateDatasourceProperties();
  }

  openDialog(action: 'Update' | 'Delete' | 'Add', element: any, collec: string = 'ירושלים', doc: string | undefined,
    type: 'neighb' | 'project') {
    // if (action === 'Delete' && type == 'neighb') {
    //   element.dialogTitle = 'בטוח למחוק את השכונה וכל נתוניה?'
    // }
    // // when neighborhod is not specified, the button is add new neighborhood 
    // else if (action === 'Add' && type == 'neighb') {
    //   element.dialogTitle = 'הוספת שכונה חדשה לרכז/ת'
    // }
    // else 
    if (action === 'Add' && type == 'project') {
      element.dialogTitle = 'נא להכניס את הנתונים החדשים'
      element.type = 'project'
    }
    else if (action === 'Delete' && type == 'project') {
      element.dialogTitle = 'בטוח למחוק את השורה?'
    }
    else if (action === 'Update' && type == 'project') {
      element.dialogTitle = 'מה הערכים החדשים?'
      element.type = 'project'
    }
    element.clubs = this.clubCoords
    // console.log(element, collec, this.currAreaCoord)
    element.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '35%',
      // height: '70%',
      direction: 'rtl',
      data: element,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event != 'Cancel') {
        this.progressSpinner.show()
        let updateDocRef = doc ? this.afs.collection(collec).doc(doc) : undefined
        // if (result.event == 'Add' && type == 'neighb') {
        //   // this.afs.collection('Services').doc(result.data.id).add({...})
        // } else if (result.event == 'Delete' && type == 'neighb') {
        //   // this.afs.collection('Services').doc(result.data.id).delete()
        // } else if (result.event == 'Update' && type == 'neighb') {
        //   // this.afs.doc(`Services/${result.data.id}`).update({ title: result.data.name })
        // }
        // else
        if (result.event == 'Add' && type == 'project') {
          if (updateDocRef)
            this.addProject(updateDocRef, result.newProj).then(() => this.progressSpinner.hide())
        } else if (result.event == 'Delete' && type == 'project') {
          if (updateDocRef)
            this.deleteProject(updateDocRef, {
              date: result.data.date, projectType: result.data.projectType,
              comments: result.data.comments,
              clubCoordinatorId: result.data.clubCoordinatorId
            }).then(() => this.progressSpinner.hide())
        } else if (result.event == 'Update' && type == 'project') {
          if (updateDocRef)
            this.editProject(updateDocRef, {
              date: result.data.date, projectType: result.data.projectType,
              comments: result.data.comments,
              clubCoordinatorId: result.data.clubCoordinatorId
            }, result.newProj).then(() => this.progressSpinner.hide())
        }
      }
      // this.progressSpinner.reset()
    });
  }

  async addProject(updateDocRef: AngularFirestoreDocument<any>, obj: project) {
    await updateDocRef.update({
      projects: firebase.firestore.FieldValue.arrayUnion(obj)
    });
  }

  async editProject(updateDocRef: AngularFirestoreDocument<any>, prevObj: project, newObj: project) {
    // this.deleteProject(updateDocRef, prevObj)
    // this.addProject(updateDocRef, newObj)
    await updateDocRef.update({
      projects: firebase.firestore.FieldValue.arrayRemove(prevObj)
    })
    await updateDocRef.update({
      projects: firebase.firestore.FieldValue.arrayUnion(newObj)
    });
  }

  async deleteProject(updateDocRef: AngularFirestoreDocument<any>, obj: project) {
    await updateDocRef.update({
      projects: firebase.firestore.FieldValue.arrayRemove(obj)
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.projectsToDisplay.filter = filterValue.trim().toLowerCase();
  }

}
