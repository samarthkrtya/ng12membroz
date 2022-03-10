import { Routes, RouterModule } from '@angular/router';
import { DailyconfigComponent } from './dailyconfig.component';

const routes: Routes = [
  { 
    path: '', component: DailyconfigComponent},
   { path: ':formid/:formdataid', component: DailyconfigComponent
 
  },
];

export const routing = RouterModule.forChild(routes);