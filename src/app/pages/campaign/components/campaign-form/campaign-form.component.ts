import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-campaign-form',
  templateUrl: './campaign-form.component.html',
  styleUrls: ['./campaign-form.component.css']
})

export class CampaignFormComponent extends BaseComponemntComponent implements OnInit {

  campaignForm: FormGroup;
  campaignname: any;
  subjectline: any;
  campaignData: any;
  buttonClicked: string;

  constructor(private fb: FormBuilder,
    private _route: ActivatedRoute) {

    super();
    this.campaignForm = fb.group({
      'campaignname': [this.campaignname, Validators.required],
      'subjectline': [this.subjectline, Validators.required],

    });
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {
    if (this.bindId) {
      await this.getCampaignData();
    }
  }

  async getCampaignData() {

    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" },
      { "searchfield": "_id", "searchvalue": this.bindId, "criteria": "eq", "datatype": "objectId" });

    var url = "campaigns/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.campaignData = data[0];
          this.campaignname = data[0].campaignname
          this.subjectline = data[0].property?.subjectline
        }
        return
      })
  }

  onSubmit(value) {
    if (this.bindId) {
      if (this.campaignData?.groupids.length > 0) {
        this._router.navigate(["/pages/campaign/confirmation-template/" + this.bindId]);
      }
      else if (this.campaignData?.content) {
        this._router.navigate(["/pages/campaign/template-design/" + this.bindId]);
      }
      else {
        this._router.navigate(["/pages/campaign/template/" + this.bindId]);
      }

    } else {
      let postData = {
        campaignname: value.campaignname,
        campaigntype: 'Digital',
        property: {
          subjectline: value.subjectline
        }
      };

      var url = "campaigns"
      var method = "POST"
      return this._commonService
        .commonServiceByUrlMethodData(url, method, postData)
        .subscribe((data: any) => {
          if (data) {
            this.showNotification('top', 'right', 'Campaign has been added successfully!!', 'success');
            if (this.buttonClicked == 'later') {
              this._router.navigate(["pages/dynamic-list/list/campaign"]);
            } else if (this.buttonClicked == 'next') {
              this._router.navigate(["pages/campaign/template/" + data._id]);

            }
          }
          return
        })
    }
  }

}
