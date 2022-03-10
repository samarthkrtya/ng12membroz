import { Routes, RouterModule } from '@angular/router';
import { ServiceComponent } from './service-form.component';


const routes: Routes = [
  { path: '', component: ServiceComponent },
  { path: ':id', component: ServiceComponent },
];

export const routing = RouterModule.forChild(routes);
