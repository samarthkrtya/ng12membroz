import { Routes, RouterModule } from '@angular/router';
import { MyprofileComponent } from './myprofile.component';

const routes: Routes = [
  { path: '', component: MyprofileComponent },
  { path: ':formname', component: MyprofileComponent },
  { path: ':formname/:id', component: MyprofileComponent },
];
export const routing = RouterModule.forChild(routes);