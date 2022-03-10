import { Routes, RouterModule } from '@angular/router';
import { MenublocklistComponent } from './menublocklist.component';

const routes: Routes = [
  { path: '', component: MenublocklistComponent },
  { path: ':mname', component: MenublocklistComponent },
];

export const routing = RouterModule.forChild(routes);