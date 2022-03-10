import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-report-settings',
  templateUrl: './report-settings.component.html'
})
export class ReportSettingsComponent extends BaseComponemntComponent implements OnInit {

  isLoading: boolean = false;
  contentVisibility: boolean = false;
  itemVisbility: boolean = false;

  bindId: any;

  dataContent: any = {};
  schemafieldLists: any[] = [];

  constructor(
    private _route: ActivatedRoute,
  ) {
    super();
    this.isLoading = false;

    this.pagename = "app-report-settings";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "6083b9864d7f321c60b3e19c";

      this.contentVisibility = false;
      this.itemVisbility = false;
    });
  }

  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        await this.LoadData();
        console.log("this.dataContent",this.dataContent);
        if(this.dataContent.formname){
         await this.getfieldLists(this.dataContent.formname);
        }else if(this.dataContent.formid.formname){
          await this.getfieldLists(this.dataContent.formid.formname);
        }else{
          this.showNotification('top', 'right', 'Form not available !!', 'danger');
        }
      } catch (err) {
        console.error(err);
      } finally {
      }
    });
  }


  async LoadData() {

    this.contentVisibility = false;

    let method = "POST";
    let url = "reports/filter/view";

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq", "datatype": "text" });
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "ObjectId" });
     
    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data) => {
        if (data) {
          this.dataContent = data[0];
          this.dataContent.id = this.bindId;
          this.contentVisibility = true;
          this.itemVisbility = true;
        }
      }, (error) => {
        console.error(error);
        this.contentVisibility = true;
        this.itemVisbility = true;
      });    
  }

  async getfieldLists(formname: any) {

    this.schemafieldLists = [];
    await this._commonService
      .AsyncGetFormSchemaByFormName(formname)
      .then((data: any) => {
        if (data && data.length !== 0) {
          this.schemafieldLists = data;
          this.schemafieldLists = this.schemafieldLists.filter(a=>a.id != "_id" && a.fieldname != "_id");
        }
      });
  }


  async selectfiledSubmitData(submittedData: any) {
    this.ngOnInit();
  }



  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }


}
