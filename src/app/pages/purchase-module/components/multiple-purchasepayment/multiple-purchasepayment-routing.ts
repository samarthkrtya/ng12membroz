import { Routes, RouterModule } from '@angular/router';
import {  MultiplePurchasePaymentComponent } from './multiple-purchasepayment.component';
const routes: Routes = [

  { path: '', component: MultiplePurchasePaymentComponent },
  { path: ':pivid', component: MultiplePurchasePaymentComponent },
  { path: ':vendor/:vid', component: MultiplePurchasePaymentComponent },
];
export const routing = RouterModule.forChild(routes);