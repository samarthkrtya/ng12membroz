import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './dailydigest-integration-routing';
import { DailydigestIntegrationComponent } from './dailydigest-integration.component';

import { DynamicSubListModule } from '../../../../shared/dynamic-sublist/dynamic-sublist.module';
import { DailyconfigComponent } from './dailyconfig/dailyconfig.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    DynamicSubListModule
  ],
  declarations: [
    DailydigestIntegrationComponent,
  ],
})
export class DailydigestIntegrationModule { }
