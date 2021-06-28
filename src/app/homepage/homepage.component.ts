import { Component, OnInit } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { GetDataService } from '../services/get-data/get-data.service';
import { AuthService } from '../services/auth/auth.service';

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
  isAdmin!: boolean;
    constructor(
      private afs: AngularFirestore,
      private dataProvider: GetDataService,
      public authService:AuthService,) {
      this.authService.authData$.subscribe(data=>{
        this.isAdmin = data.admin
      })

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

addDialog(action: 'Update' | 'Delete' | 'Add', element: any, type: 'doc' | 'collection', answerContent?: string): void {

  // element.dialogTitle = 'שם של הצורך שברצונך להוסיף?'
  // element.action = action;
  // element.dialogType = 'needs';
  // const dialogRef = this.dialog.open(DialogBoxComponent, {
  //   direction: 'rtl',
  //   data: element,
  // });

  // dialogRef.afterClosed().subscribe(result => {
  //   if (result) {
  //     if (result.event == 'Add' && type == 'collection') {
  //       // Create a reference to the cities collection
  //       let servicesRef = firebase.firestore().collection("Services");
  //       // Create a query against the collection.
  //       let query = servicesRef.where("title", "==", result.data.name.trim());
  //       let exists: boolean
  //       // check if service title already exists, if so don't add it, else add to database
  //       query.get().then((querySnapshot) => {
  //         exists = !querySnapshot.empty
  //       }).then(()=>{
  //         if (exists){
  //           this.snackBar.open("הצורך כבר נמצא !", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
  //         }
  //         else{
  //           this.afs.collection('Services').add({ title: result.data.name, content: [] })
  //         }
  //       })
  //     } else if (result.event == 'Delete' && type == 'collection') {
  //       this.afs.collection('Services').doc(result.data.id).delete()
  //     } else if (result.event == 'Update' && type == 'collection') {
  //       this.afs.doc(`Services/${result.data.id}`).update({ title: result.data.name })
  //     }

  //     else if (result.event == 'Add' && type == 'doc') {
  //       if (result.data.content.indexOf(result.data.name) != -1)
  //         this.snackBar.open("הצורך כבר נמצא !", '', { duration: 1500, direction: 'rtl', panelClass: ['snacks'] });
  //       else {
  //         result.data.content.push(result.data.name)
  //         this.afs.doc(`Services/${result.data.id}`).update({ content: result.data.content })
  //       }
  //     } else if (result.event == 'Delete' && type == 'doc') {
  //       result.data.content.splice(result.data.content.indexOf(answerContent), 1)
  //       this.afs.doc(`Services/${result.data.id}`).update({ content: result.data.content })
  //     } else if (result.event == 'Update' && type == 'doc') {
  //       result.data.content[result.data.content.indexOf(answerContent)] = result.data.name;
  //       this.afs.doc(`Services/${result.data.id}`).update({ content: result.data.content })
  //     }
  //   }

  // });
}

}
