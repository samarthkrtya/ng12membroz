import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';

@Component({
  selector: 'app-contact-list',
  templateUrl: './contact-list.component.html',
  styleUrls: ['./contact-list.component.css']
})
export class ContactListComponent  extends BaseComponemntComponent  implements OnInit {

  groupList: any[] = [];
  allComplete: boolean = false;
  constructor(private _route: ActivatedRoute) {
    super();
    this._route.params.forEach((params) => {
      this.bindId = params["id"];
    });
   }

  async ngOnInit() {
    await this.getGroupList()
  }

  async getGroupList(){
    let postData = {};
    postData["search"] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" })

    var url = "groupclasses/filter"
    var method = "POST"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, postData)
      .subscribe((data: any) => {
        if (data) {
          this.groupList = data;
        }
        return
      })
  }

  updateAllComplete() {
    this.allComplete = this.groupList != null && this.groupList.every(t => t.completed);
  }

  someComplete(): boolean {
    if (this.groupList == null) {
      return false;
    }
    return this.groupList.filter(t => t.completed).length > 0 && !this.allComplete;
  }

  setAll(completed: boolean) {
    this.allComplete = completed;
    if (this.groupList == null) {
      return;
    }
    this.groupList.forEach(t => (t.completed = completed));
  }

  onSubmitContacts(){
    let groupids: any[] = []
    this.groupList.forEach(element => {
      if(element.completed){
        groupids.push(element._id)
      }
    })
    let campaignObj = {
      groupids: groupids
    }
    var url = "campaigns/" + this.bindId
    var method = "PATCH"

    return this._commonService
      .commonServiceByUrlMethodData(url, method, campaignObj)
      .subscribe(data => {
        if (data) {
          this.showNotification('top', 'right', 'Campaign Contacts Added successfully', 'success');
          this._router.navigate(["/pages/campaign/confirmation-template/" + this.bindId]);

        }
      })
  }

}
