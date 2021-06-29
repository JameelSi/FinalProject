import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GetDataService } from '../services/get-data/get-data.service';
import { AuthService } from '../services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { MatSnackBar } from '@angular/material/snack-bar';

interface responsiveCarouselOption {
  breakpoint: string,
  numVisible: number,
  numScroll: number
}

interface event {
  title: string,
  type?: string,
  description?: string,
  date?: Date,
  id?: string,
  img?: string,
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})

export class HomepageComponent implements OnInit {

  events!: event[];
  responsiveOptions: responsiveCarouselOption[]
  // profileUrl!: Observable<string | null>;
  isAdmin!: boolean
  constructor(
    private afs: AngularFirestore,
    private dataProvider: GetDataService,
    public authService: AuthService,
    private dialog: MatDialog,
    readonly snackBar: MatSnackBar) {
    this.authService.authData$.subscribe(data => {
      this.isAdmin = data.admin
    })
    this.responsiveOptions = [
      {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 3
      },
      {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 2
      },
      {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
      }
    ];
  }

  ngOnInit(): void {
    this.dataProvider.getProjectVolOppsData().subscribe(res => {
      this.events = res
    })
  }

  openDialog(action: 'Delete' | 'Add', element: any, doc: string | undefined) {
    let collec = 'Events'
    if(action==='Add') element.dialogTitle = 'הוסף את פרטי האירוע החדש'
    else if(action==='Delete') element.dialogTitle = 'בטוח למחוק את האירוע?'
    element.action = action;
    element.dialogType = 'event';
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.event != 'Cancel') {
        if (result.data.action === "Add") {
          this.afs.collection(collec).add({
            ...result.newEvent
          }).then(() => {
            this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          }).catch((error) => {
            this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          });
        }
        else if (result.data.action === "Delete") {
          this.afs.collection(collec).doc(doc).delete().then(() => {
            this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          }).catch((error) => {
            this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          });
        }
      }
    })
  }

}
