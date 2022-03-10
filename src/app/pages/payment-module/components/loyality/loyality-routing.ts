import { Routes, RouterModule } from '@angular/router';
import { LoyalityComponent } from './loyality.component';

const routes: Routes = [
  { path: '', component: LoyalityComponent },
  { path: ':id', component: LoyalityComponent },
];
export const routing = RouterModule.forChild(routes);