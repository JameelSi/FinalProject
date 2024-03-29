import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProjectsTrackingComponent } from './projects-tracking/projects-tracking.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire'
import { AngularFirestoreModule } from '@angular/fire/firestore'
import { environment } from 'src/environments/environment';
import { MatStepperModule} from '@angular/material/stepper';
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DialogBoxComponent } from './dialog-box/dialog-box.component';
import { FormsModule } from '@angular/forms';
import { NeedsComponent } from './needs/needs.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCardModule } from '@angular/material/card';
import { MatSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { OverlayModule } from '@angular/cdk/overlay';
import {MatSelectModule} from '@angular/material/select';
import {TabMenuModule} from 'primeng/tabmenu';
import { HomepageComponent } from './homepage/homepage.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {ScrollingModule} from '@angular/cdk/scrolling';
import { SignupComponent } from './signup/signup.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatCheckboxModule} from '@angular/material/checkbox';
import { SigninComponent } from './signin/signin.component';
import {AngularFireAuthModule} from '@angular/fire/auth'
import { MatRadioModule } from '@angular/material/radio';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { CarouselModule } from 'primeng/carousel';
import {ButtonModule} from 'primeng/button';
import { SettingsComponent } from './settings/settings.component';
import { MessagesComponent } from './messages/messages.component';
import { ProfileComponent } from './profile/profile.component';
import { RegisteredUsersComponent } from './registered-users/registered-users.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { PrettyPrintPipe } from './prettyPrint/pretty-print.pipe';
import { TasksComponent } from './tasks/tasks.component';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SmsComponent } from './sms/sms.component';
import {InplaceModule} from 'primeng/inplace';
import { EditableComponent } from './editable/editable.component';
import { ViewModeDirective } from './directives/viewMode';
import { EditModeDirective } from './directives/editMode';
import { MAT_DATE_LOCALE } from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    ProjectsTrackingComponent,
    DialogBoxComponent,
    NeedsComponent,
    HomepageComponent,
    ToolbarComponent,
    SignupComponent,
    SigninComponent,
    SettingsComponent,
    MessagesComponent,
    PageNotFoundComponent,
    ContactUsComponent,
    PrettyPrintPipe,
    ProfileComponent,
    RegisteredUsersComponent,
    TasksComponent,
    SmsComponent,
    ViewModeDirective,
    EditModeDirective,
    EditableComponent,
    ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatExpansionModule,
    MatTabsModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatFormFieldModule,
    FormsModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatMomentDateModule,
    MatCardModule,
    MatProgressSpinnerModule,
    OverlayModule,
    MatChipsModule,
    MatMenuModule,
    TabMenuModule,
    MatStepperModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatCheckboxModule,
    AngularFireAuthModule,
    MatRadioModule,
    CarouselModule,
    FlexLayoutModule,
    ScrollingModule,
    ButtonModule,
    AngularFireStorageModule,
    MatProgressBarModule,
    MatTooltipModule,
    InplaceModule,
  ],
  providers: [ScrollDispatcher,
      {provide: MAT_DATE_LOCALE, useValue: 'en-GB'},],
  bootstrap: [AppComponent],
  entryComponents: [ MatSpinner ]
})
export class AppModule { }
