import { Routes, RouterModule } from '@angular/router';
import { CouponViewComponent } from './coupon-view.component';


const routes: Routes = [
  { path: '', component: CouponViewComponent },
  { path: ':id', component: CouponViewComponent },
  { path: ':id/:formid', component: CouponViewComponent },
];

export const routing = RouterModule.forChild(routes);
