import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { ChallanModel } from '../../../../core/models/purchase/challan.model';
import { ChallanService } from '../../../../core/services/purchase/challan.service';
import { BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-challan',
  templateUrl: './challan.component.html'
})

export class ChallanComponent extends BaseLiteComponemntComponent implements OnInit, AfterViewInit, BaseComponemntInterface {

  challanModel = new ChallanModel();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;

  today = new Date();
  chData: string;

  challanType: any[] = [{ code: 'inward', checked: true }, { code: 'outward', checked: false }];

  public setitemsList: any[] = [];
  public emtyItems: object = {};

  customerfields = {
    "fieldname": "customerid",
    "fieldtype": "form",
    "formfield": "_id",
    "displayvalue": "fullname",
    "fieldfilter": "status",
    "fieldfiltervalue": "active",
    "method": "POST",
    "apiurl": "vendors/filter",
    "value": "",
    "dbvalue": ""
  };

  billfields = {
    "fieldname": "item",
    "fieldtype": "form",
    "formfield": "_id",
    "displayvalue": "itemname",
    "fieldfilter": "status",
    "fieldfiltervalue": "active",
    "method": "POST",
    "modelValue": "item",
    "apiurl": "billitems/view/filter",
    "value": "",
    "dbvalue": ""
  }

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private _challanService: ChallanService,
  ) {
    super();
    this.form = this.fb.group({
      'customerid': ['', Validators.required],
      'type': [],
      'challandate': [this.today],
    });
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'challan';
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    this.isLoading = false;
    this.LoadData();
  }

  ngAfterViewInit() {
    this.emtyItems = {
      'productquantity': 1,
      'index': this.setitemsList.length
    };
    this.setitemsList.push(this.emtyItems);
  }

  async LoadData() {
    if (this.bindId) {
      await this.getCHById(this.bindId);
    } else {
      this.chData = await this.getCHNumber();
    }
  }

  private async getCHNumber(): Promise<any> {
    var chnumber = await this._challanService.GetPINumber();
    return chnumber;
  }

  private async getCHById(id: any) {
    this.isLoading = true;
    await this._challanService
      .AsyncGetById(id)
      .then((data: any) => {
        
        this.chData = data.prefix + data.chnumber;
        this.form.controls['challandate'].setValue(data.challandate);
        this.form.controls['type'].setValue(data.type);
        this.customerfields.dbvalue = data.customerid;

        this.challanType.map(function (ch) {
          if (data.type == ch.code) {
            ch.checked = true;
          } else {
            ch.checked = false;
          }
        });

        this.setitemsList = [];
        data.items.forEach((itemEle, ind) => {
          let obj = {
            'productquantity': itemEle.quantity,
            'index': ind,
            '_id': itemEle.item._id,
            'dbvalue': itemEle.item,
            'isdbvalue': true,
            'productname': itemEle.item.itemname,
            'item_logo': itemEle.item.item_logo,
          }
          this.setitemsList.push(obj);
        });
        this.setitemsList.push({ productquantity: 1, index: this.setitemsList.length });
        this.isLoading = false;
        this.cdr.detectChanges();
      }).catch((e) => {
        this.isLoading = false;
      });
  }

  public async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }
    this.disableButton = true;
    this.challanModel = value;
    if (value.customerid && value.customerid._id) {
      this.challanModel.customerid = value.customerid._id;
      this.challanModel.onModel = 'Vendor';
    }

    var itemList = this.setitemsList.filter(a => a._id);
    this.challanModel.items = [];
    itemList.forEach(item => {
      this.challanModel.items.push({
        'item': item._id,
        'quantity': item.productquantity,
        'barcode': item.barcode
      });
    });
    
    try {
      var res;
      if (!this.bindId) {
        res = await this.Save(this.challanModel);
      } else {
        res = await this.Update(this.bindId, this.challanModel);
      }
      this._router.navigate([`/pages/dynamic-preview-list/challan/${res._id}`]);
      super.showNotification("top", "right", "Challan made successfully !!", "success");
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
    }
  }

  async Save(model?: any) {
    return await this._challanService.AsyncAdd(model);
  }

  async Update(id?: any, model?: any) {
    return await this._challanService.AsyncUpdate(id, model);
  }

  Delete() { }
  ActionCall() { }

  public onItemAdded(itemToBeAdded: any) {
    
  }


  protected inputModelChangeValue(emit: any, item: any) {
    if (!item.isdbvalue) {
      var selectedItem = emit;
      if (selectedItem && selectedItem._id) {
        this.setitemsList.map(element => {
          if (element.index == item.index) {
            element.productquantity = 1;
            element.index = item.index;
            element._id = selectedItem._id;
            element.isdbvalue = false;
            element.productname = selectedItem.itemname;
            element.item_logo = selectedItem.item_logo;
          }
        });
        if (this.setitemsList.length == (item.index + 1)) {
          this.emtyItems = {
            'productquantity': 1,
            'index': this.setitemsList.length
          };
          this.setitemsList.push(this.emtyItems);
        }
      }
    } else {
      item.isdbvalue = false;
    }
  }

  protected tblDeleteItem(item: any) {
    this.setitemsList.splice(item.index, 1);
    this.setitemsList.map((ai, ind) => ai.index = ind);
  }

}
