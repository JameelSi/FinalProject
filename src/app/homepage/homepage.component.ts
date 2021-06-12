import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { GetDataService } from '../services/get-data/get-data.service';
import firebase from 'firebase/app';

interface responsiveCarouselOption {
  breakpoint: string,
  numVisible: number,
  numScroll: number
}

interface volunteeringOpp {
  title: string,
  type: any,
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

  // storage = firebase.storage();
  volunteeringOpps!: volunteeringOpp[];
  responsiveOptions: responsiveCarouselOption[]

    constructor(private afs: AngularFirestore, private dataProvider: GetDataService,) {

      this.volunteeringOpps = [
        {
          title: "hu",
          description: "hu",
          img: "../../assets/imgs/shopping.png",
          type: "",
        },
        {
          title: "he",
          description: "he",
          img: "../../assets/imgs/technology.png",
          type: "",
        },
        {
          title: "ha",
          description: "ha",
          img: "../../assets/imgs/hands.jpg",
          type: "",
        },
        {
          title: "hi",
          description: "hi",
          img: "../../assets/imgs/dancing.png",
          type: "",
        },
        {
          title: "ho",
          description: "ho",
          img: "../../assets/imgs/music.png",
          type: "",
        },
      ]

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
  // this.dataProvider.getProjectVolOppsData().subscribe(res =>{
  //   this.volunteeringOpps = res
  //   // this.volunteeringOpps.forEach(opp => {
  //   //   opp.type = this.storage.refFromURL(opp.type)
  //   // })
  // })
}

}
