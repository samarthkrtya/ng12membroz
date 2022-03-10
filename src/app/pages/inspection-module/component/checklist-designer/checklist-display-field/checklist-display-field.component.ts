import { Component, OnInit, Input, ViewChild } from '@angular/core';
import {FormControl} from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { BaseLiteComponemntComponent } from '../../../../../shared/base-componemnt/base-lite-componemnt/base-lite-componemnt.component';

import { SearchCountryField, CountryISO } from 'ngx-intl-tel-input';

import {
  NgxSignaturePadComponent,
  SignaturePadOptions
  } from "@o.krucheniuk/ngx-signature-pad";


  interface Pokemon {
    value: string;
    viewValue: string;
  }
  
  interface PokemonGroup {
    disabled?: boolean;
    name: string;
    pokemon: Pokemon[];
  }

import swal from 'sweetalert2';
declare var $: any;
@Component({
  selector: 'app-checklist-display-field',
  templateUrl: './checklist-display-field.component.html',
  styles: [
    `
    ::ng-deep .mat-select-panel .mat-pseudo-checkbox {
          border: 2px solid !important;
        }
    `
  ]
})
export class ChecklistDisplayFieldComponent extends BaseLiteComponemntComponent implements OnInit  {

  destroy$: Subject<boolean> = new Subject<boolean>();

  @Input() item: any;

  separateDialCode = true;
  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedStates, CountryISO.UnitedKingdom];


  @ViewChild("testPad", { static: true }) signaturePadElement: NgxSignaturePadComponent;

  config: SignaturePadOptions = {
    minWidth: 1,
    maxWidth: 10,
    penColor: "blue"
  };

  pokemonControl = new FormControl();

  pokemonGroups: PokemonGroup[] = [
    {
      name: 'Grass',
      pokemon: [
        {value: 'bulbasaur-0', viewValue: 'Bulbasaur'},
        {value: 'oddish-1', viewValue: 'Oddish'},
        {value: 'bellsprout-2', viewValue: 'Bellsprout'}
      ]
    },
    {
      name: 'Water',
      pokemon: [
        {value: 'squirtle-3', viewValue: 'Squirtle'},
        {value: 'psyduck-4', viewValue: 'Psyduck'},
        {value: 'horsea-5', viewValue: 'Horsea'}
      ]
    },
    {
      name: 'Fire',
      disabled: true,
      pokemon: [
        {value: 'charmander-6', viewValue: 'Charmander'},
        {value: 'vulpix-7', viewValue: 'Vulpix'},
        {value: 'flareon-8', viewValue: 'Flareon'}
      ]
    },
    {
      name: 'Psychic',
      pokemon: [
        {value: 'mew-9', viewValue: 'Mew'},
        {value: 'mewtwo-10', viewValue: 'Mewtwo'},
      ]
    }
  ];

  currentRate = 0;


  constructor() {
    super()
   }

  async ngOnInit() {

    try {
      await super.ngOnInit()
    } catch (error) {
      console.error(error)
    } finally {
      
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    // Unsubscribe from the subject
    this.destroy$.unsubscribe();
  }

  public clear() {
    this.signaturePadElement.clear();
  }

  public getImage() {
    
  }

  public changeConfig() {
    this.config.penColor = Math.random() >= 0.5 ? "black" : "red";
    this.config.maxWidth = Math.random() * 10;
    this.config = Object.assign({}, this.config);
  }

  public isInValid(): boolean {
    return !(this.signaturePadElement && !this.signaturePadElement.isEmpty());
  }

  public forceReload() {
    this.signaturePadElement.forceUpdate();
  }

}
