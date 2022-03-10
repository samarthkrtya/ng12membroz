import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { BaseComponemntComponent } from '../../../../shared/base-componemnt/base-componemnt.component';

declare var $: any;

@Component({
  selector: 'app-formdata-detail',
  templateUrl: './formdata-detail.component.html'
})
export class FormdataDetailComponent extends BaseComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  bindId: any;
  itemVisbility: boolean = false;
  contentVisibility: boolean = false;
  dataContent: any = {};

  displayedColumns: string[] = ['fullname', 'mobile', 'email', 'action'];
  displayedColumns1: string[] = ['fullname', 'mobile', 'email', 'duedate', 'action'];

  constructor(
    private _route: ActivatedRoute,
  ) {
    super();
    this.pagename = "app-membership-usage";
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
      this._formId = params["formid"] ? params["formid"] : "606db2c999e17f0c3c2b9cb7";
      this.itemVisbility = false;
      this.contentVisibility = false;
    })

  }

  async ngOnInit() {
    this._route.params.forEach(async (params) => {
      await super.ngOnInit();
      try {
        await this.LoadData();
      } catch (err) {
        console.error(err);
      } finally {
      }
    })
  }

  async LoadData() {

    let method = "POST";
    let url = "formdatas/view/filter";

    let postData = {};
    postData["schemaname"] = "formdatas";
    postData["formtype"] = "document";
    postData["viewname"] = "documentsummaryviews";
    postData["search"] = [];
    postData["search"].push({ "searchfield": "_id", "searchvalue": this.bindId, "datatype": "ObjectId", "criteria": "eq" });
    this.contentVisibility = false;

    await this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(data => {
        if (data) {
          this.dataContent = data[0];
          // this.dataContent.shared.map(a => a.duedate = new Date())
          // console.log("this.dataContent", this.dataContent);
          this.itemVisbility = true;
          this.contentVisibility = true;
        }
      }, (error) => {
        console.error(error);
        this.itemVisbility = true;
        this.contentVisibility = true;
      })
  }

  onView(formname: any, id: any) {
    this._router.navigate([`/pages/document-module/form/${formname}/${id}`])
  }

  getSubmittedItemListsData(submitData: any) {
    if (submitData && submitData.bindData && submitData.bindData._id) this.bindId = submitData.bindData._id;
    this.ngOnInit();
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
