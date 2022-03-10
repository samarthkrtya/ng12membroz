import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { takeUntil } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { CommonService } from '../../../../../../core/services/common/common.service';
import { BaseLiteComponemntComponent } from '../../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

@Component({
  selector: 'app-dynamic-document-preview',
  templateUrl: './dynamic-document-preview.component.html',
  styles: [
  ]
})
export class DynamicDocumentPreviewComponent extends BaseLiteComponemntComponent implements OnInit {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() formid: any;
  @Output() onDynamicFormData = new EventEmitter();

  formfields: any [] = [];
  doctemplate: any;

  constructor(
    private _commonService: CommonService
  ) {
    super()
  }


  async ngOnInit() {
    try {
      await super.ngOnInit()
      await this.initializeVariables()
      await this.LoadData();
      await this.getLoadForm();
    } catch(error) {

    } finally {

    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  async initializeVariables() {
    this.formfields = [];
    this.doctemplate = {};
    return;
  }

  async LoadData() {

    var url = "formfields/filter";
    var method = "POST";

    let postData = {};
    postData['search'] = [];
    postData["search"].push({"searchfield": "formname", "searchvalue": this.formid.formname, "criteria": "eq" });
    postData["search"].push({"searchfield": "status", "searchvalue": "active", "criteria": "eq"});

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then( (data: any) => {
        if(data) {
          this.formfields = [];
          this.formfields = data;
          console.log("formfields", this.formfields);
          return;
        }
    }, (error) =>{
      console.error(error);
    });
  }

  async getLoadForm() {

    this.doctemplate = {};

    if(this.formid && this.formid["doctemplate"]) {

      this.doctemplate = this.formid["doctemplate"];

      var shortcode_regex_constant = /\[(\w+)+\.?(\w+)\.?(\w+)\]/mg;
      var th_constant: any = this;

      this.doctemplate.replace(shortcode_regex_constant, function (match_constant, code_constant) {
      var replace_str_constant = match_constant.replace('[', '');
      replace_str_constant = replace_str_constant.replace(']', '');
        if(replace_str_constant == "branchlogo" && th_constant._loginUserBranch && th_constant._loginUserBranch.branchlogo) {
          var branchlogo = th_constant._loginUserBranch.branchlogo
          var string_value = "<img id='" + replace_str_constant +"' src='"+ branchlogo +"' style='max-height: 150px; max-width: 200px;''>";
          th_constant.doctemplate = th_constant.doctemplate.replace("$[" + replace_str_constant + "]", string_value);
        }
      });

      var shortcode_regex_user = /\[\((\w+)+\.?(\w+)\.?(\w+)\)]/mg;
      var th_user: any = this;
      this.doctemplate.replace(shortcode_regex_user, function (match_user, code_user) {
        var replace_str_user = match_user.replace('[(', '');
        replace_str_user = replace_str_user.replace(')]', '');
        //console.log("replace_str_user", replace_str_user);

        let res = replace_str_user.split(".");

        if (res[1]) {
          if(th_user._loginUser[res[0]][res[1]]) {
            var string_value = `<span style='background-color: yellow'>${th_user._loginUser[res[0]][res[1]]}</span>`;
            th_user.doctemplate = th_user.doctemplate.replace("$[(" + replace_str_user + ")]", string_value);
          }
        } else {
          if(th_user._loginUser[replace_str_user]) {
            var string_value = `<span style='background-color: yellow'>${th_user._loginUser[replace_str_user]}</span>`;
            th_user.doctemplate = th_user.doctemplate.replace("$[(" + replace_str_user + ")]", string_value);
          }
        }


      });

      var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;

      var th: any = this;
      this.doctemplate.replace(shortcode_regex, function (match: any, code: any) {

        var replace_str = match.replace('[{', '');
        replace_str = replace_str.replace('}]', '');

        var formcontrol: any;

        var formfieldObj = th.getformfieldObj(replace_str)

        if(formfieldObj) {

          var textDisplay: any;
          var htmlTemplate = "";

          if(formfieldObj.fieldtype == "text") {
            var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
            htmlTemplate = "<input type='text' name='attributename_" + replace_str +"' id='" + replace_str +"' value='"+ value +"'>"
          } else if (formfieldObj.fieldtype == "checkbox") {

            var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
            if(formfieldObj.lookupdata && formfieldObj.lookupdata.length > 0) {
              formfieldObj.lookupdata.forEach(element => {
                var checkedString = '';
                if(value && value.length > 0) {
                  var valueObj = value.find(p=>p == element.key);
                  if(valueObj)  checkedString = 'checked="checked"';
                }
                htmlTemplate += " <input type='checkbox' name='attributename_"+replace_str+"' id='" + replace_str +"' "+ checkedString +">"
              });
            }
          } else if (formfieldObj.fieldtype == "datepicker") {

            var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';

            htmlTemplate = "<input type='date' name='attributename_" + replace_str +"' id='" + replace_str +"' value='"+ th.convertDate(value) +"' style='" + th.getDayClassNames(value) +  "'>"


          } else if (formfieldObj.fieldtype == "lookup" || formfieldObj.fieldtype == "form") {
            var value = formfieldObj && formfieldObj.value && formfieldObj.value.autocomplete_displayname ? formfieldObj.value.autocomplete_displayname : formfieldObj && formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
            htmlTemplate = "<input type='text' id='" + replace_str +"' value='"+ value +"'>"
          } else if (formfieldObj.fieldtype == "signaturepad") {

            var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
            if(value == "") {
              htmlTemplate = "<input type='text' id='" + replace_str +"' val='"+ value +"' placeholder='Signature ....' style='border: 0; border-bottom: 1px solid #000; height:100px; font-size:14pt;'>"
            } else {
              htmlTemplate = "<img id='" + replace_str +"' src='"+ value +"' style='height: 100px; width: 100px'>"
            }


          } else if (formfieldObj.fieldtype == "list") {

            var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
            var checkedString = '';
            var optionString = "";

            optionString += "<option value=''></option>";

            if(formfieldObj.lookupdata && formfieldObj.lookupdata.length > 0) {
              formfieldObj.lookupdata.forEach(elementLookup => {
                if(value == elementLookup.value) {
                  checkedString = "selected"
                }
                optionString += "<option value='"+ elementLookup.value +"' "+ checkedString +">"+ elementLookup.value +"</option>"
              });
            }

            htmlTemplate = "<select name='attributename_" + replace_str +"' id='" + replace_str +"'> "+ optionString +" </select>"
          } else {
            var value = formfieldObj && formfieldObj.value ? formfieldObj.value : '';
            htmlTemplate = "<input type='text' id='" + replace_str +"' value='"+ value +"'>"
          }

          if(formfieldObj.fieldtype == "mobile" || formfieldObj.fieldtype == "alternatenumber" || formfieldObj.fieldtype == "whatsappnumber") {
            textDisplay = formfieldObj && formfieldObj.value && formfieldObj.value.number ? formfieldObj.value.number : formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
          } else if (formfieldObj.fieldtype == "lookup" || formfieldObj.fieldtype == "form") {
            textDisplay = formfieldObj && formfieldObj.value && formfieldObj.value.autocomplete_displayname ? formfieldObj.value.autocomplete_displayname : formfieldObj && formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
          } else {
            textDisplay = formfieldObj && formfieldObj.value ? formfieldObj.value : formfieldObj.displayname
          }


          if(th.btnDisable) {
            formcontrol = `<span id="${replace_str}">${htmlTemplate}</span>`;
          } else {
            formcontrol = `<a id="${replace_str}">${htmlTemplate}</a>`;
          }

        }

        if (formcontrol) {
          th.doctemplate = th.doctemplate.replace("$[{" + replace_str + "}]", formcontrol);
        }

      });
    }
    return;
  }

  getformfieldObj(id: any) {
    return this.formfields.find(p=>p._id == id)
  }

  convertDate(inputFormat) {
    function pad(s) { return (s < 10) ? '0' + s : s; }
    var d = new Date(inputFormat)
    return [d.getFullYear(), pad(d.getMonth()+1), pad(d.getDate())].join('-')
  }

  getDayClassNames(value: any) {
    if(value == "") {
      return "color: transparent"
    } else {
      return "color: black";
    }
  }

}
