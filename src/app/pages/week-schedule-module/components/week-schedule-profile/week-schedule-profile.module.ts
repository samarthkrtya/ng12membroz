import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './week-schedule-profile-routing';

import { WeekScheduleProfileComponent } from './week-schedule-profile.component';
import { WeekScheduleBasicDetailsComponent } from './components/week-schedule-basic-details/week-schedule-basic-details.component';
import { WeekScheduleTemplateComponent } from './components/week-schedule-template/week-schedule-template.component'

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module';

import { KeysPipe } from './keys.pipe';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  declarations: [
    WeekScheduleProfileComponent,
    WeekScheduleBasicDetailsComponent,
    WeekScheduleTemplateComponent,
    KeysPipe
  ],
  exports: [
    WeekScheduleBasicDetailsComponent,
    WeekScheduleTemplateComponent,
    KeysPipe
  ],
  providers: [
  ]
})
export class WeekScheduleProfileModule { }