import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { element } from 'protractor';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-confirmation-template',
  templateUrl: './confirmation-template.component.html',
  styleUrls: ['./confirmation-template.component.css']
})
export class ConfirmationTemplateComponent extends BaseComponemntComponent implements OnInit {

  campaignData: any;
  date:Date;
  contactList: any[] = []
  scheduleEmail: String = "now";
  currentUser: any;
  _formId: any = "5b03b38e0f6ecd0d28ea062b";
  scheduletime:String;
  constructor(private _route: ActivatedRoute) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
  }

  async ngOnInit() {
    this.currentUser = this._authService.currentUser;
    await this.getCampaignData();

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
          this.getGroupclass();
        }
        return
      })
  }

  getGroupclass() {
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })
    let groupList: any[] = []
    var url = "groupclasses/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          groupList = data;
          groupList.forEach(element => {
            this.campaignData.groupids.forEach(ele => {
              if (ele == element._id) {
                this.contactList.push({ classname: element.title, members: element.members })
              }
            })
          })
        }
        return
      })
  }

  dateChanged(value){
    this.date = value._d;
  }

  valueChanged(value){
    this.scheduletime = value
  }

  onEmailScheduleChange(value) {
    this.scheduleEmail = value;
  }

  onSubmit() {
    let sendto: any[] = [];
    this.contactList.forEach(element => {
      element.members.forEach(ele => {
        sendto.push(ele.memberid.property.primaryemail)
      })
    })
    if (this.scheduleEmail == 'now') {

      let model = {
        "message": {
          "to": sendto,
          "cc": '',
          "subject": this.campaignData.property.subjectline,
          "content": this.campaignData.content,
          'attachmenturl': '',
          'attachmentblob': '',
        },
        "messagetype": "EMAIL",
        "template": ''

      };
      // this._commonService
      // .communicationsend(model)
      // .then((data) => {
      //   if (data) {
      //     console.log("Data : ",data)
      //     if(this.previousUrl){
      //       this._router.navigate([this.previousUrl]);  
      //     }else{
      //       this._router.navigate([`/pages/dynamic-list/list/${this.formObj.formname}`]);
      //     }
      //     this.showNotification('top', 'right', 'Email sent successfully !!', 'success');
      //   }
      // }).catch((e)=>{
      //   this.showNotification('top', 'right', 'Something went wrong !!', 'danger');
      // });
    } else {

      let model={
        schedule: {
          scheduledate: this.date,
          scheduletime: this.scheduletime
        }
      }
      var url = "campaigns/"+this.bindId
      var method = "PATCH"
      return this._commonService
        .commonServiceByUrlMethodData(url, method, model)
        .subscribe((data: any) => {
          if (data) {
            this.showNotification('top', 'right', 'Campaign has been added successfully!!', 'success');
              this._router.navigate(["pages/dynamic-list/list/campaign"]);
          }
          return
        })
    }
  }

}
