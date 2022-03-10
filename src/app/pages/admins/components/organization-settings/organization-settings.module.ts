
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { OrganizationSettingsComponent } from './organization-settings.component';
import { OrganizationSettingsRoutes } from './organization-settings.routing';
import { BranchesService } from '../../../../core/services/branches/branch.service';

import {FileUploadModule} from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from './../../../../config';

import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { DynamicAutocompleteModule } from './../../../../shared/dynamic-autocomplete/dynamic-autocomplete.module';


const cloudinaryLib = {
    Cloudinary: Cloudinary
};

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(OrganizationSettingsRoutes),
        CloudinaryModule.forRoot(cloudinaryLib, config),
        FormsModule,
        ReactiveFormsModule,
        FileUploadModule,
        AppMaterialModule,
        DynamicAutocompleteModule
    ],
    declarations: [
        OrganizationSettingsComponent
    ],
    providers:[
        CurrencyPipe,
        DatePipe,
        TitleCasePipe,
        BranchesService,
    ]
})

export class OrganizationSettingsModule {}
