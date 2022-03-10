import { NgModule } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomNotesComponent } from './custom-notes.component';
import { AddCustomNotesComponent } from './components/add-custom-notes/add-custom-notes.component';
import { ListsNotesComponent } from './components/lists-notes/lists-notes.component';

import { SharedModule } from '../shared.module';
import { AppMaterialModule } from '../../app-material/app-material.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    AppMaterialModule,
    SharedModule,
  ],
  declarations: [
    CustomNotesComponent,
    AddCustomNotesComponent,
    ListsNotesComponent
  ],
  exports: [
    AddCustomNotesComponent,
    ListsNotesComponent
  ],
  providers: [ 
  ]
})

export class CustomNotesModule { }