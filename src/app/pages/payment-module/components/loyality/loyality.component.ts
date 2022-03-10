import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';
import { CashbacktermsModel } from 'src/app/core/models/payment/cashbackterms.model';
import { FormdataService } from 'src/app/core/services/formdata/formdata.service';
import { CashbackService } from 'src/app/core/services/payment/cashback.service';

import swal from 'sweetalert2';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { SelectionModel } from '@angular/cdk/collections';
import { CommonService } from 'src/app/core/services/common/common.service';
import { FormBuilder, FormGroup } from '@angular/forms';

declare var $: any;

@Component({
  selector: 'app-loyality',
  templateUrl: './loyality.component.html'
})
export class LoyalityComponent extends BaseLiteComponemntComponent implements OnInit {

  form : FormGroup;

  destroy$: Subject<boolean> = new Subject<boolean>();

  allformdataList: any[] = [];
  
  actionddList: any[] = [];
  purchaseddList: any[] = [];
  mainpurchaseddList: any[] = [];  


  actionList: any[] = [];
  mainpurchaseList: any[] = [];
  categoriesList: any[] = [];
  formdatasList: any[] = [];
  
  isLoadingData: boolean = true;
  issubLoading: boolean = false;
  disableBtn: boolean = false;

  _cashbacktermsModel = new CashbacktermsModel();
 
  branchdetail : any;


  constructor(
    private _cashbackService: CashbackService,
    private _formdataService: FormdataService,
    private _commonService: CommonService,
    private fb : FormBuilder,
  ) {
    super();

  this.form = fb.group({
    'enable' : [true],
    'memberpoints' : [],
    'nonmemberpoints' : [],
    'advancesettings' : [false],
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
      this.branchdetail = this._authService.auth_user.branchid;
      await this.getCashback();
      this.getCategory();
      if(this.branchdetail.loyalitysettings){
        this.form.get('enable').setValue(this.branchdetail?.loyalitysettings?.enable)
        this.form.get('memberpoints').setValue(this.branchdetail?.loyalitysettings?.memberpoints)
        this.form.get('nonmemberpoints').setValue(this.branchdetail?.loyalitysettings?.nonmemberpoints)
        this.form.get('advancesettings').setValue(this.branchdetail?.loyalitysettings?.advancesettings)
      }

    } catch (e) {
      console.error("e", e);
    }
  }

 async onSubmit(value : any, valid : boolean){ 
    if(!valid){
      this.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }
  
    var model  = {};
    model['loyalitysettings'] = {};
    model['loyalitysettings'] = value;
 
    let url = 'branches';
    let method = "PATCH";
     
    this.disableBtn = true;
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model, this.branchdetail._id)
      .then((data) => {
        
        if(!this.branchdetail.loyalitysettings) { this.branchdetail.loyalitysettings = {}};
        this.branchdetail.loyalitysettings = model["loyalitysettings"];
        var localStoragetmp = JSON.parse(localStorage.getItem('currentUser'));
        var loginUser = localStoragetmp['user'];
        loginUser['branchid'] = this.branchdetail;
        localStoragetmp['user'] = loginUser;
        localStorage.removeItem('currentUser');
        localStorage.setItem('currentUser',JSON.stringify(localStoragetmp))
        this.disableBtn = false;
        this.showNotification("top", "right", "Loyality reward settings updated successfully !!", "success");
        this.ngOnInit();
      }).catch((e) => {
        console.log("e==>",e);
        this.disableBtn = false;
        this.showNotification("top", "right", "Something went wrong !!", "danger");
      });

  }

