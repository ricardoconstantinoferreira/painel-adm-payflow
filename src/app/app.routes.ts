import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./features/home/home.routes').then(
        (module) => module.HOME_ROUTES,
      ),
  },
  {
    path: '',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(
        (module) => module.AUTH_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
