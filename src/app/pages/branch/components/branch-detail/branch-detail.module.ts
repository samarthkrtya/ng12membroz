import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './branch-detail-routing';
import { BranchDetailComponent } from './branch-detail.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { ItemListModule } from '../../../../shared/item-list/item-list.module'
import { SharedModule } from '../../../../shared/shared.module';

import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { BranchBasicDetailsComponent } from './branch-basic-details/branch-basic-details.component';
import { BranchUsersComponent } from './branch-users/branch-users.component';
import { DynamicFormdataViewModule } from '../../../../shared/dynamic-formdata-view/dynamic-formdata-view.module';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { TimesheetComponent } from './timesheet/timesheet.component';
import { SharedDocumentComponent } from './shared-document/shared-document.component';


import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { CommonService } from '../../../../core/services/common/common.service';
import { FormsService } from '../../../../core/services/forms/forms.service';

const cloudinaryLib = {
  Cloudinary: Cloudinary
};

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    AppMaterialModule,
    ItemListModule,
    SharedModule,
    MatSlideToggleModule,
    DynamicFormdataViewModule,
    FileUploadModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
  ],
  declarations: [
    BranchDetailComponent,
    BranchBasicDetailsComponent,
    BranchUsersComponent,
    LeaveRequestComponent,
    TimesheetComponent,
    SharedDocumentComponent,
  ],
  providers : [
    {
      provide: MAT_DATE_LOCALE,
      deps: [CommonService],
      useFactory: ($locale: CommonService) => $locale.currentLocale()
    },
    FormsService
  ]
})
export class BranchDetailModule { }
