import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './customer-notifications-routing';
import { CustomerNotificationsComponent } from './customer-notifications.component';

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
    CustomerNotificationsComponent
  ],
  providers: [
  ]

})
export class CustomerNotificationsModule { }
