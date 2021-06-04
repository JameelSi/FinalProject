import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogBoxComponent } from '../dialog-box/dialog-box.component';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.scss']
})
export class SigninComponent implements OnInit {
  loginForm!: FormGroup;
  loading:boolean = false;
  loginInvalid:boolean  = false;

  constructor(    
    private fb: FormBuilder,
    private router: Router,
    private authService:AuthService,
    public dialog: MatDialog,
    readonly snackBar: MatSnackBar,

    ) {
      
    }
    
    ngOnInit(): void {
      this.loginForm = this.fb.group({
        username: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
      });
  }

  onSubmit() {

    if (this.loginForm.invalid) {
        return;
    }

    this.loading = true;
    this.authService.login(this.loginForm.controls.username.value, this.loginForm.controls.password.value)
    .then(result =>{
      if(result!=null)
        this.router.navigate([""]);
      else 
        this.loginInvalid=true;

    }).catch(err=>{
      this.loading = false;
      this.loginInvalid=true;
    })

}

getEmailErrorMessage() {
  if (this.loginForm.controls.username.hasError('required')) {
    return 'שדה חובה';
  }
  return this.loginForm.controls.username.hasError('email') ? 'כתבובת מייל אינה בפורמט נכון' : '';
}
resetPass(element: any){
  element.title="נא להכניס את כתובת המייל אליו יישלח לינק איפוס סיסמה"
  element.dialogType = 'needs';
  element.action="Add";
  const dialogRef = this.dialog.open(DialogBoxComponent, {
    width: '25%',
    direction: 'rtl',
    data: element,
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result&&result.data?.name) {
      if(this.authService.reset(result.data.name))
        this.snackBar.open("מייל נשלח בהצלחה ! נא לבדוק", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
      else
        this.snackBar.open("לא קיים מייל כמו שהוכנס", '', { duration: 3000, direction: 'rtl', panelClass: ['snacks'] });
    }

    });

}

}

