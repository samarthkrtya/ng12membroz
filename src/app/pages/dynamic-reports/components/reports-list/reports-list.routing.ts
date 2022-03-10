import { Routes, RouterModule } from '@angular/router';
import { ReportsListComponent } from './reports-list.component';

const routes: Routes = [
  { path: '', component: ReportsListComponent }, 
];

export const routing = RouterModule.forChild(routes);