import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ContractDocumentListComponent } from './contract-document-list.component';


import { AppMaterialModule } from '../../app-material/app-material.module';

import { SharedModule } from '../shared.module';

import {
  NgxMatDatetimePickerModule, 
  NgxMatNativeDateModule, 
  NgxMatTimepickerModule 
} from '@angular-material-components/datetime-picker';


@NgModule({
  imports: [
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    SharedModule,
    NgxMatDatetimePickerModule,
    NgxMatNativeDateModule,
    NgxMatTimepickerModule
  ],
  declarations: [
    ContractDocumentListComponent, 
  ],
  exports: [
    ContractDocumentListComponent, 
],
  providers:[
  ]
})
export class ContractDocumentListModule { }

