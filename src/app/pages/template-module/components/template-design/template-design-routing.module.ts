import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TemplateDesignComponent } from './template-design.component';

const routes: Routes = [
  {path: '', component: TemplateDesignComponent},
  { path: ':id', component: TemplateDesignComponent },
  { path: ':templateid/:id', component: TemplateDesignComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TemplateDesignRoutingModule { }
