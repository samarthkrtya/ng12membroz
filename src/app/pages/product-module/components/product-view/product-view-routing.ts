import { Routes, RouterModule } from '@angular/router';
import { ProductViewComponent } from './product-view.component';

 
const routes: Routes = [
  { path: '', component: ProductViewComponent },
  { path: ':id', component: ProductViewComponent },
  { path: ':id/:formid', component: ProductViewComponent }
];

export const routing = RouterModule.forChild(routes);
