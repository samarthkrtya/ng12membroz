import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './invite-earn-routing';
import { InviteEarnComponent } from './invite-earn.component';
import { Cloudinary } from 'cloudinary-core';
import { CloudinaryModule } from '@cloudinary/angular-5.x';

const cloudinaryLib = { Cloudinary: Cloudinary };
import { AppMaterialModule } from '../../app-material/app-material.module';
import { config } from 'src/app/config';

@NgModule({
  imports: [
    CommonModule,
    routing,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    CloudinaryModule.forRoot(cloudinaryLib, config),
  ],
  declarations: [
    InviteEarnComponent,
  ],
  exports: [
  ],
  providers: [
  ]
})
export class InviteEarnModule { }

