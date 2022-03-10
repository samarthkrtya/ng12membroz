import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './user-attendance-routing';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { UserAttendanceComponent } from './user-attendance.component';
import { UsersService } from 'src/app/core/services/users/users.service';
import { PagerService } from 'src/app/core/services/common/pager.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { Utilities } from 'src/app/utilities/utilities';
import { MatOptionSelectAllModule } from 'src/app/shared/mat-option-select-all/mat-option-select-all.module';
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
    SharedModule,
  ],
  declarations: [
   UserAttendanceComponent,
  ],
  providers: [
    UsersService,
    PagerService,
    Utilities,
    DatePipe
  ]

})
export class UserAttendanceComponentModule { }


