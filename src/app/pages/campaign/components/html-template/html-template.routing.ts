import { Routes, RouterModule } from '@angular/router';
import { HtmlTemplateComponent } from './html-template.component';

const routes: Routes = [
  { path: '', component: HtmlTemplateComponent },
  { path: ':id', component: HtmlTemplateComponent },


];
export const routing = RouterModule.forChild(routes);