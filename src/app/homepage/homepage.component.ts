import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GetDataService } from '../services/get-data/get-data.service';
import { AuthService } from '../services/auth/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { event } from '../types/customTypes';
import { Subscription } from 'rxjs';
interface responsiveCarouselOption {
  breakpoint: string,
  numVisible: number,
  numScroll: number
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})

export class HomepageComponent implements OnInit {

  events!: event[];
  responsiveOptions: responsiveCarouselOption[]
  subs = new Subscription()
  // profileUrl!: Observable<string | null>;
  isAdmin!: boolean
  constructor(
    private afs: AngularFirestore,
    private dataProvider: GetDataService,
    public authService: AuthService,
    private dialog: MatDialog,
    readonly snackBar: MatSnackBar) {
    this.subs.add(this.authService.authData$.subscribe(data => {
      this.isAdmin = data.admin
    }))
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
    this.subs.add(this.dataProvider.getProjectVolOppsData().subscribe(res => {
      this.events = res
    })
    )
  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }

  openDialog(action: 'Delete' | 'Add', type: 'editEvent', doc: event | undefined) {
    let collec = 'Events'
    let element: any = {}
    if (action === 'Add') element.dialogTitle = 'הוסף את פרטי האירוע החדש'
    else if (action === 'Delete') element.dialogTitle = 'בטוח למחוק את האירוע?'
    else if (action === 'Display') element.dialogTitle = 'פרטי האירוע'
    element.action = action;
    element.dialogType = type;
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
          this.afs.collection(collec).doc(doc?.id).delete().then(() => {
            this.snackBar.open("התהליך הסתיים בהצלחה", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          }).catch((error) => {
            this.snackBar.open("קרתה שגיאה נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
          });
        }
      }
    })
  }

  modal(imageSrc: any, imageTitle: string, imageDescrip: string) {
    // Get the modal
    let modal = document.getElementById("myModal");

    // Get the image and insert it inside the modal - use its "alt" text as a caption
    let modalImg: any
    let temp = document.getElementById("img01");
    if (temp) {
      modalImg = temp
    }
    let captionText = document.getElementById("caption");
    let titleText = document.getElementById("title");
    if (modal && modalImg && captionText && titleText) {
      modal.style.display = "block";
      (modalImg as HTMLImageElement).src = imageSrc;
      captionText.innerHTML = imageDescrip;
      titleText.innerHTML = imageTitle;
    }

    // Get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0] as HTMLElement;
    // When the user clicks on <span> (x), close the modal
    span.onclick = function () {
      if (modal) {
        modal.style.display = "none";
      }
    }
  }

}
