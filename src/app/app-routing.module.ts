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

const routes: Routes = [
  { path: 'projectsTracking', component: ProjectsTrackingComponent },
  { path: 'needs', component: NeedsComponent },
  { path: 'home', component: HomepageComponent },
  { path: 'signup/:userType', component: SignupComponent },
  { path: 'signin', component: SigninComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'messages', component: MessagesComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'registereduser', component: RegisteredUsersComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
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
