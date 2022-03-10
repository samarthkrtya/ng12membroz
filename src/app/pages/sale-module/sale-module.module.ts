import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { SaleModuleRoutes } from './sale-module-routing';
import { SaleModuleComponent } from './sale-module.component';
import { ManageStockComponent } from './components/manage-stock/manage-stock.component';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from '../../app-material/app-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';




@NgModule({
  imports: [
    RouterModule.forChild(SaleModuleRoutes),
    CommonModule,
    AppMaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    SaleModuleComponent,
    ManageStockComponent,
  ]
})
export class SaleModuleModule { }


