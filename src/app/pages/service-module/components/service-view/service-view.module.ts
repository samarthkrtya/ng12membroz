import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { routing } from './service-view-routing';
import { ServiceViewComponent } from './service-view.component';
import { AppMaterialModule } from "../../../../app-material/app-material.module";
import { ItemListModule } from '../../../../shared/item-list/item-list.module';
import { ServiceBasicDetailsComponent } from './components/service-basic-details/service-basic-details.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { ServiceProductComponent } from './components/service-products/service-products.component';
import { ServiceAssetComponent } from './components/service-asset/service-asset.component';
import { TreeChecklistModule } from 'src/app/shared/tree-checklist/tree-checklist.module';
import { ServiceRoomsComponent } from './components/service-rooms/service-rooms.component';
import { ServiceStaffComponent } from './components/service-staff/service-staff.component';

@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    ItemListModule,
    SharedModule,
    TreeChecklistModule,
    routing,
  ],
  declarations: [
    ServiceViewComponent,
    ServiceBasicDetailsComponent,
    ServiceProductComponent,
    ServiceAssetComponent,
    ServiceRoomsComponent,
    ServiceStaffComponent
  ],
})
export class ServiceViewModule { }
