import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ViewBillBtnComponent } from './viewbillbtn.component';
import { AppMaterialModule } from '../../../app-material/app-material.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    AppMaterialModule
  ],
  declarations: [
    ViewBillBtnComponent
  ],
  exports:[
    ViewBillBtnComponent
  ]
})
export class ViewBillBtnModule { }
