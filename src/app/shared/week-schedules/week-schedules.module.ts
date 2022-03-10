import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { WeekSchedulesRoutingModule } from './week-schedules-routing';
import { WeekSchedulesComponent } from './week-schedules.component';

import { AppMaterialModule } from '../../app-material/app-material.module';

import { KeysPipe } from './keys.pipe';

@NgModule({
  
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    WeekSchedulesRoutingModule,
    AppMaterialModule
  ],
  declarations: [
    WeekSchedulesComponent, 
    KeysPipe,
  ],
  exports: [
    WeekSchedulesComponent,
    KeysPipe,
  ]
})
export class WeekSchedulesModule {
  static forRoot(): ModuleWithProviders<unknown> {
    return {
      ngModule: WeekSchedulesModule,
      providers: [
      ]
    };
  }
 }
