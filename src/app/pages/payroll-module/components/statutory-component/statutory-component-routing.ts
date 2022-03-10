import { Routes, RouterModule } from '@angular/router';
import { StatutoryComponentComponent } from './statutory-component.component';

const routes: Routes = [
  { path: '', component: StatutoryComponentComponent },
  { path: ':id', component: StatutoryComponentComponent },
];
export const routing = RouterModule.forChild(routes);