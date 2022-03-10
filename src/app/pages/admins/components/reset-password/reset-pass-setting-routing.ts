import { Routes, RouterModule } from '@angular/router';
import { ResetPassSettingComponent } from './reset-pass-setting.component';


const routes: Routes = [
  { path: '', component: ResetPassSettingComponent },
];

export const routing = RouterModule.forChild(routes);
