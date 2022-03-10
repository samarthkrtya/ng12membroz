import { Routes, RouterModule } from '@angular/router';
import { ProductFormComponent } from './product-form.component';

 
const routes: Routes = [
  { path: '', component: ProductFormComponent },
  { path: ':id', component: ProductFormComponent },
];

export const routing = RouterModule.forChild(routes);
