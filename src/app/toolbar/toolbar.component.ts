import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';
import { Component, NgZone, OnInit } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  isOnTop = true;
  // isLoggedIn:boolean;
  constructor(
    private scrollDispatcher: ScrollDispatcher,
    private zone: NgZone,
    public authService:AuthService,
  ) {
    // this.isLoggedIn=authService.isLoggedIn;
  }

  ngOnInit(): void {
    // this.scrollDispatcher.scrolled().subscribe((event: any) => {
    //   const scroll = event.measureScrollOffset("top");
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
    // this.isLoggedIn=false;
  }

}
