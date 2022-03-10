import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { routing } from './report-settings.routing';
import { ReportSettingsComponent } from './report-settings.component';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { ItemListModule } from 'src/app/shared/item-list/item-list.module';
import { ReportBasicDetailsComponent } from './report-basic-details/report-basic-details.component'; 


import { DragulaModule, DragulaService } from 'ng2-dragula';


import { DynamicOperationModule } from 'src/app/shared/dynamic-operation/dynamic-operation.module';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    DragulaModule,
    DynamicOperationModule
  ],
  declarations: [
    ReportSettingsComponent,
    ReportBasicDetailsComponent,
  ],
  exports:[
  ],
  providers: [
    DragulaService, 
  ]
})
export class ReportSettingsModule { }