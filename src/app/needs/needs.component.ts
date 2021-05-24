import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore'
import { Observable, Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';

export interface Item { title: string; content: Array<string>; id: string; }

@Component({
  selector: 'app-needs',
  templateUrl: './needs.component.html',
  styleUrls: ['./needs.component.scss']
})
export class NeedsComponent implements OnInit, OnDestroy {

  @ViewChild(MatDrawer)
  sidenav!: MatDrawer;
  arr: Array<String> = [];
  name: string = "";
  config!: MatSnackBarConfig
  panelOpenState: boolean = false;
  currentStyles?: {};
  backgroundCol?: string;
  private subs = new Subscription();
  private itemsCollection: AngularFirestoreCollection<Item>;
  items!: Observable<Item[]>;

  constructor(private viewportScroller: ViewportScroller, private router: Router, private observer: BreakpointObserver, public dialog: MatDialog, readonly snackBar: MatSnackBar, private afs: AngularFirestore) {
    this.itemsCollection = afs.collection<Item>('items');
  }

  ngOnInit() {
    this.itemsCollection = this.afs.collection('Services', ref => {
      return ref.orderBy("title")
    })
    this.items = this.itemsCollection.valueChanges({ idField: 'id' });
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
        }))
    });
  }

  addDialog(action: 'Update' | 'Delete' | 'Add', element: any, type: 'doc' | 'collection', answerContent?: string): void {

    if (action === 'Add' && type == 'collection')
      element.dialogTitle = 'שם של הצורך שברצונך להוסיף?'
    else if (action === 'Delete' && type == 'collection')
      element.dialogTitle = 'בטוח למחוק את הצורך וכל מעניו?'

    else if (action === 'Add' && type == 'doc')
      element.dialogTitle = 'נא להקליד את תוכן המענה'
    else if (action === 'Delete' && type == 'doc')
      element.dialogTitle = 'בטוח למחוק ?'
    else if (action === 'Update')
      element.dialogTitle = 'מה הערך החדש?'

    element.action = action;
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      width: '25%',
      direction: 'rtl',
      data: element,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.event == 'Add' && type == 'collection') {
          if (true)
            this.snackBar.open("הצורך כבר נמצא !", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
          else
            this.afs.collection('Services').add({ title: result.data.name, content: [] })
        } else if (result.event == 'Delete' && type == 'collection') {
          this.afs.collection('Services').doc(result.data.id).delete()
        } else if (result.event == 'Update' && type == 'collection') {
          this.afs.doc(`Services/${result.data.id}`).update({ title: result.data.name })
        }

        else if (result.event == 'Add' && type == 'doc') {
          if (result.data.content.indexOf(result.data.name) != -1)
            this.snackBar.open("הצורך כבר נמצא !", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
          else {
            result.data.content.push(result.data.name)
            this.afs.doc(`Services/${result.data.id}`).update({ content: result.data.content })
          }
        } else if (result.event == 'Delete' && type == 'doc') {
          result.data.content.splice(result.data.content.indexOf(answerContent), 1)
          this.afs.doc(`Services/${result.data.id}`).update({ content: result.data.content })
        } else if (result.event == 'Update' && type == 'doc') {
          result.data.content[result.data.content.indexOf(answerContent)] = result.data.name;
          this.afs.doc(`Services/${result.data.id}`).update({ content: result.data.content })
        }
      }

    });
  }

  // scrollToElement($element: any): void {
  //   console.log($element);
  //   this.viewportScroller.scrollToAnchor($element);
  //   setTimeout(() => {
  //     // $element.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest" });
  //     // this.router.onSameUrlNavigation = "reload";
  //     this.router.navigate(["/needs/"], { fragment: $element })
  //     // .finally(() => {
  //     //   this.router.onSameUrlNavigation = "ignore"; // Restore config after navigation completes
  //     // });
  //   }, 0)
  // }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
