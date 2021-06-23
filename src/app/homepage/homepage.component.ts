import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GetDataService } from '../services/get-data/get-data.service';

interface responsiveCarouselOption {
  breakpoint: string,
  numVisible: number,
  numScroll: number
}

interface volunteeringOpp {
  title: string,
  type: string,
  description: string,
  date?: Date,
  id?: string,
  img? : string,
}

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss']
})

export class HomepageComponent implements OnInit {

  volunteeringOpps!: volunteeringOpp[];
  responsiveOptions: responsiveCarouselOption[]
  // profileUrl!: Observable<string | null>;
    constructor(
      private afs: AngularFirestore,
      private dataProvider: GetDataService,) {

      this.responsiveOptions = [
        {
          breakpoint: '1024px',
          numVisible: 3,
          numScroll: 3
        },
        {
          breakpoint: '768px',
          numVisible: 2,
          numScroll: 2
        },
        {
          breakpoint: '560px',
          numVisible: 1,
          numScroll: 1
        }
      ];
    }

ngOnInit(): void {
  this.dataProvider.getProjectVolOppsData().subscribe(res =>{
    this.volunteeringOpps = res
  })
}

}
