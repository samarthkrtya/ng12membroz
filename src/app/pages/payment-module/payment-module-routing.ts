import { Routes } from '@angular/router';
import { PaymentModuleComponent } from './payment-module.component';

export const PaymentModuleRoutes: Routes = [
  {
    path: '', component: PaymentModuleComponent,
    children: [
      {
        path: 'make-payment',
        loadChildren: () => import('./components/make-payment/make-payment.module').then(m => m.MakePaymentModule),
      },
      {
        path: 'multiple-payment',
        loadChildren: () => import('./components/multiple-payment/multiple-payment.module').then(m => m.MultiplePaymentModule),
      },
      {
        path: 'cash-back',
        loadChildren: () => import('./components/cash-back/cash-back.module').then(m => m.CashbackModule),
      },
      {
        path: 'creditdebit-note',
        loadChildren: () => import('./components/creditdebit-note/creditdebit-note.module').then(m => m.CreditdebitNoteModule),
      },
      {
        path: 'refund',
        loadChildren: () => import('./components/refund/refund.module').then(m => m.RefundModule),
      },
      {
        path: 'edit-paymentschedule',
        loadChildren: () => import('./components/edit-paymentschedule/edit-paymentschedule.module').then(m => m.EditPaymentScheduleModule),
      },
      {
        path: 'loyality',
        loadChildren: () => import('./components/loyality/loyality.module').then(m => m.LoyalityModule),
      },
      {
        path: 'coupon-view',
        loadChildren: () => import('./components/coupon-view/coupon-view.module').then(m => m.CouponViewModule),
      },


    ]
  }
];