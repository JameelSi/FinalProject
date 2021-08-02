import { Component, OnInit } from '@angular/core';
import { combineLatest, Subscription } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { GetDataService } from '../services/get-data/get-data.service';
import { areaCoord, Volunteer } from '../types/customTypes';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  isAdmin!: boolean;
  uid!: string;
  userInfo!: Volunteer | undefined
  private subs = new Subscription()

  constructor(private authService: AuthService, private dataProvider: GetDataService) {
    this.uid = authService.uid
  }

  ngOnInit(): void {
    this.subs.add(
      this.authService.authData$.subscribe(auth => {
        this.uid = auth.uid
        this.isAdmin = auth.admin
        this.subs.add(this.dataProvider.getVolInfo(this.uid).subscribe(data => {
          this.userInfo = data;
        }))
      })
    )
  }

  joinArray(arr: any[]){
    return arr.join()
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }


}
