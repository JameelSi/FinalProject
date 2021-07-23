import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
// import { map, catchError } from 'rxjs/operators';
import { areaCoord, neighborhood, manager, clubCoord, event, message} from '../../types/customTypes';

@Injectable({
  providedIn: 'root'
})
export class GetDataService {

  areaCoordsRef: AngularFirestoreCollection<areaCoord>
  neighbsRef: AngularFirestoreCollection<neighborhood>
  managersRef: AngularFirestoreCollection<manager>
  clubCoordsRef: AngularFirestoreCollection<clubCoord>
  eventsRef: AngularFirestoreCollection<event>
  readMessagesRef: AngularFirestoreCollection<message>
  unreadMessagesRef: AngularFirestoreCollection<message>

  constructor(private store: AngularFirestore) {
    this.areaCoordsRef = this.store.collection("AreaCoordinators")
    this.neighbsRef = this.store.collection("ירושלים")
    this.managersRef = this.store.collection("Managers")
    this.clubCoordsRef = this.store.collection("ClubCoordinators")
    this.eventsRef = this.store.collection("Events", ref => {
      return ref.orderBy("date")
    })
    this.readMessagesRef = this.store.collection('Messages', (ref: any) => {return ref.where('read', '==', true).orderBy('date', "desc")})
    this.unreadMessagesRef = this.store.collection('Messages', (ref: any) => { return ref.where('read', '==', false).orderBy('date', "desc")})
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
    let volOpps: Observable<event[]>
    volOpps = this.eventsRef.valueChanges({ idField: 'id' });
    return volOpps
  }

  getJerNeighborhoods(){
    let neighborhoods: Observable<neighborhood[]>
    neighborhoods = this.neighbsRef.valueChanges({ idField: 'id' });
    return neighborhoods
  }

  getMessages(){
    let readMsgs: Observable<message[]>
    let unreadMsgs: Observable<message[]>
    readMsgs = this.readMessagesRef.valueChanges({ idField: 'id' });
    unreadMsgs = this.unreadMessagesRef.valueChanges({ idField: 'id' });
    return combineLatest([readMsgs, unreadMsgs])
  }

}
