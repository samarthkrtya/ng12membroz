import { Routes, RouterModule } from '@angular/router';
import { MakeEventComponent } from './make-event.component';
const routes: Routes = [

  { path: '', component: MakeEventComponent },
  { path: ':id', component: MakeEventComponent }
];
export const routing = RouterModule.forChild(routes);