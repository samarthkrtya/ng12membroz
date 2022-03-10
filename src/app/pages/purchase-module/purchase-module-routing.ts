import { Routes } from '@angular/router';
import { PurchaseModuleComponent } from './purchase-module.component';

export const PurchaseModuleRoutes: Routes = [
  {
    path: '', component: PurchaseModuleComponent,
    children: [
      {
        path: 'purchase-order',
        loadChildren: () => import('./components/purchase-order/purchase-order.module').then(m => m.PurchaseOrderModule),
      },
      {
        path: 'purchase-request',
        loadChildren: () => import('./components/purchase-request/purchase-request.module').then(m => m.PurchaseRequestModule),
      },
      {
        path: 'purchase-invoice',
        loadChildren: () => import('./components/purchase-invoice/purchase-invoice.module').then(m => m.PurchaseInvoiceModule),
      },
      {
        path: 'expense',
        loadChildren: () => import('./components/expense/expense.module').then(m => m.ExpenseModule),
      },
      {
        path: 'challan',
        loadChildren: () => import('./components/challan/challan.module').then(m => m.ChallanModule),
      },
      {
        path: 'email-preview',
        loadChildren: () => import('./components/email-preview/email-preview.module').then(m => m.EmailPreviewModule),
      },
      {
        path: 'multiple-purchasepayment',
        loadChildren: () => import('./components/multiple-purchasepayment/multiple-purchasepayment.module').then(m => m.MultiplePurchasePaymentModule),
      },
      
      
    ]
  }
];