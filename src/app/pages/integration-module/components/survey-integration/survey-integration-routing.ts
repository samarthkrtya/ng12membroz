import { Routes, RouterModule } from '@angular/router';
import { SurveyIntegrationComponent } from './survey-integration.component';

const routes: Routes = [
  { 
    path: '', component: SurveyIntegrationComponent,
  },
  {
     path: 'configuration',
    loadChildren: () => import('./configureformdetail/configureformdetail.module').then(m => m.ConfigurationModule), 
  }/* ,
   {
   path: 'configuration/:formid/:formdataid',
   loadChildren: () => import('./configureformdetail/configureformdetail.module').then(m => m.ConfigurationModule),  
   }, */
 
];

export const routing = RouterModule.forChild(routes);