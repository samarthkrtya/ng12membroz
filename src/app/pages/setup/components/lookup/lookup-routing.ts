import { Routes, RouterModule } from '@angular/router';
import { LookupComponent } from './lookup.component';

 
const routes: Routes = [
  { path: ':id', component: LookupComponent },
];

export const routing = RouterModule.forChild(routes);
