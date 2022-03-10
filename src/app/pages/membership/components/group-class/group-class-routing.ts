import { Routes, RouterModule } from '@angular/router';
import { Groupclass } from './group-class.component';

const routes: Routes = [
  { path: ':formname/:id', component: Groupclass },
];
export const routing = RouterModule.forChild(routes);