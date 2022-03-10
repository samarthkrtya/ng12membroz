import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import swal from 'sweetalert2';

import { BillItemModel } from '../../../../core/models/sale/billitem';
import { LookupsService } from '../../../../core/services/lookups/lookup.service';
import { TaxesService } from '../../../../core/services/payment/taxes.service';
import { BillItemService } from '../../../../core/services/sale/billitem.service';
import { BaseComponemntComponent, BaseComponemntInterface } from '../../../../shared/base-componemnt/base-componemnt.component';
import { OnlyPositiveNumberValidator } from 'src/app/shared/components/basicValidators';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {MatChipInputEvent} from '@angular/material/chips';

declare var $: any;

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styles: [
    `.example-chip-list {
      width: 100%;
    }`],
})
export class ProductFormComponent extends BaseComponemntComponent implements OnInit, OnDestroy, BaseComponemntInterface {

  billItemModel = new BillItemModel();
  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = true;
  bindId: any;

  unitList: any[] = [];
  brandList: any[] = [];  
  unitmeasureList: any[] = [];
  taxesList: any[] = [];

  formImageArray: any[] = [];
  customeUploader: any;
  maxFileSize = 5 * 1024 * 1024;

  validaterate : boolean = false;
  enabletrigger : boolean =false;

  category_fields = {
    "fieldname": "category",
    "fieldtype": "formdata",
    "search": [
      { "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "formid", "searchvalue": "5e058897b0c5fb2b6c15cc69", "criteria": "eq" , "datatype" : "ObjectId" }
    ],
    "select": [
      { "fieldname": "_id", "value": 1 },
      { "fieldname": "property", "value": 1 },
    ],
    "form": {
      "apiurl": "formdatas/filter",
      "formfield": "_id",
      "displayvalue": "property.title",
    },
    "formname": "poscategory",
    "value": "",
    "dbvalue": "",
    "autocomplete" : true,
  }

  addOnBlur = true;
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  tags: any[] = [];
  producttag: FormControl;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private _lookupService: LookupsService,
    private _taxesService: TaxesService,
    private _billItemService: BillItemService,

  ) {
    super();

    this.form = this.fb.group({
      'itemname': ['', Validators.required],
      'barcode': [],      
      'producttag' : [],
      'unit': ['', Validators.required],
      'brand': [],
      'category': ['', Validators.required],
      'enableinventory': [false],
      'triggerqty' : ([OnlyPositiveNumberValidator.insertonlypositivenumber]),
      'salerate': [, Validators.compose([Validators.required, OnlyPositiveNumberValidator.insertonlypositivenumber])],
      'salediscount': [0, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'salediscounttype': ["Fixed"],
      'saletaxes': [],
      'saledescription': [],
      'purchaserate': [, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'purchasetaxes': [],
      'rentrate': [, OnlyPositiveNumberValidator.insertonlypositivenumber],
      'rentunit': [],
      'renttaxes': [],
      'rentdescription': [],
      'onlineavailibility': [false],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = 'product-form';
      this._formName = "product";
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
    
    this.form.controls['salediscount'].valueChanges.subscribe((val) => {
      this.form.controls['salediscount'].setErrors(null);
      var type = this.form.get('salediscounttype').value;
      var salerate = this.form.get('salerate').value;
      if (!type && val) {
        this.form.controls['salediscount'].setErrors({ typeerror: true });
        return;
      } else {
        if (type == 'Fixed' && salerate && val > salerate) {
          this.form.controls['salediscount'].setErrors({ typeerror: true });
        } else if (type == 'Percentage' && val > 100) {
          this.form.controls['salediscount'].setErrors({ typeerror: true });
        }
      }
    });
  }

  async LoadData() {
    this.isLoading = true;
    this.imageConfigration();
    this.getUnits(); 
    this.getTaxes();
    if (this.bindId) {
      await this.getById(this.bindId);
    }
    this.isLoading = false;


    this.form.controls['enableinventory']
       .valueChanges
      .subscribe((data : boolean)=>{
        
        this.form.controls['purchaserate'].setValidators(Validators.compose([Validators.required,OnlyPositiveNumberValidator.insertonlypositivenumber]));
        this.form.controls['purchaserate'].updateValueAndValidity();
        this.validaterate = data;

        this.form.controls['triggerqty'].enable();
        this.enabletrigger = data;
    })
  }


  protected getUnits() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });
    postData["search"].push({ "searchfield": "lookup", "searchvalue": ["unit", "period", "brand"], "criteria": "in", "datatype": "string" });

    this._lookupService
      .GetByfilterLookupName(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lookupData: any[]) => {
        this.unitList = lookupData.find(a => a.lookup == "unit")['data'];
        this.brandList = lookupData.find(a => a.lookup == "brand")['data'];
        this.unitmeasureList = lookupData.find(a => a.lookup == "period")['data'];
      });
  }
 
