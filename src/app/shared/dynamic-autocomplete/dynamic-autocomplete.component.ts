import { Component, OnInit, Input, EventEmitter, Output, forwardRef, Injector } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, NgForm, FormGroupDirective, NgControl, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors, Validators, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Observable, Subject } from 'rxjs';

import { FormdataService } from '../../core/services/formdata/formdata.service';
import { LookupsService } from '../../core/services/lookups/lookup.service';
import { CommonService } from '../../core/services/common/common.service';
import { Configuration } from '../../app.constants';
import { map, startWith } from 'rxjs/operators';


export class CustomFieldErrorMatcher implements ErrorStateMatcher {
  constructor(private customControl: FormControl,private errors:any) { }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return this.customControl && this.customControl.touched &&(this.customControl.invalid || this.errors);
  }
}

class TestValidator implements Validator {

  constructor() {
    // console.log(`TestValidator.ctor()`);
  }

  // #region Validator

  validate(control: AbstractControl): ValidationErrors {
    // console.log(`TestValidator.validate(${JSON.stringify(control.value)})`);
      if (control.value !== '' && typeof control.value === 'string') {
        return { 'invalidAutocompleteObject': { value: control.value } }
      }
      return null  /* valid option selected */
  }

  // #endregion

}

@Component({
  selector: 'dynamic-autocomplete',
  templateUrl: './dynamic-autocomplete.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DynamicAutocompleteComponent),
    multi: true
  },
  { 
    provide: NG_VALIDATORS, 
    useClass: TestValidator, 
    multi: true 
  }]
})

export class DynamicAutocompleteComponent implements OnInit, ControlValueAccessor{

  @Input() MaxLength: string;
  @Input() FocusIn: boolean;
  @Input() Width: string;
  @Input() Value: string;
  @Input() type: string;
  @Input() Label: string;
  @Input() Hint: string;
  @Input() PlaceHolder: string;
  @Output() saveValue = new EventEmitter();
  @Output() onStateChange = new EventEmitter();
  @Input() errors: any = null;
  disabled: boolean;
  control = new FormControl();


  @Input() dbvalue: any;
  @Input() setting: any;
  @Input() isDisabled: boolean;
  @Input() redirectUrl: string;
  @Input() showDetail: boolean;
  @Input() htmlContent: string;
  @Output() inputModelChange = new EventEmitter<string>();
  @Output() inputModelChange2 = new EventEmitter<string>();
  displayhtmlContent: string;

  isLoadingBox: boolean = false;
  counter = 0;
  options: any[] = [];
  filteredOptions: Observable<string[]>;

  destroy$: Subject<boolean> = new Subject<boolean>();

  dataHtml: any;

  constructor(
    public injector: Injector,
    private _commonService: CommonService,
    private _lookupsService: LookupsService,
    private _formdataService: FormdataService,
    private _configuration: Configuration,
  ) {}

  async ngOnInit() {
    try {
      await this.initVariables()
      await this.loadData();
    } catch(error) {
      console.error(error);
    } finally {

      this.filteredOptions = this.control.valueChanges
      .pipe(
        startWith(''),
        map(option => typeof option === 'string' ? option : option?.autocomplete_displayname),
        map(option => option ? this.filter(option) : this.options.slice())
      );
      this.control.enable();
      if(this.isDisabled){
        this.control.disable();
      }

      
      

    }
  }

