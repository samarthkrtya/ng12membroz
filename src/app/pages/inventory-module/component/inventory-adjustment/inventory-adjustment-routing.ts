import { Routes, RouterModule } from '@angular/router';
import { InventoryAdjustmentComponent } from './inventory-adjustment.component';

const routes: Routes = [
  { path: '', component: InventoryAdjustmentComponent },
  { path: ':id', component: InventoryAdjustmentComponent },
];
export const routing = RouterModule.forChild(routes);