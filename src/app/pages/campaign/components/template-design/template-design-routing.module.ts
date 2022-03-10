import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateViewComponent } from './components/template-view/template-view.component';

import { ExampleComponent } from './template-design.component';

const routes: Routes = [
  // {path: ':id', component: ExampleComponent},
  { path: ':templateid/:id', component: ExampleComponent },
  { path: ':id', component: TemplateViewComponent },
  { path: 'editor/:id', component: ExampleComponent }


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ExampleRoutingModule { }
