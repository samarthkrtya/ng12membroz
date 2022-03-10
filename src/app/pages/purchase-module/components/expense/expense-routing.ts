import { Routes, RouterModule } from '@angular/router';
import { ExpenseComponent } from './expense.component';

 
const routes: Routes = [
  { path: '', component: ExpenseComponent },
  { path: ':id', component: ExpenseComponent },
  { path: ':formid/:id', component: ExpenseComponent }
];

export const routing = RouterModule.forChild(routes);
