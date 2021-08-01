import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Subscription } from 'rxjs';
import { Volunteer, Elderly } from '../types/customTypes';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { GetDataService } from '../services/get-data/get-data.service';

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
  columnsToDisplay = ['name', 'neighborhood', 'phone', 'email'];
  expandedElement?: Volunteer | null;

  @ViewChild(MatDrawer) sidenav!: MatDrawer;
  private subs = new Subscription();
  elderlies: Elderly[] = []
  volunteers: Volunteer[] = []
  dataSource: any[] = [];
  constructor(private observer: BreakpointObserver, private dataProvider: GetDataService) { }

  ngOnInit(): void {

    this.dataProvider.getVolunteers().subscribe((res) => {
      this.volunteers = res
      this.dataSource = this.volunteers
    })

    this.dataProvider.getElderlies().subscribe((res) => {
      this.elderlies = res
    })

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
    if (type == 1)
      this.dataSource = this.volunteers
    else
      this.dataSource = this.elderlies
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}


