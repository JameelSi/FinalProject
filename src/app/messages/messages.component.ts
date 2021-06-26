import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';


interface msg {
  from: string,
  date: string,
  content: string,
  contact?: string
}
@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  readMsgs: msg[] = [{ from: "user1", date: "01-12-1995", content: "hey there", contact: '050555' }, { from: "user2", date: "01-12-1996", content: "hello there" }];
  unreadMsgs: msg[] = [{ from: "user1", date: "01-12-1995", content: "hey there", contact: '050555' }, { from: "user2", date: "01-12-1996", content: "hello there" }];
  // temparr:msg[]=[{ from: "user1", date: "01-12-1995", content: "hey there", contact: '050555' }, { from: "user2", date: "01-12-1996", content: "hello there" }];
  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
  }
  applyFilter(event: Event, arr: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    let filter = filterValue.trim().toLowerCase();
    // this.temparr=this.readMsgs.filter(t=>t.content ===filter || t.date ===filter || t.from ===filter);
  }
  deleteDialog(element: any) {
    element.dialogTitle = 'בטוח למחוק את ההודעה?'
    element.action = 'Delete';
    const dialogRef = this.dialog.open(DialogBoxComponent, {
      direction: 'rtl',
      data: element,
    });

    dialogRef.afterClosed().subscribe(result => {
        if (result) { 
          // this.afs.collection('Services').doc(result.data.id).delete()
        }
      })
  }
  move() {

  }

}