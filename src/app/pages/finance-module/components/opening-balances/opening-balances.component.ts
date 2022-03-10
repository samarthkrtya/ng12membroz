
import { Component, OnDestroy, OnInit } from '@angular/core';
import { of, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { FinanceService } from 'src/app/core/services/finance/finance.service';
import { JournalService } from 'src/app/core/services/finance/journal.service';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import swal from 'sweetalert2';

@Component({
  selector: 'app-opening-balances',
  templateUrl: './opening-balances.component.html',
  styleUrls: ['./opening-balances.component.scss']
})
export class OpeningBalancesComponent extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  isLoading: boolean = false;
  disableButton: boolean = false;


  openingBalanceDate: Date;

  accountList: any[] = [];
  _groupAccountList: any[] = [];

  openingBalanceParams: any;
  openingBalanceDetails: any;
  journalid: any;

  crTotalAmount: number = 0;
  drTotalAmount: number = 0;

  constructor(
    private _financeService: FinanceService,
    private _journalService: JournalService
  ) {
    super();
    this.pagename = 'opening-balances';
  }

  async ngOnInit() {
    await super.ngOnInit();
    this.openingBalanceParams = {};
    this.openingBalanceParams.journaltype = "Opening Balance";

    this.getAllAccounts();
  }


  getAllAccounts() {
    this.isLoading = true;
    this._groupAccountList = [];
    let postData = {};
    postData['search'] = [];
    postData['search'].push({ 'searchfield': 'status', 'searchvalue': 'active', 'criteria': 'eq' });

    this._financeService
      .GetAccountHeadByFilter(postData)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((value: []) => {
          let transferobj = {}, transferary = [];
          for (const item in value) {
            transferobj = value[item];
            transferobj['amount'] = 0;
            transferobj['cramount'] = 0;
            transferobj['dramount'] = 0;
            transferobj['availablebalance'] = 0;
            transferary.push(transferobj);
          }
          return of(transferary);
        })).subscribe((data: []) => {
          this.isLoading = false;
          if (data) {
            this.accountList = [];
            this.accountList = data;
            this._groupAccountList = [];
            this._groupAccountList = this.groupBy(data, 'reporthead');
            this.getAllOpeningBalance();
          }
        });
  }

  getAllOpeningBalance() {
    this._journalService
      .GetAllOB()
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.openingBalanceDetails = data;
          if (this.openingBalanceDetails.journalid) {
            this.journalid = this.openingBalanceDetails.journalid;
          }
          if (this.openingBalanceDetails.date) {
            this.openingBalanceDate = this.openingBalanceDetails.date;
          }
          if (this.openingBalanceDetails.journalledgers) {
            let jlArr: any[] = this.openingBalanceDetails.journalledgers;
            if (jlArr.length > 0) {
              jlArr.forEach(ele => {
                if (ele.craccount != undefined) {
                  if (this.accountList.length > 0) {
                    let tmpobj: any = this.accountList.find(ele75 => ele75._id == ele.craccount);
                    if (tmpobj != undefined) {
                      tmpobj.cramount = ele.amount;
                      if (ele.availablebalance != undefined) {
                        tmpobj.availablebalance = ele.availablebalance;
                      }
                    }
                  }
                }
                if (ele.draccount != undefined) {
                  if (this.accountList.length > 0) {
                    let tmpobj: any = this.accountList.find(ele75 => ele75._id == ele.draccount);
                    if (tmpobj != undefined) {
                      tmpobj.dramount = ele.amount;
                      if (ele.availablebalance != undefined) {
                        tmpobj.availablebalance = ele.availablebalance;
                      }
                    }
                  }
                }
                if (ele == jlArr[jlArr.length - 1]) {
                  this.countTotalOpeningBalance();
                }
              });
            } else {
              this.countTotalOpeningBalance();
            }
          } else {
            this.countTotalOpeningBalance();
          }
        } else {
          this.countTotalOpeningBalance();
        }
      });
  }

  drChanged(accobj: any) {
    if (accobj.cramount) {
      accobj.cramount = 0;
    }
    this.countTotalOpeningBalance();
  }

  crChanged(accobj: any) {
    if (accobj.dramount) {
      accobj.dramount = 0;
    }
    this.countTotalOpeningBalance();
  }

  countTotalOpeningBalance() {
    this.crTotalAmount = 0;
    this.drTotalAmount = 0;
    if (this.accountList.length > 0) {
      this.accountList.forEach(ele => {
        this.crTotalAmount += ele.cramount;
        this.drTotalAmount += ele.dramount;
        //ele.availablebalance = 0;
      });
    }
  }

  removeOpeningBalance() {
    this.disableButton = true;
    const temp = this;
    swal.fire({
      title: 'Are you sure?',
      text: 'This will remove All Opening Balance Settings. Do you want to proceed ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, keep it',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then((result) => {
      if (result.value) {
        temp._journalService
          .AsyncDelete(temp.journalid)
          .then(data => {
            temp.showNotification('top', 'right', 'Opening Balance has been deleted Successfully!!!', 'success');
            temp.disableButton = false;
            temp.getAllAccounts();
            temp.openingBalanceDate = null;
          }).catch((e) => {
            temp.showNotification("top", "right", "Error Occured !!", "danger");
            temp.disableButton = false;
          });
      }
    });
  }

  submitOpeningBalance() {
    this.disableButton = true;
    this.openingBalanceParams.journalledgers = [];
    if (!this.openingBalanceDate) {
      this.showNotification('top', 'right', 'Please select date!!!', 'danger');
      this.disableButton = false;
      return;
    } else {
      this.openingBalanceParams.date = this.openingBalanceDate;
    }
    if (this.accountList.length > 0) {
      this.accountList.forEach(ele => {
        let objtmp: any = {};
        if (ele.cramount && ele.cramount > 0) {
          objtmp.craccount = ele._id;
          objtmp.amount = ele.cramount;
          this.openingBalanceParams.journalledgers.push(objtmp);
        } else if (ele.dramount && ele.dramount > 0) {
          objtmp.draccount = ele._id;
          objtmp.amount = ele.dramount;
          this.openingBalanceParams.journalledgers.push(objtmp);
        }
      });
    }

    
    if (this.journalid != undefined) {
      this._journalService
        .AsyncUpdateOB(this.journalid, this.openingBalanceParams)
        .then((data: any) => {
          if (data) {
            this.disableButton = false;
            this.showNotification('top', 'right', 'Opening balance detail updated successfully!!!', 'success');
          }
        }).catch((e) => {
          this.disableButton = false;
          super.showNotification("top", "right", "Error Occured !!", "danger");
        });
    } else {
      this._journalService
        .AsyncAddOB(this.openingBalanceParams)
        .then((data: any) => {
          if (data) {
            this.disableButton = false;
            if (data._id) {
              this.journalid = data._id;
            }
            this.showNotification('top', 'right', 'Opening balance detail updated successfully!!!', 'success');
          }
        }).catch((e) => {
          this.disableButton = false;
          super.showNotification("top", "right", "Error Occured !!", "danger");
        });
    }
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index,
      values = [], result = [];
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



  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }


}
