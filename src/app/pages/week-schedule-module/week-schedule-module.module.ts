import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { WeekScheduleModulesRoutes } from './week-schedule-module-routing';
import { WeekScheduleModuleComponent } from './week-schedule-module.component';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(WeekScheduleModulesRoutes),
  ],
  declarations: [
    WeekScheduleModuleComponent,
  ],
})
export class WeekScheduleModuleModule { }