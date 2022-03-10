import { RouterModule, Routes } from '@angular/router';
import { PackageItineraryComponent } from './package-itinerary.component';

export const Route: Routes = [
  { path: '', component: PackageItineraryComponent },
  { path: ':type/:id', component: PackageItineraryComponent }
];

export const routing = RouterModule.forChild(Route);