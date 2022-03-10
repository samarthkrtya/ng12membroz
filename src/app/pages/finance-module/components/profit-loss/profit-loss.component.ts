import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { CommonDataService } from '../../../../core/services/common/common-data.service';
import { FinanceService } from '../../../../core/services/finance/finance.service';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-profit-loss',
  templateUrl: './profit-loss.component.html',
  styleUrls: ['./profit-loss.component.css']
})

export class ProfitLossComponent extends BaseLiteComponemntComponent implements OnInit {

  isLoading: boolean = false;
  today = new Date();

  daterangepickermodel: any = {
    beginJsDate: '',
    endJsDate: ''
  };
  startdate: any;
  enddate: any;

  displayList: any[] = [];
  sortdisplayList: any[] = [];

  incomeList: any[] = [];
  expenseList: any[] = [];
  otherexpenseList: any[] = [];
  cogsList: any[] = [];

  totalIncome: number = 0;
  totalExpense: number = 0;
  totalotherExpense: number = 0;
  cogsExpense: number = 0;

  grossincome: number = 0;
  oprincome: number = 0;
  netprofit: number = 0;

  constructor(
    private router: Router,
    private _financeaccountService: FinanceService,
    private _commonDataService: CommonDataService,
  ) {

    super();
    this.pagename = 'profit-loss';
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

  async getData() {
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'daterange', "searchvalue": { "$gte": this.startdate, "$lte": this.enddate }, "datatype": 'date', "criteria": "eq" });

    var data = await this._financeaccountService.GetProfitandloss(postData) as [];
    this.displayList = data;
  }

  setData() {
    this.expenseList = [];
    this.sortdisplayList = this.groupBy(this.displayList, 'accounttype');
    this.sortdisplayList.forEach(element => {
      if (element[0].accounttype == "Income") {
        this.incomeList = element;
      }
      if (element[0].accounttype == "Cost Of Goods Sold") {
        this.cogsList = element;
      }
      if (element[0].accounttype == "Other Expense" || element[0].accounttype == "Other Income") {
        this.otherexpenseList = element;
      }
      if (element[0].accounttype != "Income" && element[0].accounttype != "Cost Of Goods Sold" && element[0].accounttype != "Other Expense" && element[0].accounttype != "Other Income") {
        element.forEach(ele => {
          this.expenseList.push(ele);
        });
      }
    });

    if (this.incomeList && this.incomeList.length != 0) {
      this.incomeList.forEach(element => {
        this.totalIncome += element.amount;
      });
    }

    if (this.cogsList && this.cogsList.length != 0) {
      this.cogsList.forEach(element => {
        this.cogsExpense += element.amount;
      });
    }

    if (this.expenseList && this.expenseList.length != 0) {
      this.expenseList.forEach(element => {
        this.totalExpense += element.amount;
      });
    }

    if (this.otherexpenseList && this.otherexpenseList.length != 0) {
      this.otherexpenseList.forEach(element => {
        this.totalotherExpense += element.amount;
      });
    }

    this.grossincome = Math.abs(this.totalIncome) - Math.abs(this.cogsExpense);
    this.oprincome = Math.abs(this.grossincome) - Math.abs(this.totalExpense);
    this.netprofit = Math.abs(this.oprincome) - Math.abs(this.totalotherExpense);
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index, values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

  onSelectitem(item: any) {
    this._commonDataService.isfilterData = true;
    this._commonDataService.reportFromDate = this.startdate;
    this._commonDataService.reportToDate = this.enddate;
    this._commonDataService.reportParams = item._id;
    this.router.navigate(['/pages/dynamic-bireport/bireport-detail/5d5fa94abb707bb4874930fb']);
  }

}

