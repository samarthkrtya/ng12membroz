import { Routes, RouterModule } from '@angular/router';
import { HtmlEditorComponent } from './html-editor.component';

const routes: Routes = [
  { path: '', component: HtmlEditorComponent },
  { path: ':id', component: HtmlEditorComponent },
  { path: ':templateid/:id', component: HtmlEditorComponent },
];
export const routing = RouterModule.forChild(routes);