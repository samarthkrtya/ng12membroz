import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './user-attendance-weeklycalendar-routing';
import { UserAttendanceTimeWeeklyComponent } from './user-attendance-weeklycalendar.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';

import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatOptionSelectAllModule } from 'src/app/shared/mat-option-select-all/mat-option-select-all.module';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { Utilities } from 'src/app/utilities/utilities';
import { SharedModule } from '../../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
     MatNativeDateModule,
     MatOptionSelectAllModule,
     SharedModule
  ],
  declarations: [
    UserAttendanceTimeWeeklyComponent
  ],
  providers: [
    DatePipe,
    PagerService,
    Utilities,
    { provide: MAT_DATE_LOCALE, useValue: 'en-GB' }
  ]

})
export class UserTimeAttendanceWeeklyComponentModule { }


