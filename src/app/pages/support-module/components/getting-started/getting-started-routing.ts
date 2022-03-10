import { Routes, RouterModule } from '@angular/router';
import { GettingStartedComponent } from './getting-started.component';


const routes: Routes = [
  { path: '', component: GettingStartedComponent },
  { path: ':id', component: GettingStartedComponent },
];

export const routing = RouterModule.forChild(routes);
