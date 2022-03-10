import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BaseLiteComponemntComponent } from '../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

declare var $: any;
@Component({
  selector: 'app-import-mapping-fields',
  templateUrl: './import-mapping-fields.component.html'
})
export class ImportMappingFieldsComponent extends BaseLiteComponemntComponent implements OnInit {

  _tabLists: any [] = [];
  _mappingData: any [] = [];
  mandtoryFieldCount: number;
  submitBtnDisable: boolean = false;

  requiredFieldNeedtoMap: any [] = [];

  constructor() {
    super();
   }

  @Input('fieldLists') fieldListsValue: any[] = [];
  @Input('importdatas') importdatas: any[] = [];
  @Input('importFields') importFieldsValue: any[] = [];
  @Input('returnUrl') returnUrlValue: any;
  @Input('formId') formId: any;
  @Output() mappingSubmitData: EventEmitter<any> = new EventEmitter<any>();

  async ngOnInit() {

    super.ngOnInit();

    
    
    this.submitBtnDisable = false;

    this.fieldListsValue = this.fieldListsValue.sort(function(a, b) {
      return b.isAsterisk - a.isAsterisk
    });
    
    this.importFieldsValue.forEach(element => {
      
      var autoMap = {};
      autoMap['fieldname'] = "";
      autoMap['datatype'] = "";
      autoMap['mandatory'] = "";

      this.fieldListsValue.forEach(elementSchema => {
        var fieldnameSchema: any;
        if (elementSchema.datafield.indexOf(".")>0){
          let prop = elementSchema.datafield.split(".")
          fieldnameSchema = prop[1];
        } else {
          fieldnameSchema = elementSchema.datafield;
        }

        
        //if(fieldnameSchema == element) {
        if(fieldnameSchema.includes(element)) {
         autoMap['fieldname'] = elementSchema.datafield;
         autoMap['datatype'] = elementSchema.datatype;
         autoMap['mandatory'] = elementSchema.mandatory;
        }
      });

      let obj = { 
        fieldname: autoMap['fieldname'], 
        datafield: element, 
        datatype: autoMap['datatype'], 
        mandatory: autoMap['mandatory'], 
        data: this.getData(element) 
      }
      this._tabLists.push(obj);
    });
  }

  groupBy(collection: any, property: any) {
    let i = 0, val, index,
      values = [], result = [];
    for (; i < collection.length; i++) {
      val = collection[i][property];
      index = values.indexOf(val);
      if (index > -1) {
        result[index].push(collection[i]);
      } else {
        values.push(val);
        result.push([collection[i]]);
      }
    }
    return result;
  }

  mapping() {
    this.submitBtnDisable = true;
    
    
    this._mappingData = [];
    this.requiredFieldNeedtoMap = [];
    
    var failed = false;

    this.fieldListsValue.forEach(element => {
      if(element.mandatory) {
        var tabObj = this._tabLists.find(p=>p.fieldname == element.datafield);
        if(!tabObj) {
          failed = true;
          this.requiredFieldNeedtoMap.push(element.datafield);
        }
      }
    });

    if(failed == false) {
      this._tabLists.forEach(element => {
        let obj = { fieldname: element.datafield, datafield: element.fieldname, datatype: element.datatype, mandatory: element.mandatory }
        this._mappingData.push(obj)
      });
      
      var checkfield = this._mappingData.filter(p=>p.datafield == "");
      
      if(checkfield.length == this._mappingData.length) {
        this.showNotification('top', 'right', 'You need to map atleast one field !!!', 'danger');
        return;
      }
      this.mappingSubmitData.emit(this._mappingData);
    } else {
      this.submitBtnDisable = false;
      this.showNotification('top', 'right', 'Required fields must be mapped!!!', 'danger');
    }
  }

  getData(field: any) {
    var data = [];
    this.importdatas.forEach(element => {
      for (const property in element) {
        if(property == field && data.length < 3) {
          data.push(element[property])
        }
      }
    });
    return data;
  }

  someMethod(field: any) {
    var fieldObj = this.fieldListsValue.find(p=>p.datafield == field.fieldname);
    if(fieldObj) {
      this._tabLists.forEach(element => {
        if(element.datafield == field.datafield) {
          element.datatype = fieldObj.datatype;
          element.mandatory = fieldObj.mandatory;
        }
      });
    }
  }

}
