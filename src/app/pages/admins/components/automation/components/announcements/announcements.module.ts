import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AnnouncementsComponent } from './announcements.component';
import { RouterModule } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { AnnouncementsRoutes } from './announcements.routing';
import { routing } from './announcements.routing';
import {MatTabsModule} from '@angular/material/tabs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { UsersService } from 'src/app/core/services/users/users.service';
import { TemplateService } from 'src/app/core/services/template/template.service';
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CloudinaryModule, CloudinaryConfiguration } from '@cloudinary/angular-5.x';
import { config } from '../../../../../../config';
import { MemberService } from 'src/app/core/services/member/member.service';
import { DynamicOperationModule } from '../../../../../../shared/dynamic-operation/dynamic-operation.module';
import { MembershipService } from 'src/app/core/services/membership/membership.service';
import { FormsService } from '../../../../../../core/services/forms/forms.service';


const cloudinaryLib = {
    Cloudinary: Cloudinary
};
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        routing,
        FileUploadModule,
        MatTabsModule,
        MatExpansionModule,
        AppMaterialModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        AngularEditorModule,
       CloudinaryModule.forRoot(cloudinaryLib,config),
        //CloudinaryModule.forRoot({Cloudinary}, { cloud_name: 'xxxxxx' } as CloudinaryConfiguration),
        FileUploadModule,
        DynamicOperationModule


    ],
    declarations: [AnnouncementsComponent
        
    ],
    providers: [
        UsersService,
        TemplateService,
        MemberService,
        MembershipService,
        FormsService
    ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]

})

export class AnnouncementsModule { }

