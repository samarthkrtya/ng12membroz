import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonDataService } from '../../../../core/services/common/common-data.service';
import { FinanceService } from '../../../../core/services/finance/finance.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-cash-flow',
  templateUrl: './cash-flow.component.html',
  styleUrls: ['./cash-flow.component.css']
})

export class CashFlowComponent extends BaseLiteComponemntComponent implements OnInit {

  isLoading: boolean = false;
  today = new Date();

  daterangepickermodel: any = {
    beginJsDate: '',
    endJsDate: ''
  };
  startdate: any;
  enddate: any;

  displayList: any[] = [];
  operatingIncome: any[] = [];
  InvestmentIncome: any[] = [];
  FinancingIncome: any[] = [];

  operatingIncometotal: number = 0;
  InvestmentIncometotal: number = 0;
  FinancingIncometotal: number = 0;
  netIncome: number = 0;

  constructor(
    private router: Router,
    private _financeaccountService: FinanceService,
    private _commonDataService: CommonDataService,
  ) {
    super();
    this.pagename = "cash-flow";
    this.daterangepickermodel.beginJsDate = new Date(this.today.getFullYear(), this.today.getMonth(), 1);
    this.daterangepickermodel.endJsDate = new Date(this.today.getFullYear(), this.today.getMonth() + 1, 0);

    this.startdate = this.daterangepickermodel.beginJsDate;
    this.enddate = this.daterangepickermodel.endJsDate;
  }

  async ngOnInit() {
    await super.ngOnInit();
    try {
      this.isLoading = true;
      await this.getData();
      this.setData();
      this.isLoading = false;
    } catch (e) {
      this.isLoading = false;
    }
  }

  async getData() {
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'daterange', "searchvalue": { "$gte": this.startdate, "$lte": this.enddate }, "datatype": 'date', "criteria": "eq" });

    this.displayList = [];
    var data = await this._financeaccountService.GetCashFlowStatement(postData) as [];
    this.displayList = data;
  }

  setData() {
    this.operatingIncome = [];
    this.InvestmentIncome = [];
    this.FinancingIncome = [];

    this.displayList.forEach(element => {
      if (element.cashflowhead == "OperatingIncome") {
        this.operatingIncome.push(element);
        this.operatingIncometotal += element.amount;
      } else if (element.cashflowhead == "InvestmentIncome") {
        this.InvestmentIncome.push(element);
        this.InvestmentIncometotal += element.amount;
      } else if (element.cashflowhead == "FinancingIncome") {
        this.FinancingIncome.push(element);
        this.FinancingIncometotal += element.amount;
      }
      this.netIncome = this.operatingIncometotal + this.InvestmentIncometotal + this.FinancingIncometotal;
    });
  }

  async dateRangeChange(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    if (dateRangeStart && dateRangeEnd && dateRangeStart.value && dateRangeEnd.value) {
      this.startdate = new Date(dateRangeStart.value);
      this.enddate = new Date(dateRangeEnd.value);
      this.isLoading = true;
      await this.getData();
      this.setData();
      this.isLoading = false;
    }
  }

  onSelectitem(item: any) {
    this._commonDataService.isfilterData = true;
    this._commonDataService.reportFromDate = this.startdate;
    this._commonDataService.reportToDate = this.enddate;
    this._commonDataService.reportParams = item._id;
    this.router.navigate(['/pages/dynamic-bireport/bireport-detail/5d5fa94abb707bb4874930fb']);
  }

}

