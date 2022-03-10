import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminsComponent } from './admins.component';
import { AdminsRoutes } from './admins.routing';
import { FormComponent } from './components/mail-alerts/form/form.component';
import {MatSelectModule} from '@angular/material/select';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { FileUploadModule } from "ng2-file-upload";
import { AutomationComponent } from './components/automation/automation.component';
import { OrganizationSettingsComponent } from './components/organization-settings/organization-settings.component';
import { AdminBookingComponent } from './components/admin-booking/admin-booking.component';
import { SeasonCalendarComponent } from './components/admin-booking/components/season-calendar/season-calendar.component';  

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminsRoutes),
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        AngularEditorModule,
        FileUploadModule, 
    ],
    declarations: [
        AdminsComponent,
        FormComponent,
    ],

})

export class AdminsModule {}
