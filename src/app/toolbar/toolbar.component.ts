import { BreakpointObserver } from '@angular/cdk/layout';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  // showOnMobile: boolean;
  // showOnTablet: boolean;
  // showOnDesktop: boolean;
}

import { AuthService } from '../services/auth/auth.service';
@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {
  @ViewChild(MatToolbar) nav!: MatToolbar;
  isOnTop = true;
  menuItems: MenuItem[] = [
    {
      label: "מעקב מיזמים",
      icon: "table_chart", // summorize / show_chart
      route: "/projectsTracking",
    },{
      label: "מענים",
      icon: "medical_services",
      route: "/needs",
    },{
      label: "רישום",
      icon: "person_add_alt",
      route: "/signup",
    }, {
      label: "כניסה",
      icon: "login",
      route: "/signin",
    }, {
      label: "דף הבית",
      icon: "home",
      route: "/home",
    }]
  constructor(
    private scrollDispatcher: ScrollDispatcher,
    private zone: NgZone,
    private observer: BreakpointObserver,
    public authService:AuthService,
  ) {}

  ngOnInit(): void {
    // this.scrollDispatcher.scrolled().subscribe((event: any) => {
    //   console.log('event', event)
    //   const scroll = event.CdkScrollable.measureScrollOffset("start");
    //   let newIsOnTop = this.isOnTop;

    //   if (scroll > 0) {
    //     newIsOnTop = false
    //   } else {
    //     newIsOnTop = true;
    //   }

    //   if (newIsOnTop !== this.isOnTop) {
    //     this.zone.run(() => {
    //       this.isOnTop = newIsOnTop;
    //     });
    //   }
    // });
    
    }
  logOut(){
    this.authService.logout()
  }
  ngAfterViewInit() {

  }
}
