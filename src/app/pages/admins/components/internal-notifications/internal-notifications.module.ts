import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './internal-notifications-routing';
import { InternalNotificationsComponent } from './internal-notifications.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,
    AppMaterialModule,
  ],
  declarations: [
    InternalNotificationsComponent
  ],
  providers: [
  ]

})
export class InternalNotificationsModule { }
