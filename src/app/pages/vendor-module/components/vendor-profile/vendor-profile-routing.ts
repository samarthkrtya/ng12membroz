import { Routes, RouterModule } from '@angular/router';
import { VendorProfileComponent } from './vendor-profile.component';

const routes: Routes = [
  { path: '', component: VendorProfileComponent },
  { path: ':id', component: VendorProfileComponent },
  { path: ':id/:formid', component: VendorProfileComponent },
];
export const routing = RouterModule.forChild(routes);