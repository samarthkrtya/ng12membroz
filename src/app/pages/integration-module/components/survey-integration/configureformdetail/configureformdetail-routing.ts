import { Routes, RouterModule } from '@angular/router';
import { ConfigureformdetailComponent } from './configureformdetail.component';

const routes: Routes = [
  { 
    path: '', component: ConfigureformdetailComponent},
   { path: ':formid/:formdataid', component: ConfigureformdetailComponent
 
  },
];

export const routing = RouterModule.forChild(routes);