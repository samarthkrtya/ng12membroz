
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from './../../../../config';

import { AdminSettingsComponent } from './admin-settings.component';
import { AdminSettingsRoutes } from './admin-settings.routing';
import { BranchesService } from '../../../../core/services/branches/branch.service';
import { AppMaterialModule } from './../../../../app-material/app-material.module';
import { DynamicAutocompleteModule } from './../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';
import { DynamicPropertyFieldsModule } from './../../../../shared/dynamic-property-fields/dynamic-property-fields.module';

const cloudinaryLib = {
    Cloudinary: Cloudinary
};

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(AdminSettingsRoutes),
        CloudinaryModule.forRoot(cloudinaryLib, config),
        FormsModule,
        ReactiveFormsModule,
        FileUploadModule,
        AppMaterialModule,
        DynamicAutocompleteModule,
        DynamicPropertyFieldsModule
    ],
    declarations: [
        AdminSettingsComponent
    ],
    providers:[
        CurrencyPipe,
        DatePipe,
        TitleCasePipe,
        BranchesService,
    ]
})

export class AdminSettingsModule {}
