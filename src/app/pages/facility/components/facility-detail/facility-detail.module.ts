import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './facility-detail-routing';
import { FacilityDetailComponent } from './facility-detail.component';

import { ItemListModule } from '../../../../shared/item-list/item-list.module'

import { DynamicAutocompleteModule } from '../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { DynamicFormdataViewModule } from '../../../../shared/dynamic-formdata-view/dynamic-formdata-view.module';
import { DynamicDispositiondataModule } from '../../../../shared/dynamic-dispositiondata/dynamic-dispositiondata.module';
import { ContactsActivitiesModule } from '../../../../shared/contacts-activities/contacts-activities.module';

import { CommonService } from '../../../../core/services/common/common.service';
import { SharedModule } from '../../../../shared/shared.module';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { FacilityBasicDetailsComponent } from './facility-basic-details/facility-basic-details.component';
import { OwnershipsComponent } from './ownerships/ownerships.component';
import { MaintananceContractComponent } from './maintanance-contract/maintanance-contract.component';
import { AssetService } from 'src/app/core/services/service/asset.service';



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
    FacilityDetailComponent,
    FacilityBasicDetailsComponent,
    OwnershipsComponent,
    MaintananceContractComponent,
   
  ],
  exports: [
   
  ],
  providers: [
    CommonService,
    CurrencyPipe,
    AssetService
  ]
})
export class FacilityDetailModule { }