  protected getTaxes() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    this._taxesService
      .getbyfilter(postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any[]) => {
        this.taxesList = data;
      });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if(!this.tags)this.tags = [];
    
    if (value) {
      this.tags.push(value);
    }
    if (event.input) {
      event.input.value = '';
    }
    // event.chipInput!.clear();
  }

  remove(tag: any): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  protected imageConfigration() {

    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;
    
    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
      headers: [
        {
          name: 'X-Requested-With',
          value: 'XMLHttpRequest'
        }
      ],
      // allowedFileType: element.allowedfiletype ? element.allowedfiletype : this.allowedFileType,
      //maxFileSize: element.maxfilesize ? element.maxfilesize : Number(this.maxFileSize)
    };
    this.customeUploader = new FileUploader(uploaderOptions);
    this.customeUploader.onBuildItemForm = (fileItem: any, form: FormData): any => {
      form.append('upload_preset',  auth_upload_preset);
      form.append('context', `photo=${"attachment"}`);
      form.append('tags', "attachment");
      form.append('file', fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    uploaderOptions.allowedFileType = ['image']
    const upsertResponse = fileItem => {
      $(".loading").show();
      if (fileItem && fileItem.status == 200) {
        let fieldnameTags = fileItem.data.tags[0];
        if (!this.formImageArray) {
          this.formImageArray = [];
        }
        let extension: any;
        if (fileItem.file) {
          extension = fileItem.file.name.substr(fileItem.file.name.lastIndexOf('.') + 1);
        }
        let fileInfo = {
          attachment: fileItem.data.secure_url,
          extension: extension,
          originalfilename: fileItem.data.original_filename
        };
        this.formImageArray.push(fileInfo);
        $('#' + fieldnameTags).val(fileItem.data.secure_url);
        $(".loading").hide();
      }
    };
    this.customeUploader.onCompleteItem = (item: any, response: string, status: number, headers: ParsedResponseHeaders) =>
      upsertResponse(
        {
          file: item.file,
          status,
          data: JSON.parse(response)
        }
      );
    this.customeUploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse(
        {
          file: fileItem.file,
          progress
        });
    this.customeUploader.onWhenAddingFileFailed = (item: any, filter: any) => {
      let message = '';
      switch (filter.name) {
        case 'fileSize':
          message = 'Warning ! \nThe uploaded file \"' + item.name + '\" is ' + this.formatBytes(item.size) + ', this exceeds the maximum allowed size of ' + this.formatBytes(Number(this.maxFileSize) * 1024 * 1024);
          this.showNotification("top", "right", message, "danger");
          break;
        default:
          message = 'Error trying to upload file ' + item.name;
          this.showNotification("top", "right", message, "danger");
          break;
      }
    };
  }

  protected formatBytes(bytes: any, decimals?: any) {
    if (bytes == 0) return '0 Bytes';
    const k = 1024,
      dm = decimals || 2,
      sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  protected removeImg(url: any) {
    this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachment == url), 1);
  }

  protected downloadlink(link: any) {
    window.open(link, '_blank');
    return true;
  }

  showSwal(url: any) {
    swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this image file!',
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
        this.formImageArray.splice(this.formImageArray.findIndex(a => a.attachment == url), 1);
      }
    })
  }

  private async getById(id: any) {
    await this._billItemService
      .AsyncGetById(id)
      .then((data: any) => {
        this.form.controls['itemname'].setValue(data.itemname);
        this.form.controls['barcode'].setValue(data.barcode);
        this.form.controls['unit'].setValue(data.unit);        
        
        if(data.category && data.category._id){
          this.form.controls['category'].setValue(data.category);
          this.category_fields.dbvalue = data.category;
        }

        this.form.controls['enableinventory'].setValue(data.enableinventory);
        if (data.enableinventory == true) {
          this.form.controls['triggerqty'].setValue(data?.property?.triggerqty);
          this.enabletrigger = data.property.triggerqty;
        }
        
        var staxes = [], ptaxes = [], rtaxes = [];
        if (data.sale && data.sale.taxes && data.sale.taxes.length > 0) {
          data.sale.taxes.forEach(element => {
            staxes.push(element._id);
          });
        }
        this.form.controls['salerate'].setValue(data.sale.rate);
        this.form.controls['salediscount'].setValue(data.sale.discount);
        this.form.controls['salediscounttype'].setValue(data.sale.discounttype);
        this.form.controls['saletaxes'].setValue(staxes);
        this.form.controls['saledescription'].setValue(data.sale.description);
        if (data.purchase && data.purchase.taxes && data.purchase.taxes.length > 0) {
          data.purchase.taxes.forEach(element => {
            ptaxes.push(element._id);
          });
        }
        this.form.controls['purchaserate'].setValue(data.purchase.rate);
        this.form.controls['purchasetaxes'].setValue(ptaxes);
        if (data.rent && data.rent.taxes && data.rent.taxes.length > 0) {
          data.rent.taxes.forEach(element => {
            rtaxes.push(element._id);
          });
        }
        this.form.controls['rentrate'].setValue(data.rent.rate);
        this.form.controls['rentunit'].setValue(data.rent.unit);
        this.form.controls['renttaxes'].setValue(rtaxes);
        this.form.controls['rentdescription'].setValue(data.rent.description);
        this.form.controls['onlineavailibility'].setValue(data?.property?.onlineavailibility);

        this.formImageArray = data.imagegallery;
        if (data.property && data.property['notes']) {
          this.form.controls['notes'].setValue(data.property['notes']);
        }
        // if (data.property && data.property['tags']) {
        //   this.tags = data.property['tags'];
        // }
        this.tags = data?.property?.tags;
        this.form.controls['brand'].setValue(data?.property?.brand);
      });
  }

  public async onSubmit(value: any, valid: boolean) {
    console.log('value =>', value);
    if (this.bindId && !this.editPermission) {
      super.noeditpermissionMsg("edit");
      return;
    } else if (!this.bindId && !this.addPermission) {
      super.noeditpermissionMsg("add");
      return;
    }

    this.submitted = true;
    if (!valid) {
      super.showNotification("top", "right", "Enter required fields !!", "danger");
      return;
    }

    this.billItemModel.itemname = value.itemname;
    this.billItemModel.barcode = value.barcode;
    if(value.category && value.category.autocomplete_id){
      this.billItemModel.category = value.category.autocomplete_id;
    }
    this.billItemModel.unit = value.unit;
    this.billItemModel.enableinventory = value.enableinventory;
    this.billItemModel.sale = {};
    this.billItemModel.sale['rate'] = value.salerate;
    this.billItemModel.sale['discount'] = value.salediscount ? value.salediscount : 0;
    this.billItemModel.sale['discounttype'] = value.salediscounttype ? value.salediscounttype : 0;
    this.billItemModel.sale['taxes'] = value.saletaxes;
    this.billItemModel.sale['description'] = value.saledescription;

    this.billItemModel.purchase = {};
    this.billItemModel.purchase['rate'] = value.purchaserate;
    this.billItemModel.purchase['taxes'] = value.purchasetaxes;

    this.billItemModel.rent = {};
    this.billItemModel.rent['rate'] = value.rentrate;
    this.billItemModel.rent['unit'] = value.rentunit;    
    this.billItemModel.rent['taxes'] = value.renttaxes;
    this.billItemModel.rent['description'] = value.rentdescription;

    this.billItemModel["property"]={};
    this.billItemModel["property"]["tags"] = this.tags;
    this.billItemModel["property"]["brand"] = value.brand;
    this.billItemModel["property"]["onlineavailibility"] = value.onlineavailibility;
    this.billItemModel["property"]["triggerqty"] = value.triggerqty;
    
    this.billItemModel.imagegallery = this.formImageArray;

    console.log("this.billItemModel",this.billItemModel);
    try {
      var savedData;
      this.disableButton = true;
      if (!this.bindId) {
        savedData = await this.Save(this.billItemModel);
      } else {
        savedData = await this.Update(this.bindId, this.billItemModel);
      }
      this._router.navigate([`/pages/dynamic-list/list/product`]);
      super.showNotification("top", "right", "Product made successfully !!", "success");
      this.disableButton = false;
    } catch (e) {
      super.showNotification("top", "right", "Error Occured !!", "danger");
      this.disableButton = false;
    }
  }

  async Save(model?: any) {
    return await this._billItemService.AsyncAdd(model);
  }

  async Update(id?: string, model?: any) {
    return await this._billItemService.AsyncUpdate(id, model);
  }

  ActionCall() { }
  Delete() { }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  getSubmittedData(submit_data: any) {
    this.category_fields.autocomplete = false;
    this.category_fields.dbvalue = submit_data.value;
    setTimeout(() => {
      this.category_fields.autocomplete = true;
    });
      
  }

}
