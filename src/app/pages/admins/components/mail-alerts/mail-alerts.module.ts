import { AppMaterialModule } from 'src/app/app-material/app-material.module';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MailAlertsComponent } from './mail-alerts.component';
import { MailAlertsRoutes } from './mail-alerts-routing';
import { UsersService } from 'src/app/core/services/users/users.service';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatSelectModule} from '@angular/material/select';
import { FormComponent } from './form/form.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TemplateService } from 'src/app/core/services/template/template.service';
import { MailalertsService } from 'src/app/core/services/mailalerts/mailalerts.service';
import { CommunicationService } from 'src/app/core/services/communications/communications.service';
import { FileUploadModule } from 'ng2-file-upload';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';
import { config } from '../../../../config';


const cloudinaryLib = {
    Cloudinary: Cloudinary
};

@NgModule({
    imports: [
        CommonModule,
        RouterModule.forChild(MailAlertsRoutes),
        FormsModule,
        ReactiveFormsModule,
        AppMaterialModule,
        MatInputModule,
        MatButtonModule,
        MatFormFieldModule,
        MatSelectModule,
        CloudinaryModule.forRoot(cloudinaryLib, config),
        FileUploadModule

        
    
    
     
    ],

    exports:[ FormsModule,
        ReactiveFormsModule,

    ],
    declarations: [MailAlertsComponent
    ],
    providers:[UsersService,TemplateService,MailalertsService,CommunicationService
        ],
        schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class MailAlertsModule {}
