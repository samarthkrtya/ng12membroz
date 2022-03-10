import { Routes, RouterModule } from '@angular/router';
import { BillingComponent } from './billing.component';
const routes: Routes = [

  { path: '', component: BillingComponent },
  { path: ':type/:id', component: BillingComponent },
  { path: ':type/:id/:pid', component: BillingComponent },
  { path: 'view/:schemaname/:type/:id', component: BillingComponent }

];
export const routing = RouterModule.forChild(routes);
