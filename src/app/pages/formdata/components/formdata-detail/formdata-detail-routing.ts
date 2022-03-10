import { Routes, RouterModule } from '@angular/router';
import { FormdataDetailComponent } from './formdata-detail.component';


const routes: Routes = [
  { path: '', component: FormdataDetailComponent },
  { path: ':id', component: FormdataDetailComponent },
  { path: ':id/:formid', component: FormdataDetailComponent },
];
export const routing = RouterModule.forChild(routes);