import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { Volunteer, Elderly, neighborhood } from '../types/customTypes';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { GetDataService } from '../services/get-data/get-data.service';
import { MatDialog } from '@angular/material/dialog';
import { AngularFirestore } from '@angular/fire/firestore';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { SelectionModel } from '@angular/cdk/collections';
import firebase from 'firebase/app';

import "firebase/functions"
import * as mail from '@sendgrid/mail';
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
  columnsToDisplay = ['select', 'name', 'neighborhood', 'phone', 'email', 'delete'];
  expandedElement?: Volunteer | null;
  selection = new SelectionModel<any>(true, []);
  @ViewChild(MatDrawer) sidenav!: MatDrawer;
  config!: MatSnackBarConfig
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  private subs = new Subscription();
  elderlies: Elderly[] = []
  volunteers: Volunteer[] = []
  dataSource: any[] = [];
  neighborhoods!: neighborhood[]
  currType = 1
  currNeighb = "הכל"
  emptySelection = false;

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
        if (this.currType && this.currType == 2)
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
    this.currNeighb = "הכל"
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
      this.currNeighb = "הכל"
      this.selection.clear()
    }
    else {
      this.currNeighb = neighb.id
      this.selection.clear()
      // let neighbs = this.neighborhoods.find(n => n.id === (neighb as neighborhood).id)
      if (this.currType == 1)
        this.dataSource = this.volunteers.filter(e => e.neighborhood === (neighb as neighborhood).id)
      else
        this.dataSource = this.elderlies.filter(e => e.neighborhood === (neighb as neighborhood).id)
    }
  }

  deleteUser(user: any) {
    let element: any = {}
    let collec: 'Volunteers' | 'Elderlies'
    if (this.currType == 1)
      collec = "Volunteers"
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
            this.snackBar.open("התהליך הסתיים בהצלחה", '', {
              duration: 4000, direction: 'rtl', horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition, panelClass: ['white-snackbar']
            });
          }).catch((error) => {
            this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', {
              duration: 4000, direction: 'rtl', horizontalPosition: this.horizontalPosition,
              verticalPosition: this.verticalPosition, panelClass: ['white-snackbar']
            });
          });
      }
    })
  }

  isAllSelected() {
    return this.selection.selected.length === this.dataSource.length;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.forEach(row => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }
  sendMail() {
    if (this.selection.selected.length < 1) {
      this.emptySelection = true
      return;
    }
    this.emptySelection = false
    let sendmail = firebase.functions().httpsCallable('sendEmail');
    let emails: Array<String> = []
    this.selection.selected.forEach(function (value) {
      emails.push(value.email);
    })

    let element: any = {}
    element.dialogTitle = 'נא למלות את נוסח המייל'
    element.action = 'reset';
    element.dialogType = 'sendMail'
    element.count = emails.length
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event != 'Cancel') {
        // replace spaces with br so that there will be new lines in the sent mail
        let mailContent =result.data.mailContent.replaceAll('\n', '<br>')
        sendmail({ emails: emails, subject: result.data.mailSubject, text: mailContent }).then((result) => {
          this.snackBar.open("נשלח בהצלחה", '', {
            duration: 4000, direction: 'rtl', horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition, panelClass: ['white-snackbar']
          });
        }).catch((error) => {
          this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', {
            duration: 4000, direction: 'rtl', horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition, panelClass: ['white-snackbar']
          });
        });
      }
    })
  }

  editTemplates(){
    let element: any = {}
    element.dialogTitle = 'עדכון תבניות'
    element.dialogType = 'editTemplates'
    this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });
  }

}


