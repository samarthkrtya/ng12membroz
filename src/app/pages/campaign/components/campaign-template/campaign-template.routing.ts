import { Routes, RouterModule } from '@angular/router';
import { CampaignTemplateComponent } from './campaign-template.component';

const routes: Routes = [
  { path: '', component: CampaignTemplateComponent },
  { path: ':id', component: CampaignTemplateComponent },
];
export const routing = RouterModule.forChild(routes);