import { Injectable } from '@angular/core';
import {AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { User } from 'src/app/types/user';
@Injectable({
  providedIn: 'root'  
})
export class AuthService {
  constructor(
    private afa: AngularFireAuth,
    private afs: AngularFirestore
    ) {
    // the state will only persist in the current session or tab, and will be cleared when the tab or window in which the user authenticated is closed
    this.afa.setPersistence("session")
   }

  async login(email: string, password: string){
    return this.afa.signInWithEmailAndPassword(email,password);
  }

  
  async logout(){
    return this.afa.signOut();
  }
  async signUp(email: string, password: string){
    // create a user in firebase auth and add it to our firestore 
    // note that auth and firestore are 2 differente things 
    this.afa.createUserWithEmailAndPassword(email,password).then( result=>{
        const user: User= {
          email,
          password,
          uid: result.user?.uid
        };

        this.addtoFireStore(user);
    });
  }
  addtoFireStore(user:User){
    // pass uid to prevent firestore to generate random id
    const ref: AngularFirestoreDocument<User>=this.afs.doc(`users/${user.uid}`);
    ref.set(user);
  }
  reset(emailAddress:string):boolean{
    this.afa.sendPasswordResetEmail(emailAddress).then(function() {
      return true;
    }).catch(function(error) {
      return false;
    });
    return false;
  }

}
