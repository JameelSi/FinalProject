import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { signinUser } from 'src/app/types/customTypes';
import { Router } from '@angular/router';
import firebase from 'firebase/app';
import { defer, from, Observable, Subject } from 'rxjs';
import { concatMap, map, take, tap } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs';

type AuthData = {
  uid: string,
  admin: boolean,
  type: string,
  manager: boolean
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  userState: any = null;
  type = "";
  admin = false;
  manager = false;
  clubCoord = false;
  uid_!: any

  private authSubject = new ReplaySubject<AuthData>(1);

  constructor(
    private afa: AngularFireAuth,
    private afs: AngularFirestore,
    public router: Router,
  ) {
    // the state will only persist in the current session or tab, and will be cleared when the tab or window in which the user authenticated is closed
    this.afa.setPersistence("session")
    this.afa.authState.pipe(
      tap(auth => {
        this.userState = auth
        this.uid_ = auth?.uid
      }),
      concatMap(auth => defer(() => firebase.firestore().collection('Admin').doc(`${auth?.uid}`).get()))
    ).subscribe(doc => {
      this.type = doc.data()?.type
      this.admin = doc.data()?.type === "AreaCoordinators"
      this.manager = doc.data()?.type === "Managers"
      this.authSubject.next({ uid: this.uid, type: this.type, admin: this.admin, manager: this.manager });
    });
  }

  async signUp(email: string, password: string,
    collec: string) {
    // create a user in firebase auth and add it to our firestore 
    // note that auth and firestore are 2 differente things 
    let temp = this.afa.createUserWithEmailAndPassword(email, password).then(result => {
      const user: signinUser = {
        email,
        password,
        uid: result.user?.uid
      };
      return user;
    }).catch(function (error) {
      return null
    });
    return temp;
  }

  // addtoFireStore(user: signinUser, collec: string) {
  //   // pass uid to prevent firestore to generate random id
  //   const ref: AngularFirestoreDocument<signinUser> = this.afs.collection(collec).doc(`${user.uid}`);
  //   ref.set(user).catch(err=>{throw(err)});
  // }

  reset(emailAddress: string) {
    let temp = this.afa.sendPasswordResetEmail(emailAddress).then(function () {
      return true;
    }).catch(function (error) {
      return false;
    });
    return temp;
  }

  async login(email: string, password: string) {
    return await this.afa.signInWithEmailAndPassword(email, password);
  }

  logout() {
    this.afa.signOut().then(() => {
      this.router.navigate(['']);
    })
  }

  get isLoggedIn(): boolean {
    return (this.userState !== null) ? true : false;
  }

  get isAdmin(): boolean {
    return this.admin
  }

  get isAdmin$() {
    return this.authSubject.pipe(map(({ admin }) => admin));
  }

  get isManager(): boolean {
    return this.manager
  }

  get isManager$() {
    return this.authSubject.pipe(map(({ manager }) => manager));
  }

  get adminType(): string {
    return this.type;
  }

  get adminType$() {
    return this.authSubject.pipe(map(({ type }) => type))
  }

  get uid(): string {
    return this.uid_
  }

  get uid$() {
    return this.authSubject.pipe(map((({ uid }) => uid)));
  }

  get authData$() {
    return this.authSubject.asObservable();
  }


}

