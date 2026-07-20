import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthSessionService } from '../../../../services/auth-session.service';
import { InstallmentRule } from '../../interfaces/installment-rule.interface';
import { InstallmentRulesService } from '../../services/installment-rules.service';

@Component({
  selector: 'app-installment-rules-page',
  imports: [ReactiveFormsModule, RouterLink, RouterLinkActive],
  templateUrl: './installment-rules-page.component.html',
  styleUrl: './installment-rules-page.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstallmentRulesPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authSessionService = inject(AuthSessionService);
  private readonly installmentRulesService = inject(InstallmentRulesService);

  readonly isLoading = signal(true);
  readonly isSubmitting = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly submitSuccess = signal<string | null>(null);
  readonly rules = signal<InstallmentRule[]>([]);

  readonly ruleForm = this.formBuilder.nonNullable.group({
    discount: ['', [Validators.required]],
    installments: ['', [Validators.required]],
    minimumValue: ['', [Validators.required]],
  });

  constructor() {
    this.loadRules();
  }

  get hasRules(): boolean {
    return this.rules().length > 0;
  }

  get discountControl() {
    return this.ruleForm.controls.discount;
  }

  get installmentsControl() {
    return this.ruleForm.controls.installments;
  }

  get minimumValueControl() {
    return this.ruleForm.controls.minimumValue;
  }

  onMinimumValueInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digitsOnly = input.value.replace(/\D/g, '');
    const numericValue = Number(digitsOnly) / 100;

    if (digitsOnly.length === 0) {
      this.ruleForm.controls.minimumValue.setValue('');
      return;
    }

    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);

    this.ruleForm.controls.minimumValue.setValue(formattedValue);
  }

  onEdit(ruleId: string): void {
    this.loadError.set(`Edicao da regra ${ruleId} ainda nao foi implementada.`);
  }

  onRemove(ruleId: string): void {
    this.loadError.set(
      `Remocao da regra ${ruleId} ainda nao foi implementada.`,
    );
  }

  onLogout(): void {
    this.authSessionService.clearSession();
    void this.router.navigate(['/']);
  }

  onClear(): void {
    this.ruleForm.reset({
      discount: '',
      installments: '',
      minimumValue: '',
    });
    this.loadError.set(null);
    this.submitSuccess.set(null);
  }

  onSubmit(): void {
    if (this.ruleForm.invalid) {
      this.ruleForm.markAllAsTouched();
      this.submitSuccess.set(null);
      this.loadError.set(null);
      return;
    }

    const storeId = this.installmentRulesService.getLoggedStoreId();

    if (!storeId) {
      this.loadError.set(
        'Store ID do usuario logado nao encontrado. Faca login novamente.',
      );
      this.submitSuccess.set(null);
      return;
    }

    const payload = {
      installments: this.parseIntegerValue(
        this.installmentsControl.getRawValue(),
      ),
      fees: this.parseDecimalValue(this.discountControl.getRawValue()),
      minimalAmount: this.parseCurrencyToNumber(
        this.minimumValueControl.getRawValue(),
      ),
      storeId: storeId,
    };

    this.isSubmitting.set(true);
    this.loadError.set(null);
    this.submitSuccess.set(null);

    this.installmentRulesService
      .createStoreConfig(payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.submitSuccess.set('Regra cadastrada com sucesso.');
          this.loadRules();
        },
        error: (error: HttpErrorResponse) => {
          this.submitSuccess.set(null);
          this.loadError.set(
            this.getRequestErrorMessage(error) ??
              'Nao foi possivel cadastrar a regra de parcelamento.',
          );
        },
      });
  }

  private loadRules(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.installmentRulesService
      .getStoreConfig()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const apiRules: InstallmentRule[] = [
            {
              id: response.id,
              discount: response.fees,
              installments: response.installments,
              minimumValue: this.formatCurrencyValue(response.minimalAmount),
            },
          ];

          this.rules.set(apiRules);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.loadError.set(
            'Nao foi possivel carregar as regras de parcelamento.',
          );
          this.rules.set([]);
        },
      });
  }

  private parseCurrencyToNumber(value: string): number {
    const digitsOnly = value.replace(/\D/g, '');

    if (!digitsOnly) {
      return 0;
    }

    return Number(digitsOnly) / 100;
  }

  private formatCurrencyValue(value: unknown): string {
    const numericValue = typeof value === 'number' ? value : Number(value);

    if (!Number.isFinite(numericValue)) {
      return 'R$ 0,00';
    }

    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
  }

  private parseDecimalValue(value: string): number {
    const normalizedValue = value.replace('%', '').trim().replace(',', '.');
    const parsedValue = Number(normalizedValue);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private parseIntegerValue(value: string): number {
    const parsedValue = Number.parseInt(value, 10);

    return Number.isFinite(parsedValue) ? parsedValue : 0;
  }

  private getRequestErrorMessage(error: HttpErrorResponse): string | null {
    if (!error.error) {
      return null;
    }

    if (typeof error.error === 'string') {
      return error.error;
    }

    if (
      typeof error.error === 'object' &&
      error.error !== null &&
      'message' in error.error &&
      typeof error.error.message === 'string'
    ) {
      return error.error.message;
    }

    return null;
  }
}
