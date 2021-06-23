import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
// import { map, catchError } from 'rxjs/operators';

export interface areaCoord {
  id: string,
  name: string,
  email: string,
  phone: string,
  neighborhoods: string[]
}

export interface neighborhood {
  id: string,
  currentValue: boolean,
  managerId: string,
  projects: project[],
}

export interface project {
  projectType: string,
  comments: string,
  date: Date,
  clubCoordinatorId: string
}

export interface manager {
  id: string,
  name: string,
  email: string,
  phone: string,
  neighborhoods: string[]
}

export interface clubCoord {
  id: string,
  address: string,
  club: string,
  name: string,
  phone: string
}

interface volunteeringOpp {
  title: string,
  type: string,
  description: string,
  date: Date,
  id: string,
}

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  areaCoordsRef: AngularFirestoreCollection<areaCoord>
  neighbsRef: AngularFirestoreCollection<neighborhood>
  managersRef: AngularFirestoreCollection<manager>
  clubCoordsRef: AngularFirestoreCollection<clubCoord>
  volunteeringOppsRef: AngularFirestoreCollection<volunteeringOpp>;

  constructor(private store: AngularFirestore) {
    this.areaCoordsRef = this.store.collection("AreaCoordinators")
    this.neighbsRef = this.store.collection("ירושלים")
    this.managersRef = this.store.collection("Managers")
    this.clubCoordsRef = this.store.collection("ClubCoordinators")
    this.volunteeringOppsRef = this.store.collection("volunteeringOpportunities", ref => {
      return ref.orderBy("date")
    })
  }

  // get data for projects tracking page
  getProjectTrackingData() {
    const areaCoords = this.areaCoordsRef.valueChanges({ idField: 'id' })
    const allNeighborhoods = this.neighbsRef.valueChanges({ idField: 'id' })
    const managers = this.managersRef.valueChanges({ idField: 'id' })
    const clubCoords = this.clubCoordsRef.valueChanges({ idField: 'id' })
    return combineLatest([areaCoords, allNeighborhoods, managers, clubCoords]);

  }

  getProjectVolOppsData(){
    let volOpps: Observable<volunteeringOpp[]>
    volOpps = this.volunteeringOppsRef.valueChanges({ idField: 'id' });
    return volOpps
  }


}
