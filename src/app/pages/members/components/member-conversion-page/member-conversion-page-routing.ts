import { Routes, RouterModule } from '@angular/router';
import { MemberConversionPageComponent } from './member-conversion-page.component';

const routes: Routes = [
  { path: '', component: MemberConversionPageComponent },
  { path: ':id', component: MemberConversionPageComponent },
  { path: ':id/:formid', component: MemberConversionPageComponent },
];
export const routing = RouterModule.forChild(routes);