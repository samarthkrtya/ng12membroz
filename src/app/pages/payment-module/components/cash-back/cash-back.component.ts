import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CashbacktermsModel } from 'src/app/core/models/payment/cashbackterms.model';
import { FormdataService } from 'src/app/core/services/formdata/formdata.service';
import { CashbackService } from 'src/app/core/services/payment/cashback.service';

import swal from 'sweetalert2';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-cash-back',
  templateUrl: './cash-back.component.html'
})
export class CashbackComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  bindId: any;

  displayedColumns2: string[] = ['fullname', 'number', 'phone', 'email', 'address', 'action'];

  categoryList: any[] = [];
  cashbacktermsList: any[] = [];

  isLoadingData: boolean = true;
  disableBtn: boolean = false;

  _cashbacktermsModel = new CashbacktermsModel();

  constructor(
    private _route: ActivatedRoute,
    private _cashbackService: CashbackService,
    private _formdataService: FormdataService,

  ) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {
    this.isLoadingData = true;
    await super.ngOnInit();
    await this.loadData();
    this.isLoadingData = false;
  }

  async loadData() {
    try {
      await this.getCashback();
    } catch (e) {
      console.error("e", e);
    }
  }

  async getCashback() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });

    var csres: any = await this._cashbackService.getByAsyncFilter(postData);
    
    this.cashbacktermsList = [];
    this.cashbacktermsList = csres;
    this.cashbacktermsList.map(a => a.isEnableEdit = true);
    this.cashbacktermsList.reverse();
    this.getCategory();
  }

  getCategory() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": ["5e70cb9dd466f11d24a7c361", "5e426741d466f1115c2e7d50", "5e058897b0c5fb2b6c15cc69"], "criteria": "in", "datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
    postData["formname"] = "poscategory";

    this._formdataService
      .GetByfilter(postData)
      .pipe(takeUntil(this.destroy$),
        switchMap((val: any) => {
          for (var i = 0; i < this.cashbacktermsList.length; i++) {
            var ItemIndex = val.findIndex(b => b._id === this.cashbacktermsList[i].category._id);
            val.splice(ItemIndex, 1);
          }
          return of(val);
        })
      )
      .subscribe((data: []) => {
        this.categoryList = [];
        this.categoryList = data;
        
      });
  }

  addNewOffer(obj) {
    var tempobj;
    this._cashbacktermsModel._id = '';
    tempobj = {
      category: obj,
      minamount: undefined,
      maxamount: undefined,
      cashbackper: undefined,
      cashbackamount: undefined,
      isEnableAdd: true,
      cashbackmethod: 'Percentage'
    };
    this.cashbacktermsList.push(tempobj)
  }

  editTerms(data: any) {
    this.cashbacktermsList.forEach(element => {
      if (element._id == data._id) {
        this._cashbacktermsModel._id = element._id;
        element.category = data.category;
        element.minamount = data.minamount;
        element.maxamount = data.maxamount;
        element.cashbackmethod = data.cashbackmethod;
        element.cashbackper = data.cashbackper;
        element.cashbackamount = data.cashbackamount;
        element.isEnableEdit = false;
        element.isEnableAdd = true;
      }
    });
  }

  async submitTerms(value: any) {
    try {
      if (!value.minamount || !value.maxamount) {
        this.showNotification('top', 'right', 'Enter required fields !!', 'danger');
        return;
      } else if (value.cashbackmethod == 'Fix' && !value.cashbackamount) {
        this.showNotification('top', 'right', 'Enter required fields !!', 'danger');
        return;
      } else if (value.cashbackmethod == 'Percentage' && !value.cashbackper) {
        this.showNotification('top', 'right', 'Enter required fields !!', 'danger');
        return;
      }
      if(!this.validate(value)){
        return;
      }

      this.disableBtn = true;
      this._cashbacktermsModel.category = value.category._id;
      this._cashbacktermsModel.minamount = value.minamount;
      this._cashbacktermsModel.maxamount = value.maxamount;
      this._cashbacktermsModel.cashbackmethod = value.cashbackmethod;
      if (value.cashbackmethod == 'Percentage') {
        this._cashbacktermsModel.cashbackper = value.cashbackper;
        this._cashbacktermsModel.cashbackamount = 0;
      } else {
        this._cashbacktermsModel.cashbackper = 0;
        this._cashbacktermsModel.cashbackamount = value.cashbackamount;
      }

      if (this._cashbacktermsModel._id) {
        var res = await this._cashbackService.AsyncUpdate(this._cashbacktermsModel._id, this._cashbacktermsModel);
        this.showNotification('top', 'right', 'Cashback term successfully updated !!', 'success');
      } else {
        var res = await this._cashbackService.AsyncAdd(this._cashbacktermsModel);
        this.showNotification('top', 'right', 'Cashback term successfully added !!', 'success');
      }
      await this.getCashback();
      this.disableBtn = false;
    } catch (e) {
      this.disableBtn = false;
    }
  }

  async onDelete(element) {
    swal.fire({
      title: 'Are you sure?',
      text: `Do you want to proceed ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No',
      customClass: {
        confirmButton: "btn btn-success",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.value) {
        try {
          this.disableBtn = true;
          var res = await this._cashbackService.Delete(element._id);
          this.showNotification('top', 'right', 'Cashback term successfully deleted!!!', 'success');
          await this.getCashback();
          this.disableBtn = false;
          this._cashbacktermsModel._id = '';
        } catch (e) {
          this.disableBtn = false;
        }
      }
    });
  }

  validate(item: any) : boolean {
    // item.isEnableAdd = true;
    var isValid : boolean = true;
    if (item.minamount < 0 || item.maxamount < 0 || item.cashbackamount < 0) {
      this.showNotification('top', 'right', 'Enter valid number !!', 'danger');
      isValid = false;
    }
    if (item.minamount > item.maxamount) {
      this.showNotification('top', 'right', 'Enter valid max !!', 'danger');
      isValid = false;
    } else if (item.cashbackmethod == 'Fix' && item.cashbackamount > item.minamount) {
      this.showNotification('top', 'right', 'Enter valid cashback amount !!', 'danger');
      isValid = false;
    } else if (item.cashbackmethod == 'Fix' && item.cashbackamount > item.maxamount) {
      this.showNotification('top', 'right', 'Enter valid cashback amount !!', 'danger');
      isValid = false;
    } else if (item.cashbackmethod == 'Percentage' && item.cashbackper > 100) {
      this.showNotification('top', 'right', 'Enter valid cashback percentage !!', 'danger');
      isValid = false;
    }
    return isValid;
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