  async getCashback() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });

    let csres = await this._cashbackService.getByAsyncFilter(postData) as any[];
    csres.map(a => a.isEnableEdit = true);

    this.allformdataList = [];
    this.actionList = [];
    this.categoriesList = [];
    let purchaseList = [];

    this.allformdataList = csres;
    this.actionList = csres.filter(a=>a['category']['formid']['_id'] == '61cc44303bd3d42bbca1e636');
    purchaseList = csres.filter(a=>a['category']['formid']['_id'] == '61cd3b823bd3d42b58d91435');
    this.categoriesList = csres.filter(a=>(a['category']['formid']['_id'] == '5e70cb9dd466f11d24a7c361' || a['category']['formid']['_id'] == '5e426741d466f1115c2e7d50' || a['category']['formid']['_id'] == '5e058897b0c5fb2b6c15cc69' ) );
    this.mainpurchaseList = [...purchaseList, ...this.categoriesList];
  }

  getCategory() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": ["5e70cb9dd466f11d24a7c361", "5e426741d466f1115c2e7d50", "5e058897b0c5fb2b6c15cc69"  , "61cc44303bd3d42bbca1e636" , "61cd3b823bd3d42b58d91435" ], "criteria": "in", "datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    // postData["search"].push({ "searchfield": "branchid", "searchvalue": this._loginUserBranchId, "criteria": "eq", "datatype": "ObjectId" });
    
    this._formdataService
      .GetByfilter(postData)
      .pipe(
        takeUntil(this.destroy$),
        switchMap((val: any) => {
          for (var i = 0; i < this.allformdataList.length; i++) {
            var ItemIndex = val.findIndex(b => b._id === this.allformdataList[i].category._id);
            val.splice(ItemIndex, 1);
          }
          return of(val);
        }),
        switchMap((val: [])=>{
          return of({
            'cashback' : val.filter(a=>(a['formid']['_id'] == '5e70cb9dd466f11d24a7c361' || a['formid']['_id'] == '5e426741d466f1115c2e7d50' || a['formid']['_id'] == '5e058897b0c5fb2b6c15cc69' ) ),
            'actions' : val.filter(a=>a['formid']['_id'] == "61cc44303bd3d42bbca1e636" ),
            'purchase' : val.filter(a=>a['formid']['_id'] == "61cd3b823bd3d42b58d91435" ),
          });
        }),
      ).subscribe((data:any) => {
        
        this.actionddList = [];
        this.purchaseddList = [];
        this.mainpurchaseddList =  [];

        this.actionddList = data['actions'];
        this.purchaseddList = data['purchase'];
        this.mainpurchaseddList =  [...data['purchase'], ...data['cashback']];
      });
  }

  addNewOffer(obj : any , type : string) {
    if(obj._id  == "61cd4008ab47d92d5c40ea98" || obj._id  == "61cd3ffdab47d92d5c40ea96" || obj._id  == "61cd3ff5ab47d92d5c40ea94"){
      if(obj._id  == "61cd4008ab47d92d5c40ea98"){ 
        this.getCategoryByapi("5e70cb9dd466f11d24a7c361"); // Facility
      }else if(obj._id  == "61cd3ffdab47d92d5c40ea96"){ 
        this.getCategoryByapi("5e426741d466f1115c2e7d50"); // Service
      }else{
        this.getCategoryByapi("5e058897b0c5fb2b6c15cc69"); // Billitems
      }
      setTimeout(() => {
        $("#ppBtn").click();
      },0);
    } else {
      this._cashbacktermsModel._id = '';
      let tempobj = {
        category: obj,
        member : undefined,
        nonmember : undefined,
        isEnableAdd: true,
      };
      if(type == 'poa'){
        this.actionList.push(tempobj)
      }else{
        this.mainpurchaseList.push(tempobj)
      }
    }
  }

  setAllDays(checked: boolean){
    this.formdatasList.map(a => a.checked = checked);
  }

  isAllSelected(){
    return this.formdatasList.filter(a => a.checked == true).length == this.formdatasList.length;
  }

  getCategoryByapi(id : any){
    this.issubLoading = true;
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "formid", "searchvalue": id , "criteria": "eq", "datatype": "ObjectId" });
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    
    this._formdataService
      .GetByfilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data : any[])=>{
        let array : any[] = [];
        data.map((element) => {
          // element.checked  =  this.categoriesList.findIndex(a=>a['category']['_id'] == element._id) != -1
          if(this.categoriesList.findIndex(a=>a['category']['_id'] == element._id) == -1){
            array.push(element);
          }
        });
        this.formdatasList = [];
        this.formdatasList = array
        this.issubLoading = false;
      }); 
  }

  editTerms(data: any) {
    this.allformdataList.forEach(element => {
      if (element._id == data._id) {
        this._cashbacktermsModel._id = element._id;
        element.category = data.category;
        element.member = data.member;
        element.nonmember = data.nonmember;
        element.isEnableEdit = false;
        element.isEnableAdd = true;
      }
    });
  }
 
  onSave(){
    let event = this.formdatasList.filter(a=>a.checked == true);
    if(event.length > 0){
      event.map((a)=>{a.nonmember = 0; a.member = 0; a.isEnableAdd = true });
      event.forEach(itm => {
        let newItm = this.mainpurchaseList.findIndex(a=>a.category._id == itm._id);
        let dditm = this.mainpurchaseddList.find(a=>a._id == itm._id);
        let obj = {
          nonmember : 0,
          member : 0,
          isEnableAdd : true,
          categorytype : 'onpurchase',
          category : dditm,
        }
        if(newItm == -1 && dditm){
          this.mainpurchaseList.push(obj);
        }
      });
    }
    $("#closebtn").click();
  }
 
  async submitTerms(value: any , catType: string) {
    // console.log("value",value);
    try {
      this.disableBtn = true;
      this._cashbacktermsModel.category = value.category && value.category._id ? value.category._id : value.refid;
      this._cashbacktermsModel.member = value.member;
      this._cashbacktermsModel.nonmember = value.nonmember;
      this._cashbacktermsModel.categorytype = catType;
      
      if (this._cashbacktermsModel._id) {
        var res = await this._cashbackService.AsyncUpdate(this._cashbacktermsModel._id, this._cashbacktermsModel);
        this.showNotification('top', 'right', 'Point successfully updated !!', 'success');
      } else {
        var res = await this._cashbackService.AsyncAdd(this._cashbacktermsModel);
        this.showNotification('top', 'right', 'Point successfully added !!', 'success');
      }
      await this.loadData();
      this.disableBtn = false;
    } catch (e) {
      this.disableBtn = false;
    }
  }


  async onSavePurchase(value: any , types: string) {
    let modal = {...value};
    try {
      this.disableBtn = true;
      modal.category = modal.category && modal.category._id ? modal.category._id : '';
      if (modal._id) {
        var res = await this._cashbackService.AsyncUpdate(modal._id, modal);
        this.showNotification('top', 'right', 'Point successfully updated !!', 'success');
      } else {
        var res = await this._cashbackService.AsyncAdd(modal);
        this.showNotification('top', 'right', 'Point successfully added !!', 'success');
      }
      await this.loadData();
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
          this.showNotification('top', 'right', 'record deleted successfully !!', 'success');
          await this.loadData();
          this.disableBtn = false;
          this._cashbacktermsModel._id = '';
        } catch (e) {
          this.disableBtn = false;
        }
      }
    });
  } 
  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
     

}