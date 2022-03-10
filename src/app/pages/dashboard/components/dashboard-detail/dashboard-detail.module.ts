import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './dashboard-detail-routing';
import { DashboardDetailComponent } from './dashboard-detail.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { CommonService } from 'src/app/core/services/common/common.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
  ],
  declarations: [
    DashboardDetailComponent,
  ],
  providers: [  
    CommonService,
  ]
})
export class DashboardModule { }