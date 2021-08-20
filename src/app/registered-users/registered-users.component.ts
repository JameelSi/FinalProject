import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { Volunteer, Elderly, neighborhood } from '../types/customTypes';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { GetDataService } from '../services/get-data/get-data.service';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';

@Component({
  selector: 'app-registered-users',
  templateUrl: './registered-users.component.html',
  styleUrls: ['./registered-users.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})


export class RegisteredUsersComponent implements OnInit {
  columnsToDisplay = ['name', 'neighborhood', 'phone', 'email', 'delete'];
  expandedElement?: Volunteer | null;

  @ViewChild(MatDrawer) sidenav!: MatDrawer;
  private subs = new Subscription();
  elderlies: Elderly[] = []
  volunteers: Volunteer[] = []
  dataSource: any[] = [];
  neighborhoods!: neighborhood[]
  currType!: number

  constructor(private observer: BreakpointObserver, private dataProvider: GetDataService, private dialog: MatDialog, private afs: AngularFirestore, readonly snackBar: MatSnackBar) { }

  ngOnInit(): void {

    this.subs.add(
      this.dataProvider.getVolunteers().subscribe((res) => {
        this.volunteers = res
        this.dataSource = this.volunteers
      })
    )

    this.subs.add(
      this.dataProvider.getElderlies().subscribe((res) => {
        this.elderlies = res
        this.dataSource = this.elderlies
      })
    )

    this.subs.add(
      this.dataProvider.getJerNeighborhoods().subscribe(data => {
        this.neighborhoods = data
      })
    )
    // this.dataSource = this.volunteers
    // console.log(this.volunteers)
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
  }

  changeType(type: number) {
    this.currType = type
    if (type == 1)
      this.dataSource = this.volunteers
    else
      this.dataSource = this.elderlies
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  setNeighb(neighb: neighborhood | 'all') {
    if (neighb == 'all') {
      this.changeType(this.currType)
    }
    else {
      // let neighbs = this.neighborhoods.find(n => n.id === (neighb as neighborhood).id)
      if (this.currType == 1)
        this.dataSource = this.volunteers.filter(e => e.neighborhood === (neighb as neighborhood).id)
      else
        this.dataSource = this.elderlies.filter(e => e.neighborhood === (neighb as neighborhood).id)
    }
  }

  deleteUser(user: any) {
    console.log(user)

    let element: any = {}
    let collec: 'Volunteers' | 'Elderlies'
    if(this.currType==1)
      collec= "Volunteers"
    else 
      collec = 'Elderlies'
    element.dialogTitle = 'בטוח למחוק?'
    element.action = 'Delete';
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });

    // if user is a colunteer delete from authentication too TODO

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event != 'Cancel') {
        this.afs.collection(collec).doc(user.id).delete()
        .then(() => {
          this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        }).catch((error) => {
          this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
        });
      }
    })
  }
      



}


