import { Component, Inject,OnInit,ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { BreakpointObserver } from '@angular/cdk/layout';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MatSnackBar, MatSnackBarConfig} from '@angular/material/snack-bar';
import {AngularFirestore,AngularFirestoreCollection} from '@angular/fire/firestore'
import { Observable } from 'rxjs';

export interface DialogData { name: string; arr: Array<string>;}
export interface Item { title: string; content: Array<string>; id:string; }

@Component({
  selector: 'app-needs',
  templateUrl: './needs.component.html',
  styleUrls: ['./needs.component.scss']
})
export class NeedsComponent implements OnInit {

  @ViewChild(MatDrawer)
  sidenav!: MatDrawer;
  direction =["to top","to top right","to right","to bottom right","to bottom","to bottom left","to left","to top left"];
  arr: Array<String>=[];
  name: string|undefined;
  config!: MatSnackBarConfig
  panelOpenState:boolean=false;
  currentStyles?: {};
  backgroundCol?: string;

  private itemsCollection: AngularFirestoreCollection<Item>;
  items!: Observable<Item[]>;
    setCurrentStyles() {
      // CSS styles: set per current state of component properties
      this.currentStyles = {
        'background':  this.backgroundCol
      };
    }
 
  constructor(private observer: BreakpointObserver,public dialog: MatDialog,readonly snackBar: MatSnackBar, private afs: AngularFirestore) {
    this.itemsCollection = afs.collection<Item>('items');
  }
  
  ngOnInit(){
    // this.itemsCollection=this.afs.collection('Services', ref =>{
    //   return ref.orderBy('sth')
    // })
    this.itemsCollection=this.afs.collection('Services', ref =>{
        return ref.orderBy("title")
      })
    this.items=this.itemsCollection.valueChanges({ idField: 'id' });

    // this.items.subscribe(val => {
    //   for(let i=0;i<val.length;i++)
    //     this.arr.push(val[i].title)
    // })
  }

  ngAfterViewInit() {
    this.observer.observe(['(max-width: 800px)']).subscribe((res) => {
      if (res.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }
    });
  }

  addService(): void {
    // const dialogRef = this.dialog.open(DialogOverviewExampleDialog, {
    //   // width: '25%',
    //   // height:'30%',
    //   direction:'rtl',
    //   data: {name: this.name},
    // });

    

    // dialogRef.afterClosed().subscribe(result => {
    //   // console.log(typeof(result));

    //     if(this.arr.indexOf(result)>-1)
    //       this.snackBar.open("הצורך כבר נמצא !",'',{duration:1500,direction:'rtl',panelClass:['snacks']});
    //     else{
          
    //   }

      
    // });
  }
  addContent( id:string, content:Array<string>): void {
    content.push('hellos')
      this.afs.doc(`Services/${id}`).update({content:content})
    }


}
