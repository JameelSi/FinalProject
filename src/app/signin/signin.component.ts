import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  form: FormGroup;
  public loginInvalid = false;
  private formSubmitAttempt = false;
  private returnUrl: string;

  constructor(    
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService:AuthService,
    readonly snackBar: MatSnackBar,
    ) {

    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/game';

    this.form = this.fb.group({
      username: ['', Validators.email],
      password: ['', Validators.required]
    });

   }

  ngOnInit(): void {
  }

  async onSubmit(): Promise<void> {
    this.loginInvalid = false;
    this.formSubmitAttempt = false;
    if (this.form.valid) {
      try {
        const username = this.form.get('username')?.value;
        const password = this.form.get('password')?.value;
      } catch (err) {
        this.loginInvalid = true;
      }
    } else {
      this.formSubmitAttempt = true;
    }
  }

  fun(){
    if(this.form.valid){
      this.authService.login( this.form.get('username')?.value,this.form.get('password')?.value)
      .then(result =>{
        if(result)
          this.router.navigate([""]);
        else 
          this.snackBar.open("שם משתמש או סיסמה לא נכונים ", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });

      }).catch(err=>{
        this.snackBar.open("נא לנסות בזמן מאוחר יותר", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });

      })

  
    }
  }

}
