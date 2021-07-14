import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';

interface Volunteer {
  projectType: string,
  comments: string,
  date: Date,
  clubCoordinatorId: string,
}
interface Elderly {
  projectType: string,
  comments: string,
  date: Date,
  clubCoordinatorId: string,
}

@Component({
  selector: 'app-registered-users',
  templateUrl: './registered-users.component.html',
  styleUrls: ['./registered-users.component.scss']
})


export class RegisteredUsersComponent implements OnInit {
  @ViewChild(MatDrawer) sidenav!: MatDrawer;
  private subs = new Subscription();
  volunteers!: MatTableDataSource<Volunteer>
  elderlies!: MatTableDataSource<Elderly>
  displayedColumns: string[] = ['fName', 'lName']

  constructor(private observer: BreakpointObserver) { }

  ngOnInit(): void {
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
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
