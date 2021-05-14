import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

interface project {
  projectType: string,
  comments: string,
  date: Date,
  clubCoordinatorId: string
}

@Component({
  selector: 'app-dialog-box',
  templateUrl: './dialog-box.component.html',
  styleUrls: ['./dialog-box.component.scss']
})


export class DialogBoxComponent implements OnInit {
  dialogTitle:string;
  action:string;
  local_data:any;

  constructor( public dialogRef: MatDialogRef<DialogBoxComponent>,
    //@Optional() is used to prevent error if no data is passed
    @Optional() @Inject(MAT_DIALOG_DATA) public data: project) {
    this.local_data = {...data};
    this.action = this.local_data.action;
    this.dialogTitle=this.local_data.dialogTitle;
  }

  doAction(){
    this.dialogRef.close({event:this.action,data:this.local_data});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }
  

  ngOnInit(): void {
  }

}
