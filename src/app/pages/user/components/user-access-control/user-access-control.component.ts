import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { debounceTime, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import { CommonService } from 'src/app/core/services/common/common.service';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import {  Observable, of, Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from 'src/app/shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-user-access-control',
  templateUrl: './user-access-control.component.html'
})


export class UserAccessControlComponent extends BaseComponemntComponent implements OnInit , OnDestroy {

  form: FormGroup;

  destroy$ = new Subject<boolean>();

  supremaUserData: any;
  _propertyobjectModel: any;
  visible: boolean = false;
   
  isSubmitted = false;
  disabledBtn : boolean = false;
  isLoadingData : boolean = false;
  customerList: any[] = [];
  customerfilteredOptions: Observable<any[]>;
  customerisLoadingBox: boolean = false;
  searchMember: any;

  constructor(public _commonService: CommonService,
    private fb: FormBuilder,
    private _route: ActivatedRoute,) { 
    super();

    this.form = fb.group({
      'contextid' : [,Validators.compose([Validators.required])],
      'supremauser' : [],
      'cardcount' : [],
      'gender' : [],
      'expired' : [],
      'disabled' : [],
      'onModel' : []
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = "61bc4b5ea83abc37b4376681";
    });
  }

  validate(control: AbstractControl): ValidationErrors {
      if (control.value !== '' && typeof control.value === 'string') {
        return { 'invalidAutocompleteObject': { value: control.value } }
      }
      return null;
  }
  

  async ngOnInit() {
    this.isLoadingData = true;
    await super.ngOnInit();
    try {
      await super.ngOnInit();
      if(this.bindId)
        await this.getSupremaUserDetails();
      
      this.isLoadingData = false;
      this.visible = true;
        
    } catch (e) {
      this.isLoadingData = false;
    }
    
    this.form.controls['contextid']
      .valueChanges
      .pipe(
        debounceTime(500),
        tap((item)=>{
          this.customerList = [];
          if(item.length == 0) {
            this.customerisLoadingBox = false;
          } else {
            this.customerisLoadingBox = true;
          }
        }),
        switchMap((value) => 
          value.length > 1
          ? this.getUserData(value)
          : []
        )
      )
      .subscribe((data : any) => {
        this.customerList = [];
        this.customerList = data;        
        this.customerfilteredOptions = of(data);
        this.customerisLoadingBox = false;
      });

  }

  async getUserData(val: any){
    let api = "users/view/filter";
    let method = "POST";

    let postData = {};
    postData['search'] = [];
    postData["viewname"] = "bi_supremausers";
    postData["search"].push({ "searchfield": "fullname",  "searchvalue": val, "criteria": "lk", "datatype": "text" });

    return await this._commonService.commonServiceByUrlMethodDataAsync(api, method, postData);
  }

  displayFn(user: any): string {
    return user && user.fullname ? user.fullname : '';
  }

  inputModelChangeValue(value : any) {
    this.searchMember = value;
    let onModel =  value.type == 'M' ? "Member" : "User";
    this.form.controls['onModel'].setValue(onModel);
  }

  clearMember(){
    this.searchMember = "";
    this.form.controls['contextid'].setValue(null);
    this.form.controls['onModel'].setValue(null);
  } 

  async getSupremaUserDetails() {
 
   let url="formdatas/filter"
   let method="POST"
   let postData = {};
   postData['search'] = [];
   postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "ObjectId" });

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        console.log("data",data);
        if (data) {
          this.supremaUserData = data[0];
          this._propertyobjectModel = this.supremaUserData.property;
          this.form.controls['contextid'].setValue(this.supremaUserData?.contextid);
          this.form.controls['supremauser'].setValue(this.supremaUserData?.property?.name);
          this.form.controls['cardcount'].setValue(this.supremaUserData?.property?.card_count);
          this.form.controls['gender'].setValue(this.supremaUserData?.property?.gender);
          this.form.controls['expired'].setValue(this.supremaUserData?.property?.expired);
          this.form.controls['disabled'].setValue(this.supremaUserData?.property?.disabled);
          this.form.controls['onModel'].setValue(this.supremaUserData?.onModel);
        }
      }).catch((error) => {
        console.error(error);
      });
  }

  onSubmit(value: any, valid: boolean) {
    this.isSubmitted = true;
    if(!valid){
      super.showNotification("top", "right", "Validation failed !!", "danger");
      return;
    }
    let model = {};
    model["property"] = this.supremaUserData['property'];
    model["property"]["name"] =value.supremauser;
    model["property"]["gender"] = value.gender;
    model["property"]["card_count"] =value.cardcount;
    model["property"]["expired"] = value.expired;
    model["property"]["disabled"] = value.disabled;
    model["contextid"] = value?.contextid?._id;
    model["onModel"] = value.onModel
    
    
    var url = "formdatas/" + this.bindId;
    var method = "PATCH";
    this.disabledBtn = true;
    this._commonService
      .commonServiceByUrlMethodData(url, method, model)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (data) {
          this.disabledBtn = false;
            this.showNotification('top', 'right', 'Data has been updated successfully!!!', 'success');
            this._router.navigate(['/pages/dynamic-list/list/suprema']);
        }
      })

  }
 

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();;
  }
 

}
