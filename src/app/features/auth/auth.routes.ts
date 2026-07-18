import { Routes } from '@angular/router';

import { LoginPageComponent } from './components/login-page/login-page.component';
import { StoreRegistrationPageComponent } from './components/store-registration-page/store-registration-page.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: LoginPageComponent,
  },
  {
    path: 'primeiro-acesso',
    component: StoreRegistrationPageComponent,
  },
];
