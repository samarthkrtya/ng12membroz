import { Routes, RouterModule } from '@angular/router';
import { ServiceViewComponent } from './service-view.component';


const routes: Routes = [
  { path: '', component: ServiceViewComponent },
  { path: ':id', component: ServiceViewComponent },
  { path: ':id/:formid', component: ServiceViewComponent },
];

export const routing = RouterModule.forChild(routes);
