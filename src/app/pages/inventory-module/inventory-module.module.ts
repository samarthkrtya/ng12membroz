import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { InventoryModuleRoutes } from './inventory-module-routing';
import { InventoryModuleComponent } from './inventory-module.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(InventoryModuleRoutes),
  ],
  declarations: [
    InventoryModuleComponent
  ],
})
export class InventoryModuleModule { }

