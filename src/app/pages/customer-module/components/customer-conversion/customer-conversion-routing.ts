import { Routes, RouterModule } from '@angular/router';
import { CustomerConversionComponent } from './customer-conversion.component';

const routes: Routes = [
  { path: '', component: CustomerConversionComponent },
  { path: ':id', component: CustomerConversionComponent },
  { path: ':id/:formid', component: CustomerConversionComponent },
];
export const routing = RouterModule.forChild(routes);