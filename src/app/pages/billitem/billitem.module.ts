import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { BillitemRoutes } from './billitem-routing';
import { BillitemComponent } from './billitem.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(BillitemRoutes),
  ],
  declarations: [
    BillitemComponent,
  ],
})
export class BillitemModule { }
