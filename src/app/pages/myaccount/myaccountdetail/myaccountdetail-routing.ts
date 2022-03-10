import { Routes, RouterModule } from '@angular/router';
import { MyAccountDetailComponent } from './myaccountdetail.component';

const routes: Routes = [
  { path: '', component: MyAccountDetailComponent },
];
export const routing = RouterModule.forChild(routes);