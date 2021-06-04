import { Injectable } from '@angular/core';
import {AngularFireAuth } from '@angular/fire/auth'
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { signinUser } from 'src/app/types/user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'  
})
export class AuthService {
  userData: any;

  constructor(
    private afa: AngularFireAuth,
    private afs: AngularFirestore,
    public router: Router,
    ) {
    // the state will only persist in the current session or tab, and will be cleared when the tab or window in which the user authenticated is closed
    this.afa.setPersistence("session")

    this.afa.authState.subscribe(user => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user') as any);
      } else {
        localStorage.setItem('user', null as any);
        JSON.parse(localStorage.getItem('user')as any);
      }
    })

   }

  async login(email: string, password: string){
    return await this.afa.signInWithEmailAndPassword(email,password);
  }

  
  logout(){
    return this.afa.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['']);
    })
  }

  async signUp(email: string, password: string){
    // create a user in firebase auth and add it to our firestore 
    // note that auth and firestore are 2 differente things 
    this.afa.createUserWithEmailAndPassword(email,password).then( result=>{
        const user: signinUser= {
          email,
          password,
          uid: result.user?.uid
        };

        this.addtoFireStore(user);
    });
  }
  addtoFireStore(user:signinUser){
    // pass uid to prevent firestore to generate random id
    const ref: AngularFirestoreDocument<signinUser>=this.afs.doc(`users/${user.uid}`);
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

  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem('user') as any);
    return (user !== null) ? true : false;
  }

}