  ngAfterViewInit(): void {
    const ngControl: NgControl = this.injector.get(NgControl, null);
    if (ngControl) {
      setTimeout(() => {
        this.control = ngControl.control as FormControl;
      })
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

  saveValueAction(e) {
    this.saveValue.emit(e.target.value);
  }

  //control value accessor init
  writeValue(value: any) {
    this.Value = value ? value : '';
  }

  onChange(e) {
    this.Value = e;
  }

  onTouched() {
    this.onStateChange.emit();
  }

  registerOnChange(fn: any) { this.onChange = fn; }

  registerOnTouched(fn: any) { this.onTouched = fn; }

  setDisabledState(isDisabled) { this.disabled = isDisabled; }

  errorMatcher() {
    return new CustomFieldErrorMatcher(this.control,this.errors)
  }

  readonly errorStateMatcher: ErrorStateMatcher = {
    isErrorState: (ctrl: FormControl) => (ctrl && ctrl.invalid)
  };


  // AutoComplete Code Start 

  async initVariables() {
    this.isLoadingBox = false;
    this.options = [];
    this.counter = 0;

    if(this.setting["form"] && this.setting["form"]["template"] && this.setting["form"]["template"] !== "") {
      this.dataHtml = this.setting["form"]["template"];
    } else {
      this.dataHtml = `

    <div 
      class='media py-2 member-profile-item cursor-pointer'>

      <div class='media-body'>

          <div class='d-flex'>
              <div class='flex-grow-1'>
                  <div class='font-500 mb-1'>
                      <span> $[{autocomplete_displayname}]</span>
                      <span> | $[{customerid.fullname}]</span>
                  </div>
              </div>
              <div class='fc-today-button font-500'>
                  <i class='material-icons'> face </i>
              </div>
          </div>

          <div class='d-flex'>
              <div class='flex-grow-1'>
                  $[{customerid.property.mobile}]
              </div>
              <div class='fc-today-button font-14'>
                  $[{customerid.property.primaryemail}]
              </div>
          </div>
      </div>
  </div>`;
    }

      
    return;
  }

  async loadData() {

    if(this.setting && this.setting.fieldtype) {

      switch (this.setting.fieldtype) {
        case "form":
          await this.loadForms()
          break;
        case "lookup":
          await this.loadLookup()
          break;
        case "formdata":
          await this.loadFormdata()
          break;
        default:
          console.log("No such day exists!");
          break;
      }
    }
  }

  async loadForms() {
    
    this.isLoadingBox = true;

    let postData = {};
    postData["search"] = [];
    postData["select"] = [];

    if(this.setting && this.setting["search"]) {
      postData["search"] = this.setting["search"];
    } else {
      if (this.setting["form"]["fieldfilter"]) {
        let res = this.setting["form"]["fieldfilter"].split(".");
        if (res[0]) {
          this.setting["form"]["fieldfilter"] = res[0];
        }
        postData["search"].push({searchfield: this.setting["form"]["fieldfilter"], searchvalue: this.setting["form"]["fieldfiltervalue"], criteria: this.setting["criteria"] ? this.setting["criteria"] : "eq"});
        
      }
    }

    if(this.setting && this.setting["select"]) {
      postData["select"] = this.setting["select"];
    } else {
      if (this.setting["form"]["fieldfilter"]) {
        postData["select"].push({fieldname: this.setting["form"]["formfield"], value: 1});
        postData["select"].push({fieldname: this.setting["form"]["displayvalue"],  value: 1});
      }
    }

    if(this.setting && this.setting["sort"]) {
      postData["sort"] = this.setting["sort"];
    }

    if(this.setting && this.setting["formname"]) {
      postData["formname"] = this.setting["formname"];
    }
    
    let url =  this.setting["form"]["apiurl"] ? this.setting["form"]["apiurl"] : this.setting["apiurl"];
    let method = this.setting["method"] ? this.setting["method"] : "POST";

    return this._commonService
      .commonServiceByUrlMethodDataAsync(url, method, postData)
      .then(async (data: any) => {
        this.options = [];
        if(data) {
          data.forEach(responseData => {

            let val: any;
            let displayvalue: any;
            if (this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
              let stringValue = this.setting["form"]["displayvalue"].split(".");
              let str1 = stringValue[0];
              let str2 = stringValue[1];
              if(responseData && responseData[str1] && responseData[str1][str2]) {
                val = responseData[str1][str2];
              }
            } else {
              displayvalue = this.setting["form"]["displayvalue"];
              val = responseData[displayvalue];
            }
            let formfield = this.setting["form"]["formfield"];
            let formfieldkey = responseData[formfield];
            if(val) {
              responseData['autocomplete_id'] = formfieldkey;
              responseData['autocomplete_displayname'] = val;
              this.options.push(responseData);
            }
          });
          this.isLoadingBox = false;
          await this.filldata();
          return;
        }
    });
  }

  async loadLookup() {

    this.isLoadingBox = true;

    let postData = {};
    postData["search"] = [];
    postData["select"] = [];

    if(this.setting && this.setting["search"]) {
      postData["search"] = this.setting["search"];
    } else {
      var lookupid = this.setting.lookupid ? this.setting.lookupid : this.setting.lookupfieldid
      postData["search"].push({searchfield: "_id", searchvalue: lookupid, criteria: "eq"});
    }

    if(this.setting && this.setting["select"]) {
      postData["select"] = this.setting["select"];
    } else {
      postData["select"].push({fieldname: "_id", value: 1 });
      postData["select"].push({fieldname: "data", value: 1 });
    }

    if(this.setting && this.setting["formname"]) {
      postData["formname"] = this.setting["formname"];
    }

    return this._lookupsService
      .GetByfilterLookupNameAsync(postData)
      .then(async (data: any) => {
        if(data) {
          this.options = [];
          data.forEach(responseData => {
            if(responseData["data"] && responseData["data"].length !== 0) {
              responseData["data"].forEach((ele) => {
                ele['autocomplete_id'] = ele.code;
                ele['autocomplete_displayname'] = ele.name;
                this.options.push(ele);
              });
            }
          });
          
          this.isLoadingBox = false;
          await this.filldata();
          return;
        }
      });
  }

  async loadFormdata() {

    this.isLoadingBox = true;

    let postData = {};
    postData["search"] = [];

    if(this.setting && this.setting["search"]) {
      postData["search"] = this.setting["search"];
    } else {
      postData["search"].push({searchfield: this.setting["fieldfilter"], searchvalue: this.setting["fieldfiltervalue"], criteria: "eq"});
    }

    if(this.setting && this.setting["select"]) {
      postData["select"] = this.setting["select"];
    }

    if(this.setting && this.setting["formname"]) {
      postData["formname"] = this.setting["formname"];
    }

    return this._formdataService
      .GetByfilterAsync(postData)
      .then(async (data: any) => {

        this.options = [];

        if(data) {

          data.forEach(responseData => {

            let val: any;
            let displayvalue: any;
            if (this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
              let stringValue = this.setting["form"]["displayvalue"].split(".");
              let str1 = stringValue[0];
              let str2 = stringValue[1];
              if(responseData && responseData[str1] && responseData[str1][str2]) {
                val = responseData[str1][str2];
              }
            } else {
              displayvalue = this.setting["form"]["displayvalue"];
              
              val = responseData[displayvalue];
            }
            let formfield = this.setting["form"]["formfield"];
            let formfieldkey = responseData[formfield];
            
            
            if(val) {
              responseData['autocomplete_id'] = formfieldkey;
              responseData['autocomplete_displayname'] = val;
              this.options.push(responseData);
            }

            
          });
          this.isLoadingBox = false;
          await this.filldata();
          return;
        }
    });
  }

  async filldata() {

    if(this.dbvalue && this.dbvalue !== '' && Object.keys(this.dbvalue).length && this.counter == 0) {
      let val: any;
      let displayvalue: any;

      if(typeof this.dbvalue !== 'object') {
        
        if(this.setting.fieldtype == "lookup" && !this.setting.displayvalue) {
          this.setting.displayvalue = "code";
        }

        if(this.setting.fieldtype == "lookup" && !this.setting.formfield) {
          this.setting.formfield = "name";
        }

        var optionObj = this.options.find(p=>p[this.setting && this.setting["form"] && this.setting["form"]["formfield"] ? this.setting["form"]["formfield"] : this.setting["displayvalue"]] == this.dbvalue)
        if(optionObj) {
          this.dbvalue = {};
          this.dbvalue = optionObj;
        } else {
          return;
        }
      } 

      if (this.setting && this.setting["form"] && this.setting["form"]["displayvalue"] && this.setting["form"]["displayvalue"].indexOf(".") !== -1) {
        let stringValue = this.setting["form"]["displayvalue"].split(".");
        let str1 = stringValue[0];
        let str2 = stringValue[1];

        val = this.dbvalue[str1][str2];
      } else {
        displayvalue = this.setting && this.setting["form"] && this.setting["form"]["displayvalue"] ? this.setting["form"]["displayvalue"] : this.setting["displayvalue"];
        val = this.dbvalue[displayvalue];
      }

      let formfield = this.setting && this.setting["form"] && this.setting["form"]["formfield"] ? this.setting["form"]["formfield"] : this.setting["formfield"];
      let formfieldkey = this.dbvalue[formfield];
      this.dbvalue['autocomplete_id'] = formfieldkey;
      this.dbvalue['autocomplete_displayname'] = val;
      setTimeout(async () => {
        let obj = {
          value: this.dbvalue
        }
        await this.optionSelected(obj)  
      }, 1000);
      this.counter++;
    }
  }

  async optionSelected(option) {
    
    this.displayhtmlContent = null;
    this.control.setValue(option.value);
    this.writeValue(option.value);
    this.displayhtmlContent = this.htmlContent;
    this.displayhtmlContent = this.parseHTML(this.displayhtmlContent , option.value);
    this.inputModelChange.emit(option.value);
    this.inputModelChange2.emit(this.displayhtmlContent);
    
    return;
  }

  parseHTML(element : any , data : any) {
    
    // data['profilepic'] = `https://randomuser.me/api/portraits/women/69.jpg`;
    if(!element) return;
    //var shortcode_regex = /\[{(\w+)+\.?(\w+)\.?(\w+)\}]/mg;
    var shortcode_regex = /\[{(\w+)+\@?\.?(\w+)\@?\.?(\w+)\}]/mg; // Changes in REGEX
    var th: any = this;
    element.replace(shortcode_regex, function (match, code) {
      var replace_str = match.replace('[{', '');
      replace_str = replace_str.replace('}]', '');
      var original = replace_str;
      var datatype;

      if(replace_str.startsWith("DATE@")) {
        datatype = "Date";
        replace_str = replace_str.substring("DATE@".length)
      } else if(replace_str.startsWith("CURRENCY@")) {
        datatype = "Currency"
        replace_str = replace_str.substring("CURRENCY@".length)
      }

      var db_fieldValue;
      var fieldnameSplit = replace_str.split('.');

      if (fieldnameSplit[3]) {
        if (data[fieldnameSplit[0]]) {
          var obj = data[fieldnameSplit[0]][fieldnameSplit[1]]
          db_fieldValue = obj[fieldnameSplit[2]][fieldnameSplit[3]];
        } else {
          db_fieldValue ='';
        }
      } else if (fieldnameSplit[2]) {
        if (data[fieldnameSplit[0]]) {
          var obj = data[fieldnameSplit[0]][fieldnameSplit[1]]
          db_fieldValue = obj[fieldnameSplit[2]];
        } else {
          db_fieldValue ='';
        }
      } else if (fieldnameSplit[1]) {
        if (data[fieldnameSplit[0]]) {
          db_fieldValue = data[fieldnameSplit[0]][fieldnameSplit[1]];
        } else {
          db_fieldValue ='';
        }
      } else if (fieldnameSplit[0]) {
        if (data[fieldnameSplit[0]]) {
          db_fieldValue = data[fieldnameSplit[0]];
        } else {
          db_fieldValue ='';
        }
      }

      if (datatype && datatype == "Currency") {
        db_fieldValue = th.myCurrencyPipe.transform(db_fieldValue);
      }
      element = element.replace("@START[{" + original + "}]", db_fieldValue ? db_fieldValue : 'd-none');
      element = element.replace("$[{" + original + "}]", db_fieldValue ? db_fieldValue : '---');
    });
    
    element = element.replace("src='---'", "src='../assets/img/default-avatar.png'"); 
     
    return element;
  }

  onClick(){
    if(this.redirectUrl){
      window.open(`${this._configuration.Server}#${this.redirectUrl}`, "_blank");
    }
  }

  private filter(value: string): string[] {
    let results;
    if (value) {
      results = this.options
        .filter(option => {
          if(option.autocomplete_displayname) {
            return option.autocomplete_displayname.toLowerCase().indexOf(value.toLowerCase()) === 0
          } else {
            return;
          }
        });
        if (results.length < 1) {
          results = [];
        }
    } else {
      results = this.options.slice();
    }
    return results;
  }

  displayFn(user: any): string {
    return user && user.autocomplete_displayname ? user.autocomplete_displayname : '';
  }

  async preloaddata() {
    if (this.options.length == 0) {
      await this.loadData()
    }
  }

  enter() {
    this.displayhtmlContent = null;
    const controlValue = this.control.value;
    this.writeValue(controlValue);
  }

  handleEmptyInput(event: any) {
    if(event.target.value === '') {
      this.control.setValue("");
      this.writeValue("");
      this.displayhtmlContent = null;
      this.inputModelChange.emit("")
    }
  }

  templateParse(option: any) {

    if(this.setting.fieldtype != 'form') return option.autocomplete_displayname;

    var dataHtml = this.dataHtml.slice();

    var shortcode_regex = /\[{(\w+)+\@?\.?(\w+)\@?\.?(\w+)\}]/mg;
    
    var th: any = this;
    dataHtml.replace(shortcode_regex, function (match, code) {

      var replace_str = match.replace('[{', '');
      replace_str = replace_str.replace('}]', '');
      var original = replace_str;
      var datatype;

      if(replace_str.startsWith("DATE@")) {
        datatype = "Date";
        replace_str = replace_str.substring("DATE@".length)
      } else if(replace_str.startsWith("CURRENCY@")) {
        datatype = "Currency"
        replace_str = replace_str.substring("CURRENCY@".length)
      }

      var db_fieldValue;
      var fieldnameSplit = replace_str.split('.');

      if (fieldnameSplit[3]) {
        if (option[fieldnameSplit[0]]) {
          var obj = option[fieldnameSplit[0]][fieldnameSplit[1]]
          db_fieldValue = obj[fieldnameSplit[2]][fieldnameSplit[3]];
        } else {
          db_fieldValue ='';
        }

      } else if (fieldnameSplit[2]) {
        if (option[fieldnameSplit[0]]) {
          var obj = option[fieldnameSplit[0]][fieldnameSplit[1]]
          db_fieldValue = obj[fieldnameSplit[2]];
        } else {
          db_fieldValue ='';
        }

      } else if (fieldnameSplit[1]) {
        if (option[fieldnameSplit[0]]) {
          db_fieldValue = option[fieldnameSplit[0]][fieldnameSplit[1]];
        } else {
          db_fieldValue ='';
        }

      } else if (fieldnameSplit[0]) {
        if (option[fieldnameSplit[0]]) {
          db_fieldValue = option[fieldnameSplit[0]];
        } else {
          db_fieldValue = option[fieldnameSplit[0]] == 0 ? 0 : '';
        }

      }

      if (datatype && datatype == "Currency") {
        db_fieldValue = th.myCurrencyPipe.transform(db_fieldValue);
      } else if (datatype && datatype == "Date") {
        db_fieldValue = new Date(db_fieldValue).toLocaleDateString(th._commonService.currentLocale());
      } 
      
      dataHtml = dataHtml.replace("$[{" + original + "}]", db_fieldValue ? db_fieldValue : '---');
    });

    dataHtml = dataHtml.replace("src=---", "src='../../assets/img/default-avatar.png'");
    dataHtml = dataHtml.replace("src='---'", "src='../../assets/img/default-avatar.png'");
    dataHtml = dataHtml.replace('src="---"', "src='../../assets/img/default-avatar.png'");

    return dataHtml;
  }

}
