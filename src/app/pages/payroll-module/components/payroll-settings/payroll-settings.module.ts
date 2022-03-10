import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe} from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './payroll-settings-routing';
import { PayrollSettingsComponent } from './payroll-settings.component';

import { AppMaterialModule } from '../../../../app-material/app-material.module';
import { SharedModule } from '../../../../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    routing,    
    SharedModule
  ],
  declarations: [
   PayrollSettingsComponent,
  ],
  providers: [
    CurrencyPipe
  ]

})
export class PayrollSettingsComponentModule { }


