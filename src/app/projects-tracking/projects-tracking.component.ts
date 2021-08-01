import { BreakpointObserver } from '@angular/cdk/layout';
import { ChangeDetectorRef, Component, ComponentFactoryResolver, NgZone, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatAccordion } from '@angular/material/expansion';
import { BehaviorSubject, combineLatest, concat, forkJoin, Subscription } from 'rxjs';
import { concatMap, filter, map, tap } from 'rxjs/operators';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { GetDataService } from '../services/get-data/get-data.service';
import { ProgressSpinnerOverlayService } from '../services/progressSpinerOverlay/progress-spinner-overlay.service';
import { AuthService } from '../services/auth/auth.service';
import { areaCoord, neighborhood, project, manager, clubCoord } from '../types/customTypes';
import firebase from 'firebase/app';

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
  @ViewChild(MatAccordion) accordion!: MatAccordion;


  areaCoords: areaCoord[] = []
  clubCoords: clubCoord[] = []
  allNeighborhoods: neighborhood[] = []
  testEmitter$ = new BehaviorSubject<neighborhood[]>(this.allNeighborhoods);
  currNeighborhoods!: neighborhood[]
  managers: manager[] = []
  displayedColumns: string[] = ['date', 'clubCoordinatorId', 'projectType', 'comments', 'action']
  projectsToDisplay!: MatTableDataSource<project>
  currAreaCoord?: areaCoord
  currNeighborhood?: neighborhood
  spin: boolean = false;
  adminType!: string;

  private paginator!: MatPaginator;
  private sort!: MatSort;

  private subs = new Subscription();

  constructor(private crf: ChangeDetectorRef, private observer: BreakpointObserver, public dialog: MatDialog,
    private dataProvider: GetDataService, private afs: AngularFirestore,
    public authService: AuthService,
    private progressSpinner: ProgressSpinnerOverlayService) {
    this.authService.authData$.subscribe(auth => {
      this.adminType = auth.type
    })
  }

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
    this.subs.add(combineLatest([
      this.dataProvider.getProjectTrackingData(),
      this.authService.authData$
    ]).subscribe(([data, auth]) => {
      const [areaCoords, allNeighborhoods, managers, clubCoords] = data;
      // filter data when getting from firestore according to user time, 
      // for admins get all, for area coords get their 8, so on... TODO
      this.areaCoords = areaCoords
      this.allNeighborhoods = allNeighborhoods;
      this.managers = managers;
      this.clubCoords = clubCoords;

      // if (!auth.superAdmin) {
      //   let neighs: any
      //   this.areaCoords = areaCoords.filter(item => (item.id.trim() == auth.uid))
      //   if (auth.type === "AreaCoordinators") {
      //     neighs = this.areaCoords.reduce((acc, ac) => acc.concat(ac.neighborhoods), [] as string[]);
      //   }
      // else if (auth.type === "Managers") {
      //   this.managers = managers.filter(item => (item.id.trim() == auth.uid))
      //   neighs = this.managers.reduce((acc, ac) => acc.concat(ac.neighborhoods), [] as string[]);
      // }
      //   if (neighs)
      //     this.allNeighborhoods = allNeighborhoods.filter(n => neighs.indexOf(n.id) > -1).sort();
      // }

      if (this.authService.isLoggedIn) {
        let uid = auth.uid
        let temp
        if (auth.type === "AreaCoordinators")
          temp = this.areaCoords.find(i => (i.id?.trim() == uid))
        // else if (auth.type === "Managers")
        //   temp = this.managers[0]
        if (temp) {
          temp.name = "שכונות שלי"
          let idx = this.areaCoords.indexOf(temp)
          let temp2 = this.areaCoords[0]
          this.areaCoords[0] = temp
          this.areaCoords[idx] = temp2
        }
      }
      this.allNeighborhoods.forEach(neighb => {
        neighb.managerInfo = this.managers.find(i => i.id.trim() == neighb.managerId.trim())
        neighb.projects.forEach(proj => {
          // for the variables that are arrays
          if (proj.clubCoordinatorId.constructor === Array) { //TODO test all cases
            proj.clubInfo = []
            proj.clubCoordinatorId.forEach(id => {
              if(id==='0'){
                if (proj.clubInfo) proj.clubInfo.push({name: 'כללי', address:'', club:'', phone:'', coordPhone:''})
              }else{
                let tempInfo = this.clubCoords.find(i => i.id?.trim() == id.trim())
                if (proj.clubInfo && tempInfo) proj.clubInfo.push(tempInfo)
              }
            })
          }
          else{ // for the variables in the database that are still strings
            let tempInfo = this.clubCoords.find(i => i.id?.trim() == (proj.clubCoordinatorId as unknown as string).trim())
            if (tempInfo) proj.clubInfo = [tempInfo]
          }
        })
      })
      if (!this.currNeighborhoods) {
        this.currNeighborhoods = this.allNeighborhoods
        this.currNeighborhoods.sort()
      }
      if (this.projectsToDisplay && this.currNeighborhood) {
        this.currNeighborhood = this.allNeighborhoods.find(element => element.id == this.currNeighborhood?.id)
        this.projectsToDisplay.data = this.currNeighborhood?.projects ?? []
      } else {
        this.currNeighborhood = this.currNeighborhoods[0]
        this.projectsToDisplay = new MatTableDataSource(this.currNeighborhoods?.[0]?.projects);
      }
      this.updateDatasourceProperties();
    }));
  }

  // sortObjectByKeys(obj: any) {
  //   let ordered = Object.keys(obj).sort().reverse().reduce(
  //     (tmp: any, key) => {
  //       tmp[key] = obj[key];
  //       return tmp;
  //     }
  //     , {}
  //   );
  //   return ordered
  // }


  getAreaCoordsData(areaCoord: areaCoord | 'all') {

    if (areaCoord === "all") {
      this.accordion.closeAll();
      this.currAreaCoord = undefined
      this.currNeighborhoods = this.allNeighborhoods
    } else {
      this.currAreaCoord = areaCoord
      let neighbs = areaCoord.neighborhoods
      // filter neighborhoods to show according to area coordinator
      this.currNeighborhoods = this.allNeighborhoods.filter(i => neighbs.includes(i.id))
    }
    this.currNeighborhoods.sort()
    this.setProjects(this.currNeighborhoods[0].id)
  }

  setProjects(id: string) {
    // let tmp = this.currNeighborhoods.find(i => i.id === id)
    // this.projectsToDisplay = new MatTableDataSource(tmp?.projects ?? []);
    this.currNeighborhood = this.currNeighborhoods.find(i => i.id === id)
    this.projectsToDisplay = new MatTableDataSource(this.currNeighborhood?.projects ?? []);
    this.updateDatasourceProperties();
  }

  openDialog(action: 'Update' | 'Delete' | 'Add', element: any, collec: string = 'ירושלים', doc: string | undefined,
    type: 'neighb' | 'project') {
    if (action === 'Add' && type == 'project') {
      element.dialogTitle = 'נא להכניס את הנתונים החדשים'
      element.dialogType = 'project'
    }
    else if (action === 'Delete' && type == 'project') {
      element.dialogTitle = 'בטוח למחוק את השורה?'
      element.dialogType = 'project'
    }
    else if (action === 'Update' && type == 'project') {
      element.dialogTitle = 'מה הערכים החדשים?'
      element.dialogType = 'project'
    }
    element.clubs = this.clubCoords
    element.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event != 'Cancel') {
        this.progressSpinner.show()
        let updateDocRef = doc ? this.afs.collection(collec).doc(doc) : undefined
        if (result.event == 'Add' && type == 'project') {
          if (updateDocRef)
            this.addProject(updateDocRef, result.newProj).then(() => this.progressSpinner.hide())
        } else if (result.event == 'Delete' && type == 'project') {
          if (updateDocRef)
            this.deleteProject(updateDocRef, {
              date: result.data.date,
              projectType: result.data.projectType,
              comments: result.data.comments,
              clubCoordinatorId: result.data.clubCoordinatorId
            }).then(() => this.progressSpinner.hide())
        } else if (result.event == 'Update' && type == 'project') {
          if (updateDocRef)
            this.editProject(updateDocRef, {
              date: result.data.date,
              projectType: result.data.projectType,
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
