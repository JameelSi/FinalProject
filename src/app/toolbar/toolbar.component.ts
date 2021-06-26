import { BreakpointObserver } from '@angular/cdk/layout';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { AuthService } from '../services/auth/auth.service';

export interface MenuItem {
  label: string;
  icon: string;
  route: string;
  admin: boolean;
  requireLogIn: boolean;
  requireLogOut? : boolean;
  showAll?: boolean;
  // showOnMobile: boolean;
  // showOnTablet: boolean;
  // showOnDesktop: boolean;
}

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  @ViewChild(MatToolbar) nav!: MatToolbar;
  isOnTop = true;
  isAdmin!: boolean
  userType!: string

  menuItems: MenuItem[] = [
    {
      label: "דף הבית",
      icon: "home",
      route: "/home",
      admin: false,
      requireLogIn: false,
      requireLogOut: false,
      showAll: true,
    },{
      label: "רישום למתנדב",
      icon: "person_add_alt",
      route: "/signup/Volunteers",
      admin: false,
      requireLogIn: false,
      requireLogOut: true
    }, {
      label: "רישום לקשיש",
      icon: "person_add_alt",
      route: "/signup/Elderlies",
      admin: false,
      requireLogIn: false,
      requireLogOut: true
    }, {
      label: "מעקב מיזמים",
      icon: "table_chart", // summorize / show_chart
      route: "/projectsTracking",
      admin: true,
      requireLogIn: true,
      requireLogOut: false
    },{
      label: "מענים",
      icon: "medical_services",
      route: "/needs",
      admin: false,
      requireLogIn: false,
      requireLogOut: false,
      showAll: true,
    }, {
      label: "הגדרות",
      icon: "",
      route: "/settings",
      admin: true,
      requireLogIn: true,
      requireLogOut: false,
      showAll: false,
    }, 
  ]

  constructor(
    private scrollDispatcher: ScrollDispatcher,
    private zone: NgZone,
    private observer: BreakpointObserver,
    public authService:AuthService,
  ) {
    this.authService.authData$.subscribe(data=>{
      this.isAdmin = data.admin
      this.userType = data.type
    })
  }

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
  
}