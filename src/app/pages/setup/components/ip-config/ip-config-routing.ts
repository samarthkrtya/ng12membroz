import { Routes, RouterModule } from '@angular/router';
import { IPConfigComponent } from './ip-config.component';

 
const routes: Routes = [
  { path: '', component: IPConfigComponent },
];

export const routing = RouterModule.forChild(routes);
