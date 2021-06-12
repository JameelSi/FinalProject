import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { signinUser } from 'src/app/types/user';
import { Router } from '@angular/router';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  userState: any = null;

  constructor(
    private afa: AngularFireAuth,
    private afs: AngularFirestore,
    public router: Router,
  ) {
    // the state will only persist in the current session or tab, and will be cleared when the tab or window in which the user authenticated is closed
    this.afa.setPersistence("session")

    this.afa.authState.subscribe((auth) => {
      this.userState = auth
    });

  }

  async signUp(email: string, password: string) {
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
  addtoFireStore(user: signinUser) {
    // pass uid to prevent firestore to generate random id
    const ref: AngularFirestoreDocument<signinUser> = this.afs.doc(`users/${user.uid}`);
    ref.set(user);
  }

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

  isAdmin():Promise<boolean>{
    return firebase.firestore().doc(`users/${this.userState.uid}`).get().then((doc) => {
        if (doc.data()?.user.admin)
          return true
        return false
      })
  }


}

// firebase.firestore().doc(`users/${this.userState.uid}`).get().then((doc) => {
//   if (doc.data()?.user.admin)
//     return true
//   return false
// })
