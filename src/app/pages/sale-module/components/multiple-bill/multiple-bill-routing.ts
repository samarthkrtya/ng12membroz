import { Routes, RouterModule } from '@angular/router';
import { MultipleBillComponent } from './multiple-bill.component';
const routes: Routes = [

  { path: '', component: MultipleBillComponent },
  { path: ':mid', component: MultipleBillComponent },
  { path: ':formname/:billid', component: MultipleBillComponent },

];
export const routing = RouterModule.forChild(routes);