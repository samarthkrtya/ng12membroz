import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './payroll-process-lists-routing';
import { PayrollProcessListsComponent } from './payroll-process-lists.component';

import { AppMaterialModule } from '../../../../../../app-material/app-material.module';
import { PayrollService } from 'src/app/core/services/payroll/payroll.service';
import { UsersService } from 'src/app/core/services/users/users.service';
import { MatSortModule } from '@angular/material/sort';
import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    MatSortModule,
    HttpClientModule,
    MatTableModule,
    CommonModule
  ],

  declarations: [
    PayrollProcessListsComponent
  ],
  providers: [
    UsersService,PayrollService
  ]

})
export class PayrollProcessListsModule { }