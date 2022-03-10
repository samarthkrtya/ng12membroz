import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FinanceModuleRoutes } from './finance-module-routing';
import { FinanceModuleComponent } from './finance-module.component';
import { BalanceSheetComponent } from './components/balance-sheet/balance-sheet.component';
import { ProfitLossComponent } from './components/profit-loss/profit-loss.component';
import { CashFlowComponent } from './components/cash-flow/cash-flow.component';
import { FinanceService } from 'src/app/core/services/finance/finance.service';
import { AppMaterialModule } from 'src/app/app-material/app-material.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(FinanceModuleRoutes),
    AppMaterialModule,
  ],
  declarations: [
    FinanceModuleComponent,
    BalanceSheetComponent,
    ProfitLossComponent,
    CashFlowComponent
  ],
  providers: [
    FinanceService,
  ],
})
export class FinanceModuleModule { } 
