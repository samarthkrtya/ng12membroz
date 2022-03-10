import { DatePipe, TitleCasePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { element } from 'protractor';
import { BranchModel } from 'src/app/core/models/branch/branch.model';
import { BaseComponemntComponent } from 'src/app/shared/base-componemnt/base-componemnt.component';
import { NumberToWordsPipe } from 'src/app/shared/components/number-to-words.pipe';
import { CompanySettingService } from '../../../../core/services/admin/company-setting.service';
declare var $: any;

@Component({
  selector: 'app-billitem-template',
  templateUrl: './billitem-template.component.html',
})
export class BillitemTemplateComponent extends BaseComponemntComponent implements OnInit {

  _branchModel = new BranchModel();
  billtypeDDList: any[] = [];
  billform: FormGroup;
  selectedtemplate: any;
  isEdit = false;
  selectedbilltype: string;
  _genFormatingModel: any;
  previewTitle: string;
  branchList: any
  prefix: any;
  issubmitted: boolean = false;
  istemplate: boolean
  isdisplay: boolean

  selectitem: any;
  previewHeader: any;
  previewfooter: any;
  isbdetailload: boolean = false;
  defaultlogo: any;
  prefixbranch: any;
  changeprefix: any;
  selectedValue: 0;
  selectedFood: any;
  displaylist: any


  constructor(
    public fb: FormBuilder,
    private _organizationSettings: CompanySettingService,
    private datePipe: DatePipe,
    private numberToWordsPipe: NumberToWordsPipe,
    private titleCasePipe: TitleCasePipe,

  ) {
    super();
    this.billform = fb.group({
      'prefix': [''],
      'header': [''],
      'footer': [''],
      'format': [''],
      'templatetype': ['']
    });
    this._genFormatingModel = { prefix: '', header: '', footer: '' };
  }

  async ngOnInit() {
    await super.ngOnInit()
    await this.gettemplate()
    const toSelect = this.billtypeDDList.find(c => c.property.title == 'Bill');
    this.billform.get('templatetype').setValue(toSelect);
    await this.getdata()


  }

  getdata() {
    var url = "templates/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "property.title", "searchvalue": 'Bill', "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.displaylist = data[0]
          console.log(this.displaylist)
          this.onItemSelect(this.displaylist)


          //this.billform.controls['templatetype'].setValue(this.displaylist.property.title);
          this.billform.controls['header'].setValue(this.displaylist.template.header);
          this.billform.controls['footer'].setValue(this.displaylist.template.footer);
        }
      })
  }

  async gettemplate() {
    this.istemplate = true
    var url = "templates/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "status", "searchvalue": "active", "criteria": "eq" });

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.istemplate = false

          data.forEach(element => {
            if (element && element.property) {
              this.billtypeDDList.push(element);
              // console.log(this.billtypeDDList)
            }
          })
          /*  this.selectedFood = this.billtypeDDList[0].property.title;
           console.log(this.selectedFood) */
        }
      })
  }

  async getOrganizationSetting() {
    return this._organizationSettings
      .GetAll()
      .subscribe(data => {
        if (data) {
          if (data[0] != undefined) {
            if (data[0].logo != undefined && data[0].logo != "") {
              this.defaultlogo = data[0].logo;
              //this.branchList.branchlogo = data[0].logo;
            }
          }
        }
        this.getBranchDetails();
      }, data => {
        this.getBranchDetails()
      });
  }

  async getBranchDetails() {
    this.isbdetailload = true;
    this.isdisplay = true;

    var url = "branches/filter";
    var method = "POST";
    let postData = {};
    postData['search'] = [];
    postData["search"].push({ "searchfield": "branchname", "searchvalue": this._loginUserBranch.branchname, "criteria": "eq" });
    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then((data: any) => {
        if (data) {
          this.isdisplay = false;
          this.branchList = {}
          this.branchList.branchid = data[0]
          //console.log("branhc", this.branchList.branchid)
          if (this.branchList.branchid.branchlogo == undefined) {
            this.branchList.branchid.branchlogo = this.defaultlogo;
          }
          const mapped = Object.keys(this.branchList.branchid['docformat']).map(key => ({ type: key, value: this.branchList.branchid['docformat'][key] }));
          this.prefixbranch = mapped
          mapped.forEach(ele => {
            if (ele.type == this.selectedtemplate) {
              this.prefix = ele.value.prefix
            }
          })
          console.log(this.prefix)
          if (this.selectedbilltype) {
            this._genFormatingModel.prefix = this.prefix
            this.previewTitle = this.selectitem.property.title;

            this._genFormatingModel.header = this.selectitem.template.header
            this._genFormatingModel.footer = this.selectitem.template.footer


            this.previewHeader = this.regexrep(this._genFormatingModel.header, this.branchList, undefined);
            this.previewfooter = this.regexrep(this._genFormatingModel.footer, this.branchList, undefined)

          }
        }
      })
  }

  regexrep(str: any, obj: any, history: any) {
    var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
    var th = this;
    str.replace(shortcode_regex, function (match, code) {
      var replace_str = match.replace('[{', '');
      replace_str = replace_str.replace('}]', '');
      var db_fieldValue;
      var fieldnameSplit = replace_str.split('.');
      if (fieldnameSplit[1] == undefined || fieldnameSplit[1] == null) {
        var fieldname1 = fieldnameSplit[0];
        if (obj && obj[fieldname1]) {
          if (Object.prototype.toString.call(obj[fieldname1]) == '[object Array]') {
            if (obj[fieldname1][0] != undefined && obj[fieldname1][0].attachment != undefined)
              db_fieldValue = obj[fieldname1][0].attachment;
          } else if (fieldname1 == 'membershipstart' || fieldname1 == 'membershipend' || fieldname1 == 'createdAt' || fieldname1 == 'paymentdate' || fieldname1 == 'billingdate' || fieldname1 == 'scheduledate') {
            db_fieldValue = th.datePipe.transform(obj[fieldname1], th.gDateFormat);
          } else if (fieldname1 == 'paidamount') {
            db_fieldValue = th.numberToWordsPipe.transform(obj[fieldname1]);
            db_fieldValue = th.titleCasePipe.transform(db_fieldValue);
          } else {
            db_fieldValue = obj[fieldname1];
          }
        }
        else db_fieldValue = '';
      }
      else if (fieldnameSplit[2] == undefined || fieldnameSplit[2] == null) {
        var fieldname1 = fieldnameSplit[0];
        var fieldname2 = fieldnameSplit[1];

        if (obj && obj[fieldname1] && obj[fieldname1][fieldname2]) {
          if (Object.prototype.toString.call(obj[fieldname1][fieldname2]) == '[object Array]') {
            if (obj[fieldname1][fieldname2][0] != undefined && obj[fieldname1][fieldname2][0].attachment != undefined)
              db_fieldValue = obj[fieldname1][fieldname2][0].attachment;

          } else if (fieldname2 == 'membershipstart' || fieldname2 == 'membershipend' || fieldname2 == 'createdAt' || fieldname2 == 'paymentdate' || fieldname2 == 'billingdate' || fieldname2 == 'scheduledate') {
            db_fieldValue = th.datePipe.transform(obj[fieldname1][fieldname2], th.gDateFormat);
          } else if (fieldname2 == 'paidamount') {
            db_fieldValue = th.numberToWordsPipe.transform(obj[fieldname1][fieldname2]);
            db_fieldValue = th.titleCasePipe.transform(db_fieldValue);
          } else {
            db_fieldValue = obj[fieldname1][fieldname2];
          }

        }
        else if (history && history[fieldname1] && history[fieldname1][fieldname2]) {
          db_fieldValue = history[fieldname1][fieldname2];
        }

        for (var key in history) {
          var subfield = key.substr(4);
          var obj1 = history[key];
          if (fieldname1 == subfield && obj1[fieldname2]) {
            db_fieldValue = obj1[fieldname2];
          }
        }

      } else {

        var fieldname1 = fieldnameSplit[0];
        var fieldname2 = fieldnameSplit[1];
        var fieldname3 = fieldnameSplit[2];
        if (obj && obj[fieldname1] && obj[fieldname1][fieldname2] && obj[fieldname1][fieldname2][fieldname3]) {
          db_fieldValue = obj[fieldname1][fieldname2][fieldname3];
        } else {
          db_fieldValue = '';
        }
      }
      if (db_fieldValue) {
        str = str.replace("$[{" + replace_str + "}]", db_fieldValue);
      }
      else {
        str = str.replace("$[{" + replace_str + "}]", "xxxxx");
      }

    });
    return str;
  }

  onItemSelect(item: any) {
    console.log(item)
    this.selectitem = item; //alldata
    this.selectedtemplate = item.templatetype;
    this._genFormatingModel = { prefix: '', header: '', footer: '' };
    this.getOrganizationSetting()
  }

  enableEditMode() {
    this.isEdit = true;
  }

  disableEditMode() {
    this.isEdit = false;
    this.getBranchDetails();
  }

  onSubmit(item: any) {
    //console.log(this.prefixbranch)
    this.issubmitted = true;

    var url = "templates/" + this.selectitem._id;
    var method = "PATCH";
    var model = {};
    model['template'] = {};
    model['template'] = {
      'header': this._genFormatingModel.header,
      'footer': this._genFormatingModel.footer,
    };
    console.log(model)
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, model)
      .then((data: any) => {
        if (data) {
          super.showNotification('top', 'right', "Template Updated Successfullyyy !!", 'success');
          this.issubmitted = false;
          this.submitprefix()
        }
      })
  }

  submitprefix() {
    this.prefixbranch.forEach(element => {
      if (element.type == this.selectedtemplate) {
        element.value.prefix = this._genFormatingModel.prefix
        console.log(element.value.prefix)
        this.changeprefix = element.value.prefix
      }
      if (element.type == this.prefixbranch.type) {
        this.prefixbranch.value.prefix = element.value.prefix
      }
    })

    var url = "branches/" + this.branchList.branchid._id;
    var method = "PATCH";
    var postdata = {
      'docformat': this.branchList.branchid.docformat
    }
    this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postdata)
      .then((data: any) => {
        if (data) {
          console.log(data)
          location.reload()
        }
      })
  }
}





