import { Routes } from '@angular/router';

import { FinanceModuleComponent } from './finance-module.component';
import { BalanceSheetComponent } from './components/balance-sheet/balance-sheet.component';
import { CashFlowComponent } from './components/cash-flow/cash-flow.component';
import { ProfitLossComponent } from './components/profit-loss/profit-loss.component';

export const FinanceModuleRoutes: Routes = [
  {
    path: '', component: FinanceModuleComponent,
    children: [
      { path: 'balance-sheet', component: BalanceSheetComponent },
      { path: 'cash-flow', component: CashFlowComponent },
      { path: 'profit-loss', component: ProfitLossComponent },
      {
        path: 'opening-balances',
        loadChildren: () => import('./components/opening-balances/opening-balances.module').then(m => m.OpeningBalancesModule),
      },

    ]
  }
];