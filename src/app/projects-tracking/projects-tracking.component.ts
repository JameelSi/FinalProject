import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, ComponentFactoryResolver, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatDrawer } from '@angular/material/sidenav';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { combineLatest, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { GetDataService } from '../services/get-data/get-data.service';

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
}

interface project {
  projectType: string,
  comments: string,
  date: Date,
  clubCoordinatorId: string,
  clubInfo?: object,
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
  currNeighborhoods!: neighborhood[]
  managers: manager[] = []
  displayedColumns: string[] = ['date', 'clubCoordinatorId', 'projectType', 'comments', 'action']
  projectsToDisplay!: MatTableDataSource<project>
  defaultSelectedTab: number = -1
  currAreaCoord?: areaCoord

  private paginator!: MatPaginator;
  private sort!: MatSort;

  private subs = new Subscription();

  constructor(private observer: BreakpointObserver, public dialog: MatDialog,
    private dataProvider: GetDataService, private afs: AngularFirestore) { }

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
        neighb.projects.forEach(proj => {
          proj.clubInfo = this.clubCoords.find(i => i.id.trim() == proj.clubCoordinatorId.trim())
        })
      })
      if (!this.currNeighborhoods) {
        this.currNeighborhoods = this.allNeighborhoods
        this.currNeighborhoods.sort()

      }
      if (!this.projectsToDisplay) {
        this.projectsToDisplay = new MatTableDataSource(this.currNeighborhoods?.[0]?.projects);
      }
      if (this.defaultSelectedTab == -1) {
        this.defaultSelectedTab = this.currNeighborhoods.length - 1;
      }
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
  }

  setProjects($event: MatTabChangeEvent) {
    // this.defaultSelectedTab = $event.index;
    let tmp = this.currNeighborhoods.find(i => i.id === $event.tab.textLabel)
    this.projectsToDisplay = new MatTableDataSource(tmp?.projects ?? []);
    this.updateDatasourceProperties();
  }

  openDialog(action: 'Update' | 'Delete' | 'Add', element: any = {}, collec: string = 'ירושלים', doc: any = undefined) {
    if (action === 'Delete' && collec)
      element.dialogTitle = 'בטוח למחוק את השכונה וכל נתוניה?'
    else if (action === 'Add' && collec && doc)
      element.dialogTitle = 'נא להכניס את הנתונים החדשים'
    // when neighborhod is not specified, the button is add new neighborhood 
    else if (action === 'Add')
      element.dialogTitle = 'הוספת שכונה חדשה לרכז/ת'
    else if (action === 'Delete' && collec && doc)
      element.dialogTitle = 'בטוח למחוק את השורה ?'
    else if (action === 'Update')
      element.dialogTitle = 'מה הערכים החדשים?'

    console.log(element, collec, doc, this.currAreaCoord)

    element.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '25%',
      direction: 'rtl',
      data: element,
    });
    // if(collec){let neighbsCollecRef: AngularFirestoreCollection = this.afs.collection(`${collec}`)}
    // if(collec && doc){let neighbDocRef: AngularFirestoreDocument<neighborhood> = this.afs.collection(`${collec}`).doc(`${doc}`)}
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('result:', result)
        if (result.event == 'Add' && collec) {
          // this.afs.collection('Services').add({ title: result.data.name, content: [] })
        } else if (result.event == 'Delete' && collec) {
          // this.afs.collection('Services').doc(result.data.id).delete()
        } else if (result.event == 'Update' && collec) {
          // this.afs.doc(`Services/${result.data.id}`).update({ title: result.data.name })
        }

        else if (result.event == 'Add' && doc) {
          result.data.content.push(result.data.name)
          this.afs.doc(`Services/${result.data.id}`).update({ content: result.data.content })
        } else if (result.event == 'Delete' && doc) {
          console.log(result.data.name)
        } else if (result.event == 'Update' && doc) {
          console.log(result.data.id)
        }
      }
    });

  }

  addRowData(row_obj: project) {


  }
  updateRowData(row_obj: project) {

  }
  deleteRowData(row_obj: project) {

  }

}












































    // this.areaCoords = {
    //   'גיתית': { name: 'גיתית', id:'', email: 'a@b.c', phone: '0905463894', neighborhoods: ['bet hanina', 'place2'] },
    //   'אתי': { name: 'אתי', id:'', email: 'm@e.h', phone: '0905463894', neighborhoods: ['hell', 'pisgat zeev', 'place100'] },
    //   'מישהו': { name: 'מישהו', id:'', email: 'g@t.p', phone: '0905463894', neighborhoods: ['neve yaakov'] }
    // }

    // this.areaCoords = {
    //   'H9hECpjRtCxE7AlXovnH': {
    //     email: "r@w.p",
    //     id: "H9hECpjRtCxE7AlXovnH",
    //     name: "גיתית",
    //     neighborhoods: ["נווה יעקב", "בית חנינה"],
    //     phone: "0607512387"
    //   },
    //   'vQI1t5Fz6E8YrYuECWHt': {
    //     email: "v@t.l",
    //     id: "vQI1t5Fz6E8YrYuECWHt",
    //     name: "אתי",
    //     neighborhoods: ["פסגת זאב"],
    //     phone: "0908764356"
    //   }
    // }

    // const project1: project = { clubCoordinatorId: '0', comments: 'jhgd', date: new Date, projectType: 'type 1' }
    // const project2: project = { clubCoordinatorId: '1', comments: 'gfhdrrag', date: new Date, projectType: 'type 2' }
    // const project3: project = { clubCoordinatorId: '2', comments: 'wetf', date: new Date, projectType: 'type 1' }
    // const project4: project = { clubCoordinatorId: '3', comments: 'u7776789', date: new Date, projectType: 'type 2' }

    // this.allNeighborhoods = {
    //   'bet hanina': { id: 'bet hanina', managerId: '0', currentValue: false, projects: [project1, project2] },
    //   'place2': { id: 'place2', managerId: '1', currentValue: false, projects: [project1] },
    //   'hell': { id: 'hell', managerId: '2', currentValue: false, projects: [project3] },
    //   'pisgat zeev': { id: 'pisgat zeev', managerId: '0', currentValue: false, projects: [project3, project4] },
    //   'place100': { id: 'place100', managerId: '1', currentValue: false, projects: [project4, project2] },
    //   'neve yaakov': { id: 'neve yaakov', managerId: '2', currentValue: false, projects: [project1, project4] },
    // }
    // this.allNeighborhoods = {
    //   'בית חנינה': {
    //     currentValue: false,
    //     id: "בית חנינה",
    //     managerId: "gA6zdmUMlN51NpfyOdhN",
    //     projects: [{
    //       clubCoordinatorId: "0",
    //       comments: "fgbdr",
    //       date: new Date,
    //       projectType: ""
    //     }]
    //   },
    //   'נווה יעקב': {
    //     currentValue: false,
    //     id: "נווה יעקב",
    //     managerId: "Pt8euDiFKZEMBMbAt9uU",
    //     projects: [{
    //       clubCoordinatorId: "dsivTEXYmjbfmeEznSjc",
    //       comments: "papapa parapa papa",
    //       date: new Date,
    //       projectType: "type 1"
    //     },
    //     {
    //       clubCoordinatorId: "onx9hE1J2p1aRsBssV5c",
    //       comments: "k",
    //       date: new Date,
    //       projectType: ""
    //     }]
    //   },
    //   'פסגת זאב': {
    //     currentValue: false,
    //     id: "פסגת זאב",
    //     managerId: "Pt8euDiFKZEMBMbAt9uU",
    //     projects: [{
    //       clubCoordinatorId: "onx9hE1J2p1aRsBssV5c",
    //       comments: "gdsygsd",
    //       date: new Date,
    //       projectType: "some type"
    //     }],
    //   }
    // }


    // this.managers = {
    //   '0': { name: 'aa', id:'', email: 'a@a.c', phone: '1234', neighborhoods: [] },
    //   '1': { name: 'bb', id:'', email: 'b@b.b', phone: '5678', neighborhoods: [] },
    //   '2': { name: 'cc', id:'', email: 'c@c.c', phone: '9101', neighborhoods: [] },
    // }
    // this.managers = {
    //   'Pt8euDiFKZEMBMbAt9uU': {
    //     email: "a@b.c",
    //     id: "Pt8euDiFKZEMBMbAt9uU",
    //     name: "אטיאס שרה",
    //     neighborhoods: ["נווה יעקב"],
    //     phone: "0505356476"
    //   },
    //   'gA6zdmUMlN51NpfyOdhN': {
    //     email: "d@r.b",
    //     id: "gA6zdmUMlN51NpfyOdhN",
    //     name: "manager",
    //     neighborhoods: ["בית חנינה"],
    //     phone: "0243876453"
    //   }
    // }

    // this.clubCoords = {
    //   "dsivTEXYmjbfmeEznSjc": {
    //     address: "שדרות נווה יעקב 38",
    //     club: "וותיקים",
    //     id: "dsivTEXYmjbfmeEznSjc",
    //     name: "אילנה נבון",
    //     // neighborhood: 1,
    //     phone: "057826854"
    //   },
    //   "onx9hE1J2p1aRsBssV5c": {
    //     address: "vatican 1",
    //     club: "a club",
    //     id: "onx9hE1J2p1aRsBssV5c",
    //     name: "amani",
    //     // neighborhood: 2,
    //     phone: "5609823546"
    //   }
    // }
