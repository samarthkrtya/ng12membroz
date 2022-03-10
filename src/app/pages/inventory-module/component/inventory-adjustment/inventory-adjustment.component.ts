import { Component, OnInit } from '@angular/core';

import { Observable, Subject } from 'rxjs';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

import { CalendarOptions, DateSelectArg, EventClickArg } from '@fullcalendar/angular'; // useful for typechecking

declare var $: any;
import swal from 'sweetalert2';
import { ActivatedRoute } from '@angular/router';
import { InventoriesModel } from 'src/app/core/models/inventories/inventories.model';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-inventory-adjustment',
  templateUrl: './inventory-adjustment.component.html',
  styles: [
    `
    `
  ]
})
export class InventoryAdjustmentComponent extends BaseComponemntComponent implements OnInit {

  _inventoriesModel = new InventoriesModel();
  bindid: any;
  disableBtn: boolean = false;
  submitted: boolean;
  productList: any[] = [];
  form: FormGroup;

  filteredProductOptions: Observable<string[]>;
  allProductLists: any[] = [];
  productisLoadingBox: boolean = false;


  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    super();

    this.form = fb.group({
      'productid': [, Validators.required],
      'currentstock': [],
      'newstock': [, Validators.required],
      'qauntityalertlevel': [, Validators.required],
    });

    this._route.params.forEach((params) => {
      this.bindid = params["id"];
    })
  }

  async ngOnInit() {
    await super.ngOnInit();
    try {
      await this.getAllProduct();
      this.isLoading = false;
    } catch (error) {
      console.error(error);
    }

    this.filteredProductOptions = this.form.get('productid').valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option.title),
        map(option => option ? this._assetfilter(option) : this.allProductLists.slice())
      );
  }

  private _assetfilter(value: string): string[] {
    let results;
    if (value) {
      results = this.allProductLists
        .filter(option => {
          return;
        });
      if (results.length < 1) {
        results = [];
      }
    } else {
      results = this.allProductLists.slice();
    }
    return results;
  }

  async initializeVariables() {
    this.productList = [];
    return;
  }

  onSelectInventory(value: any) {
    this.form.get('currentstock').setValue(value.stock);
    this.form.get('qauntityalertlevel').setValue(value.triggerqty);
    this.form.get('currentstock').disable();
    this.form.get('newstock').setValue(value.stock);
  }

  async getAllProduct() {

    var url = "inventories/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData['search'].push({ "searchfield": 'status', "searchvalue": "deleted", "criteria": "ne" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {

          this.allProductLists = [];
          this.allProductLists = data;
          this.allProductLists.map(p => p.src = p.itemid && p.itemid.imagegallery.length > 0 && p.itemid.imagegallery[0].attachment ? p.itemid.imagegallery[0].attachment : '../../assets/img/default-avatar.png')

          var inventory = this.allProductLists.find(p => p._id == this.bindid);
          if (inventory) {
            this.form.get('productid').setValue(inventory);
            this.form.get('currentstock').setValue(inventory.stock);
            this.form.get('productid').disable();
            this.form.get('currentstock').disable();
            this.form.get('qauntityalertlevel').setValue(inventory.triggerqty);
            this.form.get('newstock').setValue(inventory.stock);
          }
        }
      }, (error) => {
        console.error(error);
      });
  }

  onSubmit(value: any, isValid: boolean) {    
    value  = this.form.getRawValue();
    this.submitted = true;
    if (!isValid) {
      this.showNotification('top', 'right', 'Fill required fields !!', 'danger');
      return;
    } else {

      if (!value.productid) return;
      let model = {};
      var url = "inventories/" + value.productid._id;
      var method = "PUT";

      model['stock'] = value.newstock;
      model['itemid'] = value.productid.itemid._id;
      model['triggerqty'] = value.qauntityalertlevel;

      this.disableBtn = true;

      this._commonService
        .commonServiceByUrlMethodDataAsync(url, method, model)
        .then((data: any) => {
          if (data) {
            this.showNotification('top', 'right', 'Inventories has been updated successfully', 'success');
            if(this.previousUrl){
              this._router.navigate([this.previousUrl]);
            }else{
              this._router.navigate(['/pages/dynamic-list/list/inventory']);
            }
            this.disableBtn = false;
          }
        }, (error) => {
          this.disableBtn = false;
          console.error(error);
        });

    }
  }

  displayAssetFn(user: any): string {
    return user && user.itemid.itemname ? user.itemid.itemname : '';
  }
}
