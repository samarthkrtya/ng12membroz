import { Routes, RouterModule } from '@angular/router';
import { MyAccountComponent } from './myaccount.component';

const routes: Routes = [
  { path: "", component: MyAccountComponent },
  {
    path: "my-accountdetail",
    loadChildren: () => import("./myaccountdetail/myaccountdetail.module").then(a=>a.MyAccountDetailModule),
  },
];
export const routing = RouterModule.forChild(routes);