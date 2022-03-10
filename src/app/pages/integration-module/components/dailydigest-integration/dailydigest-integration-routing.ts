import { Routes, RouterModule } from '@angular/router';
import { DailydigestIntegrationComponent } from './dailydigest-integration.component';

const routes: Routes = [
  { path: '', component: DailydigestIntegrationComponent
 },
 {
  path: 'dailyconfig',
  loadChildren: () => import('./dailyconfig/dailyconfig.module').then(m => m.DailyconfigModule), 

 }
];
export const routing = RouterModule.forChild(routes);


