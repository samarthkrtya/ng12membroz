import { Component, OnInit, Input, EventEmitter, Output, forwardRef, Injector } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, NgForm, FormGroupDirective, NgControl, NG_VALIDATORS, Validator, AbstractControl, ValidationErrors, Validators, ValidatorFn } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Subject } from 'rxjs';


import { CommonService } from '../../core/services/common/common.service';
import { Configuration } from '../../app.constants';
import { debounceTime, finalize, switchMap, tap } from 'rxjs/operators';

export class CustomFieldErrorMatcher implements ErrorStateMatcher {
  constructor(private customControl: FormControl,private errors:any) { }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return this.customControl && this.customControl.touched &&(this.customControl.invalid || this.errors);
  }
}

class TestValidator implements Validator {

  constructor() {
    
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
  selector: 'app-dynamic-autocomplete-ondemand',
  templateUrl: './dynamic-autocomplete-ondemand.component.html',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => DynamicAutocompleteOndemandComponent),
    multi: true
  },
  { 
    provide: NG_VALIDATORS, 
    useClass: TestValidator, 
    multi: true 
  }]
})
export class DynamicAutocompleteOndemandComponent implements OnInit, ControlValueAccessor {

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
  filteredOptions: any;

  destroy$: Subject<boolean> = new Subject<boolean>();

  dataHtml: any;

  postData: any = {};
  url: any;
  method: any;


  constructor(
    public injector: Injector,
    private _commonService: CommonService,
    private _configuration: Configuration,
  ) {}

  async ngOnInit() {

    try {
      this.initVariables()
    } catch(error) {
      console.error(error);
    } finally {
      this.control.enable();
      if(this.isDisabled){
        this.control.disable();
      }

      console.log("setting", this.setting);
      console.log("dbvalue", this.dbvalue);
      
      if(this.dbvalue) {
        await this.filldata();
      }
    }
  }

  async initVariables() {

    this.isLoadingBox = false;
    this.options = [];
    this.counter = 0;

    this.url = "";
    this.method = "";
    this.postData = {};

    this.postData["search"] = [];
    this.postData["select"] = [];

    if(this.setting && this.setting["search"]) {
      this.postData["search"] = this.setting["search"];
    } else {
      if (this.setting["form"]["displayvalue"]) {
        let res = this.setting["form"]["displayvalue"].split(".");
        if (res[0]) {
          this.setting["form"]["displayvalue"] = res[0];
        }
        this.postData["search"].push({searchfield: this.setting["form"]["displayvalue"], searchvalue: "", criteria: "lk", datatype: "text"});
      }
    }

    if(this.setting && this.setting["select"]) {
      this.postData["select"] = this.setting["select"];
    } else {
      if (this.setting["form"]["displayvalue"]) {
        this.postData["select"].push({fieldname: this.setting["form"]["formfield"], value: 1});
        this.postData["select"].push({fieldname: this.setting["form"]["displayvalue"], value: 1});
      }
    }

    if(this.setting && this.setting["sort"]) {
      this.postData["sort"] = this.setting["sort"];
    }

    if(this.setting && this.setting["formname"]) {
      this.postData["formname"] = this.setting["formname"];
    }
    
    this.url =  this.setting["form"]["apiurl"] ? this.setting["form"]["apiurl"] : this.setting["apiurl"];
    this.method = this.setting["method"] ? this.setting["method"] : "POST";

    console.log("postData", this.postData)
    console.log("url", this.url)
    console.log("method", this.method)

  }

  ngAfterViewInit(): void {
    const ngControl: NgControl = this.injector.get(NgControl, null);
    if (ngControl) {
      setTimeout(() => {
        this.control = ngControl.control as FormControl;

        if(!this.isDisabled) {

          this.control.valueChanges
          .pipe(
            debounceTime(500),
            tap((item)=>{
              this.filteredOptions = [];
              if(item.length == 0) {
                this.isLoadingBox = false;
              } else {
                this.isLoadingBox = true;
              }
            }),
            switchMap((value) => 
              value.length > 2
              ? this._commonService
                .commonServiceByUrlMethodDataObservable(value, this.url, this.method, this.postData)
                .pipe(
                  finalize(() => {
                    this.isLoadingBox = false
                  }),
                )
              : []
            )
          )
          .subscribe(data => {
            this.filteredOptions = [];

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
                this.filteredOptions.push(responseData);
              }
            });
          });

        }
        

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

  handleEmptyInput(event: any) {
    if(event.target.value === '') {
      this.control.setValue("");
      this.writeValue("");
      this.displayhtmlContent = null;
      this.inputModelChange.emit("")
    }
  }

  displayFn(user: any): string {
    return user && user.autocomplete_displayname ? user.autocomplete_displayname : '';
  }

  optionSelected(option: any) {
    this.displayhtmlContent = null;
    this.control.setValue(option.value);
    console.log("myControl", this.control);
    this.writeValue(option.value);
    this.displayhtmlContent = this.htmlContent;
    this.displayhtmlContent = this.parseHTML(this.displayhtmlContent , option.value);
    this.inputModelChange.emit(option.value);
    this.inputModelChange2.emit(this.displayhtmlContent);
  }

  enter() {
    this.displayhtmlContent = null;
    const controlValue = this.control.value;
    this.writeValue(controlValue);
  }

  onClick(){
    if(this.redirectUrl){
      window.open(`${this._configuration.Server}#${this.redirectUrl}`, "_blank");
    }
  }

  parseHTML(element : any , data : any) {
    
    if(!element) return;
    var shortcode_regex = /\[{(\w+)+\@?\.?(\w+)\@?\.?(\w+)\}]/mg;
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

}
