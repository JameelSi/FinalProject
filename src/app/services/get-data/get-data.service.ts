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

  constructor(private store: AngularFirestore) { 

  }

  getData(): [Observable<areaCoord[]>, Observable<neighborhood[]>, Observable<manager[]>, Observable<clubCoord[]>] {
    
    const areaCoordsRef: AngularFirestoreCollection<areaCoord> = this.store.collection("AreaCoordinators")
    const neighbsRef: AngularFirestoreCollection<neighborhood> = this.store.collection("ירושלים")
    const managersRef: AngularFirestoreCollection<manager> = this.store.collection("Managers")
    const clubCoordsRef: AngularFirestoreCollection<clubCoord> = this.store.collection("ClubCoordinators") 

    let areaCoords: Observable<areaCoord[]>
    let allNeighborhoods: Observable<neighborhood[]>
    let managers: Observable<manager[]>
    let clubCoords: Observable<clubCoord[]>

    areaCoords = areaCoordsRef.valueChanges({idField: 'id'})
    allNeighborhoods = neighbsRef.valueChanges({idField: 'id'})
    managers = managersRef.valueChanges({idField: 'id'})
    clubCoords = clubCoordsRef.valueChanges({idField: 'id'})
    console.log(areaCoords, allNeighborhoods, managers, clubCoords)
    return [areaCoords, allNeighborhoods, managers, clubCoords]

  }

  
}
