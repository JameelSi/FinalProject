import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { combineLatest, Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { areaCoord, neighborhood, manager, clubCoord, event, message, Volunteer, Elderly,emailTemplate } from '../../types/customTypes';

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
  volunteersRef: AngularFirestoreCollection<Volunteer>
  elderliesRef: AngularFirestoreCollection<Elderly>
  emailTemplatesRef: AngularFirestoreCollection<emailTemplate>

  constructor(private store: AngularFirestore) {
    this.areaCoordsRef = this.store.collection("AreaCoordinators")
    this.neighbsRef = this.store.collection("ירושלים")
    this.managersRef = this.store.collection("Managers")
    this.clubCoordsRef = this.store.collection("ClubCoordinators")
    this.eventsRef = this.store.collection("Events", ref => {
      return ref.orderBy("date")
    })
    this.readMessagesRef = this.store.collection('Messages', (ref: any) => { return ref.where('read', '==', true).orderBy('date', "desc") })
    this.unreadMessagesRef = this.store.collection('Messages', (ref: any) => { return ref.where('read', '==', false).orderBy('date', "desc") })
    this.volunteersRef = this.store.collection("Volunteers")
    this.elderliesRef = this.store.collection("Elderlies")
    this.emailTemplatesRef=this.store.collection("EmailsTemplates")
  }

  // get data for projects tracking page
  getProjectTrackingData() {
    const areaCoords = this.areaCoordsRef.valueChanges({ idField: 'id' })
    const allNeighborhoods = this.neighbsRef.valueChanges({ idField: 'id' })
    const managers = this.managersRef.valueChanges({ idField: 'id' })
    const clubCoords = this.clubCoordsRef.valueChanges({ idField: 'id' })
    return combineLatest([areaCoords, allNeighborhoods, managers, clubCoords]);
  }

  getProjectVolOppsData() {
    let volOpps: Observable<event[]>
    volOpps = this.eventsRef.valueChanges({ idField: 'id' });
    return volOpps
  }

  getJerNeighborhoods() {
    let neighborhoods: Observable<neighborhood[]>
    neighborhoods = this.neighbsRef.valueChanges({ idField: 'id' });
    return neighborhoods
  }

  getMessages() {
    let readMsgs: Observable<message[]>
    let unreadMsgs: Observable<message[]>
    readMsgs = this.readMessagesRef.valueChanges({ idField: 'id' });
    unreadMsgs = this.unreadMessagesRef.valueChanges({ idField: 'id' });
    return combineLatest([readMsgs, unreadMsgs])
  }

  getVolInfo(uid: string) {
    let user: Observable<Volunteer | undefined>
    let userRef = this.store.doc<Volunteer>(`Volunteers/${uid}`)
    user = userRef.valueChanges({ idField: 'id' })
    return user
  }
  getVolunteers() {
    const vols = this.volunteersRef.valueChanges({ idField: 'id' });
    return vols
  }
  getElderlies() {
    const elds = this.elderliesRef.valueChanges({ idField: 'id' });
    return elds
  }

  getManagers(){
    let orderedManagersRef: AngularFirestoreCollection<manager>
    orderedManagersRef = this.store.collection("Managers", ref => { return ref.orderBy("name") })
    return orderedManagersRef.valueChanges({ idField: 'id' })
  }
  getEmailTemplates() {
    const temps = this.emailTemplatesRef.valueChanges({ idField: 'id' });
    return temps
  }

  getBotReplies(){
    let botRepliesRef: AngularFirestoreDocument<{ [key: string]: string }>
    botRepliesRef = this.store.collection("Bot").doc("Responses")
    return botRepliesRef.valueChanges()
  }

}
