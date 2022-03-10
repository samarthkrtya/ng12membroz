import { Routes, RouterModule } from '@angular/router';
import { AssetComponent } from './asset-form.component';


const routes: Routes = [
  { path: '', component: AssetComponent },
  { path: ':id', component: AssetComponent },
];

export const routing = RouterModule.forChild(routes);
