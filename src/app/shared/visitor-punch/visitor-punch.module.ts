import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VisitorPunchRoutingModule } from './visitor-punch-routing';
import { VisitorPunchComponent } from './visitor-punch.component';

import { CheckinComponent } from './components/checkin/checkin.component';
import { CheckinOtpComponent } from './components/checkin-otp/checkin-otp.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    VisitorPunchRoutingModule,
    AppMaterialModule
  ],
  declarations: [
    VisitorPunchComponent, 
    CheckinComponent, 
    CheckinOtpComponent
  ],
  exports: [
    CheckinComponent, 
    CheckinOtpComponent
  ]
})
export class VisitorPunchModule {
  static forRoot(): ModuleWithProviders<unknown> {
    return {
      ngModule: VisitorPunchModule,
      providers: [
      ]
    };
  }
 }
