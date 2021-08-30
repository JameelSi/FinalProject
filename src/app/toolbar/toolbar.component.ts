import { BreakpointObserver } from '@angular/cdk/layout';
import { Component,ViewChild } from '@angular/core';
import { MatToolbar } from '@angular/material/toolbar';
import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { MenuItem } from '../types/customTypes';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {

  @ViewChild(MatToolbar) nav!: MatToolbar;
  isOnTop = true;
  isAdmin = false;
  userType!: string
  isSmall=false;
  menuItems: MenuItem[] = [
    {
      label: "דף הבית",
      icon: "home",
      route: "/home",
      admin: false,
      requireLogIn: false,
      requireLogOut: false,
      showAll: true,
    }, {
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
    }, {
      label: "מענים",
      icon: "medical_services",
      route: "/needs",
      admin: false,
      requireLogIn: false,
      requireLogOut: false,
      showAll: true,
    }, {
      label: "תפקידים",
      icon: "settings",
      route: "/settings",
      admin: true,
      requireLogIn: true,
      requireLogOut: false,
      showAll: false,
    }, {
      label: "מאגר נרשמים",
      icon: "groups",
      route: "/registereduser",
      admin: true,
      requireLogIn: true,
      requireLogOut: false,
      showAll: false,
    }, {
      label: "ריכוז הודעות",
      icon: "message",
      route: "/messages",
      admin: true,
      requireLogIn: true,
      requireLogOut: false,
      showAll: false,
    }, {
      label: "איזור אישי",
      icon: "account_circle",
      route: "/profile",
      admin: false,
      requireLogIn: true,
      requireLogOut: false,
      showAll: false,
    }, {
      label: "מעקב משימות",
      icon: "task_alt",
      route: "/tasks",
      admin: true,
      requireLogIn: true,
      requireLogOut: false,
      showAll: false,
    },{
      label: "sms בוט",
      icon: "smart_toy", 
      route: "/sms",
      admin: true,
      requireLogIn: true, 
      requireLogOut: false,
      showAll: false,
    },

  ]
  subs = new Subscription()
  constructor(public authService: AuthService, private observer: BreakpointObserver,)  {
    this.subs.add(
      this.authService.authData$.subscribe(data => {
        this.isAdmin = data.admin
        this.userType = data.type
      })
    )
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.subs.add(
        this.observer.observe(['(max-width: 1150px)']).subscribe((res) => {
          if(res.matches)
            this.isSmall=true;
          else 
            this.isSmall=false;
        })
      );
    });

  }

  ngOnDestroy() {
    this.subs.unsubscribe()
  }
  logOut() {
    this.authService.logout()
  }

}
