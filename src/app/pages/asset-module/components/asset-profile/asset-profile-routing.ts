import { Routes, RouterModule } from '@angular/router';
import { AssetProfileComponent } from './asset-profile.component';

const routes: Routes = [
  { path: '', component: AssetProfileComponent },
  { path: ':id', component: AssetProfileComponent },
  { path: ':formid/:id', component: AssetProfileComponent },
];
export const routing = RouterModule.forChild(routes);