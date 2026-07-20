import { Routes } from '@angular/router';

import { HomePageComponent } from './components/home-page/home-page.component';
import { InstallmentRulesPageComponent } from './components/installment-rules-page/installment-rules-page.component';

export const HOME_ROUTES: Routes = [
  {
    path: '',
    component: HomePageComponent,
    data: {
      title: 'Home',
      description:
        'Login realizado com sucesso. Bem-vindo ao painel administrativo.',
    },
  },
  {
    path: 'regra-parcelamento',
    component: InstallmentRulesPageComponent,
  },
  {
    path: 'regra-bloqueio',
    component: HomePageComponent,
    data: {
      title: 'Regra de Bloqueio',
      description: 'Gerencie os criterios de bloqueio para transacoes e lojas.',
    },
  },
];
