import { Routes, RouterModule } from '@angular/router';
import { CancellationPolicyComponent } from './cancellation-policy.component';


const routes: Routes = [
  { path: '', component: CancellationPolicyComponent },
  { path: ':id', component: CancellationPolicyComponent },
];

export const routing = RouterModule.forChild(routes);
