import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { NeedsComponent } from './needs/needs.component';
import { ProjectsTrackingComponent } from './projects-tracking/projects-tracking.component';
import { SignupComponent } from './signup/signup.component';
import { SigninComponent } from './signin/signin.component';
import { SettingsComponent } from './settings/settings.component';
import { MessagesComponent } from './messages/messages.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisteredUsersComponent } from './registered-users/registered-users.component';
import { AuthGuard } from './guards/auth.guard';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { TasksComponent } from './tasks/tasks.component';
import { LoggedInGuard } from './guards/logged-in.guard';

// AuthGuard -> admins
// LoggedInGuard -> any logged in user

const routes: Routes = [
  { path: 'projectsTracking', component: ProjectsTrackingComponent, canActivate: [AuthGuard]},
  { path: 'needs', component: NeedsComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'signup/:userType', component: SignupComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard]},
  { path: 'messages', component: MessagesComponent, canActivate: [AuthGuard]},
  { path: 'contactus', component: ContactUsComponent},  
  { path: 'profile', component: ProfileComponent, canActivate: [LoggedInGuard] },
  { path: 'registereduser', component: RegisteredUsersComponent, canActivate: [AuthGuard]},
  { path: 'tasks', component: TasksComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: PageNotFoundComponent },
];

const routerOptions: ExtraOptions = {
  anchorScrolling: 'enabled',
  // onSameUrlNavigation: 'reload', 
  // scrollPositionRestoration: 'enabled',
  // scrollOffset: [0, 64],
  // ...any other options you'd like to use
};

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
