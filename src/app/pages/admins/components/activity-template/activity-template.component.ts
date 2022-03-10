
import { Component, OnDestroy, OnInit } from '@angular/core';
import {  FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Observable, of, Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';

import { Cloudinary } from '@cloudinary/angular-5.x';
import { FileUploader, FileUploaderOptions, ParsedResponseHeaders } from 'ng2-file-upload';
import { takeUntil } from 'rxjs/operators';


declare var $: any;

@Component({
  selector: "app-activity-template",
  templateUrl: "./activity-template.component.html",
})
export class ActivityTemplateComponent  extends BaseLiteComponemntComponent implements OnInit, OnDestroy {
  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = false;
  bindId: any;

  attachment: any;
  customeUploader: any;

  dueType: string[] = ["Days", "Weeks", "Months", "Years"];
  dispositionList : any[] = [];
  dispositionDDTreeList: any[] = [];
  dispositionDDTreeList2: any[] = [];

  userList : any[] = [];
  roleList : any[] = [];

  formfields = {
    fieldname: "formid",
    fieldtype: "form",
    fieldfilter: "status",
    fieldfiltervalue: "active",
    method: "POST",
    form: {
      apiurl: "forms/filter",
      formfield: "_id",
      displayvalue: "dispalyformname",
    },
    search : [
      { "searchfield": "formname", "searchvalue": ['member','user','promotion','prospect'], "criteria": "in","datatype": 'text' }
    ],
    value: "",
    dbvalue: "",
  };
 
  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private cloudinary: Cloudinary,
    private _commonService: CommonService
  ) {
    super();

    this.form = this.fb.group({
      formid: ["", Validators.required],
      dispositionid: ["", Validators.required],
      title: ["", Validators.required],
      dueday: [, Validators.required],
      timeschedule: ["after", Validators.required],
      duetype: ["Days", Validators.required],
      priority: ["moderate", Validators.required],      
      content: ["", Validators.required],
      assingeeuser: ["", Validators.required],
      assingeerole: ["", Validators.required],
    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = "booking-form";
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
    
    this.imageConfigration();
  }

  async LoadData() {
    this.isLoading = true;
    this.getUsers();
    this.getRoles();
    await this.getAllDisposition();
    if(this.bindId){
      await  this.getTemplById(this.bindId)
    }
    this.isLoading = false;
  }


  getUsers(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    let url = "users/filter";
    let method = "POST";

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (data: any) => {
        if (data) {
          this.userList = [];
          this.userList = data;
        }
      });
  }

  getRoles(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    let url = "roles/filter";
    let method = "POST";

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .pipe(takeUntil(this.destroy$))
      .subscribe(async (data: any) => {
        if (data) {
          this.roleList = [];
          this.roleList = data;
        }
      });
  }
  
  async getAllDisposition() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    let url = "dispositions/filter";
    let method = "POST";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        if (data) {
          this.dispositionList = [];
          this.dispositionDDTreeList  = [];
          this.dispositionDDTreeList2 = [];
          this.dispositionList = data;

          this.dispositionDDTreeList = JSON.parse(JSON.stringify(this.dispositionList));

           if(this.dispositionDDTreeList.length > 0){
             let i = 0;
             this.dispositionDDTreeList.forEach((ele) => {
               i = i + 100;
               ele.displayOrder = i;
             });
             this.dispositionDDTreeList.forEach((ele) => {
               let stage = 0;
               ele.displayName = "";
               ele.displayNameDD = "";
               ele.displayNameSelect = "";

               ele.displayNameSelect = ele.disposition;
               ele.displayName = ele.disposition;
               ele.displayNameDD = ele.disposition;
               if (ele.parentid) {
                 this.attachParentName(ele.parentid, ele, stage);
               }
             });
           }
          this.dispositionDDTreeList = this.dispositionDDTreeList.sort((n1,n2) => {if (n1.displayOrder > n2.displayOrder){return 1;}if (n1.displayOrder < n2.displayOrder){return -1;}return 0;});
          this.dispositionDDTreeList2 = this.dispositionDDTreeList;
        }
    });
  }

 async getTemplById(id : any){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq" , "datatype" : "ObjectId" });

    let url = "activitytemplates/filter";
    let method = "POST";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if (data) {
          var res = data[0];
          console.log("res", res);
          this.form.controls['title'].setValue(res.title);
          this.form.controls['formid'].setValue(res.formid);
          this.formfields.dbvalue = res.formid;
          this.form.controls['dispositionid'].setValue(this.dispositionDDTreeList2.find(a=>a._id == res.dispositionid._id));
          this.form.controls['content'].setValue(res.content);
          this.form.controls['dueday'].setValue(res.duedate.dueday);
          this.form.controls['timeschedule'].setValue(res.duedate.duedaytype);
          this.form.controls['duetype'].setValue(res.duedate.duecond);
          this.form.controls['assingeeuser'].setValue(res.assingeeuser);
          this.form.controls['assingeerole'].setValue(res.assingeerole);
          this.form.controls['priority'].setValue(res.priority);
          
          this.attachment = res.attachment;
        }
      });
  }

  attachParentName(parentobj: any, currObj: any, stage:number){
    let tempobj: any;
    stage += 1;
    tempobj = this.dispositionDDTreeList.find(ele1 => ele1._id == parentobj._id);
   
    if(tempobj){
      if(tempobj.disposition){
        currObj.displayName = tempobj.disposition + ' --> ' + currObj.displayName;
        currObj.displayNameDD = '|---- ' + currObj.displayNameDD;
        currObj.displayOrder = tempobj.displayOrder + stage;
      }
      if(tempobj.parentid){
        this.attachParentName(tempobj.parentid, currObj, stage);
      }
    }
  }


  private imageConfigration() {
    
    var auth_cloud_name = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.cloud_name ? this._authService.auth_cloudinary.cloud_name : this.cloudinary.config().cloud_name;
    var auth_upload_preset = this._authService && this._authService.auth_cloudinary && this._authService.auth_cloudinary.upload_preset ? this._authService.auth_cloudinary.upload_preset : this.cloudinary.config().upload_preset;

    const uploaderOptions: FileUploaderOptions = {
      url: `https://api.cloudinary.com/v1_1/${auth_cloud_name}/upload`,
      autoUpload: true,
      isHTML5: true,
      removeAfterUpload: true,
      headers: [
        {
          name: "X-Requested-With",
          value: "XMLHttpRequest",
        },
      ],
    };

    this.customeUploader = new FileUploader(uploaderOptions);
    this.customeUploader.onBuildItemForm = (
      fileItem: any,
      form: FormData
    ): any => {
      form.append("upload_preset", auth_upload_preset);
      form.append("context", `photo=${"item_logo"}`);
      form.append("tags", "item_logo");
      form.append("file", fileItem);
      fileItem.withCredentials = false;
      return { fileItem, form };
    };
    const upsertResponse = (fileItem) => {
      $(".loading").show();
      if (fileItem && fileItem.status == 200) {
        let fieldnameTags = fileItem.data.tags[0];
        if (!this.attachment) {
          this.attachment = {};
        }
        let extension: any;
        if (fileItem.file) {
          extension = fileItem.file.name.substr(
            fileItem.file.name.lastIndexOf(".") + 1
          );
        }
        let fileInfo = {
          attachment: fileItem.data.secure_url,
          extension: extension,
          originalfilename: fileItem.data.original_filename,
        };
        this.attachment = fileInfo;

        $("#" + fieldnameTags).val(fileItem.data.secure_url);
        $(".loading").hide();
      }
    };
    this.customeUploader.onCompleteItem = (
      item: any,
      response: string,
      status: number,
      headers: ParsedResponseHeaders
    ) =>
      upsertResponse({
        file: item.file,
        status,
        data: JSON.parse(response),
      });
    this.customeUploader.onProgressItem = (fileItem: any, progress: any) =>
      upsertResponse({
        file: fileItem.file,
        progress,
      });
  }

  public removeImg() {
    this.attachment = null;
  }
  downloadlink(link: any) {
    window.open(link, '_blank');  
  }

 
  selectedForm(form){
    console.log("form",form);
    // this.form.controls['dispositionid'].setValue('');
    if(form && form._id){
        this.dispositionDDTreeList = this.dispositionDDTreeList2.filter(a=>a.formid._id  == form._id);
    }else{
      this.dispositionDDTreeList = this.dispositionDDTreeList2;
    }
  }
 
  async onSubmit(value: any, valid: boolean) {
    this.submitted = true;
    if (!valid) {
      super.showNotification(  "top", "right", "Enter required fields !!", "danger");
      return;
    }
    this.disableButton = true;
    
    var model = {};
    model['title'] = value.title;
    model['dispositionid'] = value.dispositionid._id;
    model['formid'] = value.formid._id;
    model['content'] = value.content;
    model['duedate'] = {
      "dueday" : value.dueday,
      "duecond" : value.duetype,
      "duedaytype" : value.timeschedule,
    };
    model['assingeeuser'] = value.assingeeuser;
    model['assingeerole'] = value.assingeerole;
    model['priority'] = value.priority;
    model['type'] = "tasks";
    model['attachment'] = this.attachment;
      
    console.log("model",model);

    let url = "activitytemplates";
    let method = this.bindId ? "PUT" : "POST";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model,this.bindId)
      .then(async (data: any) => {
        if (data) {
          console.log("data",data);
          this.disableButton = true;
          super.showNotification(  "top", "right", "Template made successfully !!", "success");
          this._router.navigate(['/pages/dynamic-list/list/activitytemplate']);
        }
      }).catch((e)=>{
        console.error("e",e);
        this.disableButton = true;
      });

  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

