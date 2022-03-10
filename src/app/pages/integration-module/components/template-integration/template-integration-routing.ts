import { Routes, RouterModule } from '@angular/router';
import { TemplateIntegrationComponent } from './template-integration.component';

const routes: Routes = [
  { path: '', component: TemplateIntegrationComponent },
];
export const routing = RouterModule.forChild(routes);