import { Routes } from '@angular/router';
import { HomeComponent } from './features/public/home/home.component';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: 'full' }, // First route to load
    { path: 'home', component: HomeComponent, title: 'Home' },
    { path: '**', redirectTo: 'home' } // Last route to load, for 404 not found
];
