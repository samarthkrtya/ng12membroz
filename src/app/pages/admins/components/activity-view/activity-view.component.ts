
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from "@angular/forms";
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';
import { CommonService } from '../../../../core/services/common/common.service';
import { takeUntil } from 'rxjs/operators';

declare var $: any;

@Component({
  selector: "app-activity-view",
  templateUrl: "./activity-view.component.html",
})
export class ActivityViewComponent  extends BaseLiteComponemntComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  form: FormGroup;
  disableButton: boolean;
  submitted: boolean;
  isLoading: boolean = false;
  bindId: any;

  dataContent : any;

  constructor(
    private _route: ActivatedRoute,
    private fb: FormBuilder,
    private _commonService: CommonService
  ) {
    super();

    this.form = this.fb.group({

    });

    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this.pagename = "booking-form";
    });
  }

  async ngOnInit() {
    await super.ngOnInit();
    await this.LoadData();
  }

  async LoadData() {
    this.isLoading = true;
    await this.getActivityTemplate(this.bindId);
    this.isLoading = false;
  }

  async  getActivityTemplate(id : any){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": id, "criteria": "eq" , "datatype" : "ObjectId" });

    let url = "activities/filter";
    let method = "POST";

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if (data) {
         this.dataContent = data[0];
         console.log("this.dataContent",this.dataContent);
         if(this.dataContent){
          this.dataContent.displaycontent = this.dataContent.templateid && this.dataContent.templateid.content ? this.dataContent.templateid.content : "";
          var userdata = this.dataContent.refid;
          if(userdata){
            var thistemp = this;
            var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/gm;
            this.dataContent.displaycontent.replace(
              shortcode_regex,
              function (match, code) {
                var replace_str = match.replace("[{", "");
                replace_str = replace_str.replace("}]", "");
                thistemp.dataContent.displaycontent =
                  thistemp.dataContent.displaycontent.replace(
                    "$[{" + replace_str + "}]",
                    userdata[replace_str]
                  );
              }
            );
          }
            this.dataContent.asgnUsers = this.dataContent.assingeeuser.map(a=>a.fullname);
            this.dataContent.asgnRoles = this.dataContent.assingeerole.map(a=>a.rolename);

         }
        }
      });
  }

  getSubmittedData(submit_data: any){

    var method = "PATCH";
    var url = "activities/";

    let postData = {};
    postData['property'] = {};
    postData['property'] = submit_data.value;
    postData['status'] = 'close';

    this._commonService
      .commonServiceByUrlMethodData(url, method, postData,this.bindId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        if (data) {

          if(submit_data.value.followup){
            var model = data;
            model["customerid"] = data.customerid._id;
            model["onModel"] = data.onModel;
            model["dispositionid"] = data.dispositionid._id;
            model["branchid"] = data.branchid._id;
            model["status"] = "active";
            model["assingeeuser"] = submit_data.value.assignto;
            model["duedate"] = submit_data.value.followupdate;

            model['property'] = {};
            this.dataContent.dispositionid.fields.forEach(fields => {
              if(!model["property"][fields.fieldname]){
                model["property"][fields.fieldname] = "";
              }
            });


            this._commonService
              .commonServiceByUrlMethodData(url, "POST", model)
                .pipe(takeUntil(this.destroy$))
                .subscribe((saved: any) => {
                  this.showNotification('top', 'right', 'record updated successfully!!!', 'success');
                  this._router.navigate(['/pages/calendar/my-calendar']);
                });
          }else{
            this.showNotification('top', 'right', 'record updated successfully!!!', 'success');
            this._router.navigate(["/pages/calendar/my-calendar"]);
          }
      } else {
        this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
      }
      }, (error)=>{
      console.error(error);
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}

