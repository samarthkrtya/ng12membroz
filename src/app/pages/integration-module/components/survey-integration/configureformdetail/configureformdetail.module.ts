import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { routing } from './configureformdetail-routing';

import { ConfigureformdetailComponent } from './configureformdetail.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {MatRadioModule} from '@angular/material/radio';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatCheckboxModule} from '@angular/material/checkbox';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    MatFormFieldModule,
    MatInputModule ,
    MatSelectModule,
    MatRadioModule,
    MatDatepickerModule,
    MatCheckboxModule

    
  ],
  declarations: [
    ConfigureformdetailComponent
  ],
  providers: [
  ]

})
export class ConfigurationModule { }
