import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  areaCoordsRef: AngularFirestoreCollection<areaCoord>
  neighbsRef: AngularFirestoreCollection<neighborhood>
  managersRef: AngularFirestoreCollection<manager>
  clubCoordsRef: AngularFirestoreCollection<clubCoord>

  constructor(private store: AngularFirestore) {
    this.areaCoordsRef = this.store.collection("AreaCoordinators")
    this.neighbsRef = this.store.collection("ירושלים")
    this.managersRef = this.store.collection("Managers")
    this.clubCoordsRef = this.store.collection("ClubCoordinators")
  }

  // get data for projects tracking page
  getProjectTrackingData(): [Observable<areaCoord[]>, Observable<neighborhood[]>, Observable<manager[]>, Observable<clubCoord[]>] {

    let areaCoords: Observable<areaCoord[]>
    let allNeighborhoods: Observable<neighborhood[]>
    let managers: Observable<manager[]>
    let clubCoords: Observable<clubCoord[]>

    areaCoords = this.areaCoordsRef.valueChanges({ idField: 'id' })
    allNeighborhoods = this.neighbsRef.valueChanges({ idField: 'id' })
    managers = this.managersRef.valueChanges({ idField: 'id' })
    clubCoords = this.clubCoordsRef.valueChanges({ idField: 'id' })
    return [areaCoords, allNeighborhoods, managers, clubCoords]

  }


}
