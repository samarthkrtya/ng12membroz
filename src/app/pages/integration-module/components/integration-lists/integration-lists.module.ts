import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './integration-lists-routing';
import { IntegrationListsComponent } from './integration-lists.component';
import { FormdataService } from '../../../../core/services/formdata/formdata.service';
import { FormsService } from '../../../../core/services/forms/forms.service';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    routing,
    
  ],
  declarations: [
    IntegrationListsComponent,
  ],
  providers: [
    FormdataService,
    FormsService
  ]

})
export class IntegrationListsModule { }
